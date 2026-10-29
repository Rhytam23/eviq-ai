import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "..");
const spec = readFileSync(path.join(ROOT, "docs", "openapi.yaml"), "utf8");

/** Paths declared in docs/openapi.yaml, e.g. /api/v1/stations/{id}/reports */
const declared = [...spec.matchAll(/^ {2}(\/[^\s:]+):\s*$/gm)].map((m) => m[1]);

describe("docs/openapi.yaml", () => {
  it("declares the v1 endpoints", () => {
    expect(declared).toEqual([
      "/api/v1/stations",
      "/api/v1/stations/{id}",
      "/api/v1/stations/{id}/reports",
    ]);
  });

  it.each(declared)("%s has a matching route handler", (route) => {
    const dir = route.replace(/\{(\w+)\}/g, "[$1]");
    expect(existsSync(path.join(ROOT, "app", dir, "route.ts"))).toBe(true);
  });

  it("documents every route handler under app/api/v1", () => {
    const handlers = [
      "app/api/v1/stations/route.ts",
      "app/api/v1/stations/[id]/route.ts",
      "app/api/v1/stations/[id]/reports/route.ts",
    ];
    for (const h of handlers) expect(existsSync(path.join(ROOT, h))).toBe(true);
    expect(handlers.length).toBe(declared.length);
  });
});
