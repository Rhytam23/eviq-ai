"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { computeReliability } from "@/lib/reliability";
import type { LandingCopy } from "@/lib/landingCopy";
import type { ReportEvent, ReportStatus } from "@/types/station";

// A fixed clock keeps the server render and the browser identical. Only the order and age of reports matter.
const T0 = Date.UTC(2026, 0, 1, 12, 0, 0);
const HOUR = 3_600_000;

const SEED: { status: ReportStatus; at: number; label: (c: LandingCopy["demo"]) => string }[] = [
  { status: "broken", at: T0 - HOUR, label: (d) => d.ago.h.replace("{n}", "1") },
  { status: "broken", at: T0 - 3 * HOUR, label: (d) => d.ago.h.replace("{n}", "3") },
  { status: "working", at: T0 - 48 * HOUR, label: (d) => d.ago.d.replace("{n}", "2") },
];

interface Entry {
  status: ReportStatus;
  at: number;
  label: string;
}

/** Interactive example: tap what you would see and watch the real status rule respond. Nothing is sent. */
export default function TryIt({ copy }: { copy: LandingCopy["demo"] }) {
  const seeded = (): Entry[] => SEED.map((s) => ({ ...s, label: s.label(copy) }));
  const [entries, setEntries] = useState<Entry[]>(seeded);
  const [taps, setTaps] = useState(0);

  const events: ReportEvent[] = entries.map((e) => ({
    status: e.status,
    at: new Date(e.at).toISOString(),
  }));
  const { reliability } = computeReliability("operational", events, T0);
  const newest = [...entries].sort((a, b) => b.at - a.at)[0];
  const statusText =
    reliability === "verified" || reliability === "reported-broken"
      ? `${copy.statusText[reliability]} · ${newest.label}`
      : copy.statusText[reliability];

  const names: Record<ReportStatus, string> = {
    working: copy.working,
    broken: copy.broken,
    busy: copy.busy,
  };

  function tap(status: ReportStatus) {
    setTaps((n) => n + 1);
    setEntries((list) => [{ status, at: T0, label: copy.justNow }, ...list].slice(0, 4));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {copy.registryLabel}
        </p>
        <p className="mt-3 font-medium">{copy.example}</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-ok/10 px-3 py-1 text-sm font-medium text-ok">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ok" />
          {copy.registryStatus}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {copy.eviqLabel}
        </p>
        <p className="mt-3 font-medium">{copy.example}</p>
        <div key={taps} className={`mt-3 ${taps ? "rise" : ""}`} aria-live="polite">
          <StatusBadge status={reliability} text={statusText} />
        </div>
        <ul className="mt-4 divide-y divide-line text-sm">
          {entries.map((e, i) => (
            <li
              key={`${e.at}-${i}`}
              className={`flex justify-between py-1.5 ${i === 0 && taps ? "rise" : ""}`}
            >
              <span>{names[e.status]}</span>
              <span className="text-muted">{e.label}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm font-semibold">{copy.tapHeading}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["working", "broken", "busy"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => tap(s)}
              className="min-h-12 rounded-lg border border-line bg-white px-2 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-brand active:scale-95"
            >
              {names[s]}
            </button>
          ))}
        </div>
        {taps > 0 && (
          <button
            type="button"
            onClick={() => {
              setEntries(seeded());
              setTaps(0);
            }}
            className="mt-2 inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-2"
          >
            {copy.reset}
          </button>
        )}
      </div>
      <p className="text-xs text-muted">{copy.note}</p>
    </div>
  );
}
