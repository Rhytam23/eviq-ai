import { describe, expect, it } from "vitest";
import { adminConfigured, adminSession, sessionValid, tokenMatches } from "@/lib/admin";
import { readMetrics, recordEvent } from "@/lib/metrics";

const env = { ADMIN_TOKEN: "a-long-enough-token-1234" } as unknown as NodeJS.ProcessEnv;

describe("admin auth", () => {
  it("requires a token of at least 16 characters", () => {
    expect(adminConfigured({} as NodeJS.ProcessEnv)).toBe(false);
    expect(adminConfigured({ ADMIN_TOKEN: "short" } as unknown as NodeJS.ProcessEnv)).toBe(false);
    expect(adminConfigured(env)).toBe(true);
  });

  it("accepts only the exact token", () => {
    expect(tokenMatches("a-long-enough-token-1234", env)).toBe(true);
    expect(tokenMatches("a-long-enough-token-1235", env)).toBe(false);
    expect(tokenMatches("", env)).toBe(false);
    expect(tokenMatches("anything", {} as NodeJS.ProcessEnv)).toBe(false);
  });

  it("session cookie validates, does not contain the token, and fails for other values", () => {
    const cookie = adminSession(env.ADMIN_TOKEN as string);
    expect(cookie).not.toContain("a-long-enough");
    expect(sessionValid(cookie, env)).toBe(true);
    expect(sessionValid(`${cookie}0`, env)).toBe(false);
    expect(sessionValid(undefined, env)).toBe(false);
    expect(sessionValid(cookie, {} as NodeJS.ProcessEnv)).toBe(false);
  });
});

describe("metrics (memory mode)", () => {
  it("counts events per day and name, with no identifiers", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    recordEvent("map_search");
    recordEvent("map_search");
    recordEvent("qr_view");
    const rows = await readMetrics(30);
    const today = new Date().toISOString().slice(0, 10);
    expect(rows.find((r) => r.name === "map_search")).toEqual({
      day: today,
      name: "map_search",
      count: 2,
    });
    expect(rows.find((r) => r.name === "qr_view")?.count).toBe(1);
    expect(Object.keys(rows[0]).sort()).toEqual(["count", "day", "name"]);
  });
});
