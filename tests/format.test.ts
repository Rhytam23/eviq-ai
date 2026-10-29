import { describe, expect, it } from "vitest";
import { formatDistance, haversineKm, prefersMiles, timeAgo } from "@/lib/format";

describe("format", () => {
  it("picks miles only for mile-using regions", () => {
    expect(prefersMiles("en-US")).toBe(true);
    expect(prefersMiles("en-GB")).toBe(true);
    expect(prefersMiles("de-DE")).toBe(false);
    expect(prefersMiles("en")).toBe(false);
    expect(prefersMiles(undefined)).toBe(false);
  });

  it("formats distances in km or miles", () => {
    expect(formatDistance(null, false)).toBe("");
    expect(formatDistance(0.04, false)).toBe("<0.1 km");
    expect(formatDistance(2.345, false)).toBe("2.3 km");
    expect(formatDistance(23.4, false)).toBe("23 km");
    expect(formatDistance(1.609344, true)).toBe("1.0 mi");
    expect(formatDistance(16.09344, true)).toBe("10 mi");
  });

  it("formats relative time", () => {
    const now = Date.parse("2026-10-01T12:00:00Z");
    expect(timeAgo(null, now)).toBe("");
    expect(timeAgo("2026-10-01T11:59:40Z", now)).toBe("just now");
    expect(timeAgo("2026-10-01T11:30:00Z", now)).toBe("30 min ago");
    expect(timeAgo("2026-10-01T06:00:00Z", now)).toBe("6 h ago");
    expect(timeAgo("2026-09-25T12:00:00Z", now)).toBe("6 days ago");
  });

  it("computes great-circle distance", () => {
    expect(haversineKm(0, 0, 0, 0)).toBe(0);
    // Paris to London is about 344 km.
    expect(haversineKm(48.8566, 2.3522, 51.5074, -0.1278)).toBeGreaterThan(335);
    expect(haversineKm(48.8566, 2.3522, 51.5074, -0.1278)).toBeLessThan(350);
  });
});
