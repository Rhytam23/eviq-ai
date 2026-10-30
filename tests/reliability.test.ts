import { describe, expect, it } from "vitest";
import { BROKEN_WINDOW_HOURS, VERIFIED_WINDOW_HOURS, computeReliability } from "@/lib/reliability";
import type { ReportEvent } from "@/types/station";

const NOW = Date.parse("2026-10-01T12:00:00Z");
const HOUR = 3_600_000;
const ago = (hours: number) => new Date(NOW - hours * HOUR).toISOString();
const report = (status: ReportEvent["status"], hours: number): ReportEvent => ({
  status,
  at: ago(hours),
});

describe("computeReliability", () => {
  it("is unverified with no reports and no operator signal", () => {
    expect(computeReliability("unknown", [], NOW)).toEqual({
      reliability: "unverified",
      verifiedAt: null,
    });
  });

  it("is unverified when the operator says operational but nobody confirmed it", () => {
    expect(computeReliability("operational", [], NOW).reliability).toBe("unverified");
  });

  it("flags operator-offline when there are no fresh reports", () => {
    expect(computeReliability("offline", [], NOW).reliability).toBe("operator-offline");
  });

  it("is verified by a fresh working report and exposes when", () => {
    const result = computeReliability("unknown", [report("working", 2)], NOW);
    expect(result).toEqual({ reliability: "verified", verifiedAt: ago(2) });
  });

  it("treats a busy report as proof the charger is alive", () => {
    expect(computeReliability("unknown", [report("busy", 1)], NOW).reliability).toBe("verified");
  });

  it("lets a fresh working report override operator-offline", () => {
    expect(computeReliability("offline", [report("working", 1)], NOW).reliability).toBe("verified");
  });

  it("flags a fresh broken report even when the operator says operational", () => {
    const result = computeReliability("operational", [report("broken", 3)], NOW);
    expect(result).toEqual({ reliability: "reported-broken", verifiedAt: null });
  });

  it("uses the newest report, regardless of input order", () => {
    const recent = [report("broken", 5), report("working", 1)];
    expect(computeReliability("unknown", recent, NOW).reliability).toBe("verified");
    expect(computeReliability("unknown", [...recent].reverse(), NOW).reliability).toBe("verified");
    const flipped = [report("working", 5), report("broken", 1)];
    expect(computeReliability("unknown", flipped, NOW).reliability).toBe("reported-broken");
  });

  it("ages a working report out after the verified window", () => {
    const inside = computeReliability(
      "unknown",
      [report("working", VERIFIED_WINDOW_HOURS - 0.1)],
      NOW
    );
    const outside = computeReliability(
      "unknown",
      [report("working", VERIFIED_WINDOW_HOURS + 0.1)],
      NOW
    );
    expect(inside.reliability).toBe("verified");
    expect(outside.reliability).toBe("unverified");
  });

  it("ages a broken report out after the broken window and falls back to operator data", () => {
    const inside = computeReliability(
      "unknown",
      [report("broken", BROKEN_WINDOW_HOURS - 0.1)],
      NOW
    );
    const outside = computeReliability(
      "offline",
      [report("broken", BROKEN_WINDOW_HOURS + 0.1)],
      NOW
    );
    expect(inside.reliability).toBe("reported-broken");
    expect(outside.reliability).toBe("operator-offline");
  });

  it("keeps a broken report visible longer than a working one", () => {
    expect(BROKEN_WINDOW_HOURS).toBeGreaterThan(VERIFIED_WINDOW_HOURS);
  });

  it("does not mutate its input", () => {
    const recent = [report("broken", 5), report("working", 1)];
    const copy = JSON.stringify(recent);
    computeReliability("unknown", recent, NOW);
    expect(JSON.stringify(recent)).toBe(copy);
  });
});
