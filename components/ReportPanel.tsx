"use client";

import { COOLDOWN_MINUTES } from "@/lib/reliability";
import type { ReportStatus } from "@/types/station";

export interface ReportUi {
  pending?: ReportStatus;
  done?: ReportStatus;
  error?: string;
}

const ACTIONS: { status: ReportStatus; label: string; hint: string }[] = [
  { status: "working", label: "Working", hint: "I charged here" },
  { status: "broken", label: "Broken", hint: "It would not charge" },
  { status: "busy", label: "Busy", hint: "All bays in use" },
];

interface Props {
  ui: ReportUi;
  storage: "supabase" | "memory";
  reportsAvailable: boolean;
  onReport: (status: ReportStatus) => void;
}

/** The three one-tap report buttons plus their feedback and storage notices. */
export default function ReportPanel({ ui, storage, reportsAvailable, onReport }: Props) {
  const locked = Boolean(ui.pending) || Boolean(ui.done);
  return (
    <section aria-labelledby="report-heading">
      <h3 id="report-heading" className="text-sm font-semibold">
        Was it working when you got here?
      </h3>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {ACTIONS.map((a) => {
          const chosen = ui.done === a.status || ui.pending === a.status;
          return (
            <button
              key={a.status}
              type="button"
              disabled={locked}
              aria-pressed={chosen}
              onClick={() => onReport(a.status)}
              className={`min-h-14 rounded-lg border px-2 py-3 text-center disabled:cursor-not-allowed ${
                chosen
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white hover:border-brand disabled:opacity-50"
              }`}
            >
              <span className="block text-sm font-semibold">{a.label}</span>
              <span className="block text-xs opacity-80">{a.hint}</span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="mt-2 text-sm">
        {ui.pending && <p className="text-muted">Sending…</p>}
        {ui.done && (
          <p className="text-ok">
            Thanks, your report is in. You can report this charger again in {COOLDOWN_MINUTES}{" "}
            minutes.
          </p>
        )}
        {ui.error && <p className="text-bad">{ui.error}</p>}
      </div>
      {storage === "memory" && (
        <p className="mt-2 rounded-md bg-warn/10 px-3 py-2 text-xs text-warn">
          Reports are not persisted on this server: they are kept in memory and lost on restart. Set
          the Supabase variables to store them.
        </p>
      )}
      {!reportsAvailable && (
        <p className="mt-2 rounded-md bg-warn/10 px-3 py-2 text-xs text-warn">
          Driver reports could not be loaded just now, so statuses show operator data only.
        </p>
      )}
    </section>
  );
}
