import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "../proxy";

const req = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`https://eviq.test${path}`, { headers });

describe("proxy", () => {
  it("rewrites pages to coming-soon and 403s the API for visitors outside India", async () => {
    const page = proxy(req("/map", { "x-vercel-ip-country": "US" }));
    expect(page.headers.get("x-middleware-rewrite")).toContain("/coming-soon");
    const api = proxy(req("/api/v1/stations", { "x-vercel-ip-country": "US" }));
    expect(api.status).toBe(403);
  });

  it("lets Indian visitors and visitors with no country header through", () => {
    expect(
      proxy(req("/map", { "x-vercel-ip-country": "IN" })).headers.get("x-middleware-next")
    ).toBe("1");
    expect(proxy(req("/map")).headers.get("x-middleware-next")).toBe("1");
  });

  it("/india sets the preview cookie and sends the visitor to the map", () => {
    const res = proxy(req("/india", { "x-vercel-ip-country": "US" }));
    expect(res.headers.get("location")).toBe("https://eviq.test/map");
    expect(res.headers.get("set-cookie")).toContain("eviq_india_preview=1");
  });

  it("the preview cookie lifts the block", () => {
    const res = proxy(
      req("/api/v1/stations", { "x-vercel-ip-country": "US", cookie: "eviq_india_preview=1" })
    );
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});
