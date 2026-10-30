import { describe, expect, it } from "vitest";
import { isCountryAllowed, launchCountries, visitorCountry } from "@/lib/launch";

describe("launch countries", () => {
  it("defaults to India only", () => {
    expect(launchCountries({})).toEqual(["IN"]);
    expect(isCountryAllowed("IN", {})).toBe(true);
    expect(isCountryAllowed("US", {})).toBe(false);
  });

  it("allows an unknown country so local dev and tests are not blocked", () => {
    expect(isCountryAllowed(null, {})).toBe(true);
  });

  it("reads a list, case-insensitively, and * opens everything", () => {
    expect(isCountryAllowed("AE", { LAUNCH_COUNTRIES: "in, ae" })).toBe(true);
    expect(isCountryAllowed("US", { LAUNCH_COUNTRIES: "in, ae" })).toBe(false);
    expect(isCountryAllowed("US", { LAUNCH_COUNTRIES: "*" })).toBe(true);
  });

  it("takes the country from the host headers", () => {
    expect(visitorCountry(new Headers({ "x-vercel-ip-country": "in" }))).toBe("IN");
    expect(visitorCountry(new Headers({ "cf-ipcountry": "US" }))).toBe("US");
    expect(visitorCountry(new Headers({ "x-vercel-ip-country": "XYZ" }))).toBeNull();
    expect(visitorCountry(new Headers())).toBeNull();
  });
});
