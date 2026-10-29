import { BROKEN_WINDOW_HOURS, VERIFIED_WINDOW_HOURS } from "@/lib/reliability";
import { timeAgo } from "@/lib/format";
import type { Reliability, Station } from "@/types/station";

/** Same values as the ok / bad / warn / unknown colours in tailwind.config.ts (MapLibre needs raw hex). */
export const STATUS_COLORS: Record<Reliability, string> = {
  verified: "#0F6B3C",
  "reported-broken": "#B3321B",
  "operator-offline": "#8A5200",
  unverified: "#5F6A71",
};

export const STATUS_LABELS: Record<Reliability, string> = {
  verified: "Verified working",
  "reported-broken": "Reported broken",
  "operator-offline": "Operator says offline",
  unverified: "Unverified",
};

/** Tailwind classes per status, kept here so the map and the landing page cannot drift apart. */
export const STATUS_STYLES: Record<Reliability, { text: string; bg: string; dot: string }> = {
  verified: { text: "text-ok", bg: "bg-ok/10", dot: "bg-ok" },
  "reported-broken": { text: "text-bad", bg: "bg-bad/10", dot: "bg-bad" },
  "operator-offline": { text: "text-warn", bg: "bg-warn/10", dot: "bg-warn" },
  unverified: { text: "text-unknown", bg: "bg-unknown/10", dot: "bg-unknown" },
};

export const STATUS_RULES: Record<Reliability, string> = {
  verified: `The newest driver report is "working" or "busy" and is less than ${VERIFIED_WINDOW_HOURS} hours old.`,
  "reported-broken": `The newest driver report is "broken" and is less than ${BROKEN_WINDOW_HOURS} hours old.`,
  "operator-offline":
    "No fresh driver report, and the operator or registry data marks the charger offline.",
  unverified:
    "No fresh driver report and no offline flag. We do not guess: the charger may be fine, but nobody has confirmed it.",
};

/** The status label with the time that matters for it, e.g. "Verified working · 12 min ago". */
export function statusHeadline(station: Station, now: number = Date.now()): string {
  const label = STATUS_LABELS[station.reliability];
  switch (station.reliability) {
    case "verified":
      return `${label} · ${timeAgo(station.verifiedAt, now)}`;
    case "reported-broken": {
      const newest = station.reports.recent.find((r) => r.status === "broken");
      return newest ? `${label} · ${timeAgo(newest.at, now)}` : label;
    }
    default:
      return label;
  }
}

/** One-line context for the operator signal, shown under the headline. */
export function operatorLine(station: Station, now: number = Date.now()): string {
  const updated = station.statusUpdatedAt
    ? ` (updated ${timeAgo(station.statusUpdatedAt, now)})`
    : "";
  if (station.operatorStatus === "operational") return `Operator data: operational${updated}`;
  if (station.operatorStatus === "offline") return `Operator data: offline${updated}`;
  return "Operator data: no status published";
}
