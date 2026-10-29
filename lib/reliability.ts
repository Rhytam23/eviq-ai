import type { OperatorStatus, Reliability, ReportEvent } from "@/types/station";

/** A "working" report keeps a charger marked verified for this long. */
export const VERIFIED_WINDOW_HOURS = 24;
/** A "broken" report flags a charger for this long. */
export const BROKEN_WINDOW_HOURS = 48;
/** Reports older than this are ignored entirely. */
export const REPORT_RETENTION_HOURS = 72;

/** A client may report the same charger once per this many minutes (enforced server-side). */
export const COOLDOWN_MINUTES = 10;

const HOUR = 3_600_000;

interface ReliabilityResult {
  reliability: Reliability;
  verifiedAt: string | null;
}

/**
 * Transparent, rule-based status. Driver reports beat operator data because they are
 * newer: the newest report decides, as long as it is inside its freshness window.
 *
 *   newest report "broken" within 48h            -> reported-broken
 *   newest report "working"/"busy" within 24h    -> verified
 *   operator data says offline                   -> operator-offline
 *   anything else                                -> unverified
 */
export function computeReliability(
  operatorStatus: OperatorStatus,
  recent: ReportEvent[],
  now: number = Date.now()
): ReliabilityResult {
  const newest = [...recent].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];

  if (newest) {
    const age = now - Date.parse(newest.at);
    if (newest.status === "broken" && age <= BROKEN_WINDOW_HOURS * HOUR) {
      return { reliability: "reported-broken", verifiedAt: null };
    }
    if (newest.status !== "broken" && age <= VERIFIED_WINDOW_HOURS * HOUR) {
      return { reliability: "verified", verifiedAt: newest.at };
    }
  }

  if (operatorStatus === "offline") return { reliability: "operator-offline", verifiedAt: null };
  return { reliability: "unverified", verifiedAt: null };
}
