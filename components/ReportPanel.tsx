"use client";

import { useLang } from "@/components/useLang";
import { t, type Key } from "@/lib/i18n";
import { COOLDOWN_MINUTES } from "@/lib/reliability";
import type { ReportStatus } from "@/types/station";

export interface ReportUi {
  pending?: ReportStatus;
  done?: ReportStatus;
  error?: string;
}

const ACTIONS: { status: ReportStatus; label: Key; hint: Key }[] = [
  { status: "working", label: "working", hint: "workingHint" },
  { status: "broken", label: "broken", hint: "brokenHint" },
  { status: "busy", label: "busy", hint: "busyHint" },
];

interface Props {
  ui: ReportUi;
  storage: "supabase" | "memory";
  reportsAvailable: boolean;
  onReport: (status: ReportStatus) => void;
}

/** The three one-tap report buttons plus their feedback and storage notices. */
export default function ReportPanel({ ui, storage, reportsAvailable, onReport }: Props) {
  const [lang] = useLang();
  const locked = Boolean(ui.pending) || Boolean(ui.done);
  return (
    <section aria-labelledby="report-heading">
      <h3 id="report-heading" className="text-sm font-semibold">
        {t(lang, "reportHeading")}
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
              <span className="block text-sm font-semibold">{t(lang, a.label)}</span>
              <span className="block text-xs opacity-80">{t(lang, a.hint)}</span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="mt-2 text-sm">
        {ui.pending && <p className="text-muted">{t(lang, "sending")}</p>}
        {ui.done && <p className="text-ok">{t(lang, "thanks", { n: COOLDOWN_MINUTES })}</p>}
        {ui.error && <p className="text-bad">{ui.error}</p>}
      </div>
      {storage === "memory" && (
        <p className="mt-2 rounded-md bg-warn/10 px-3 py-2 text-xs text-warn">
          {t(lang, "memoryNotice")}
        </p>
      )}
      {!reportsAvailable && (
        <p className="mt-2 rounded-md bg-warn/10 px-3 py-2 text-xs text-warn">
          {t(lang, "reportsUnavailable")}
        </p>
      )}
    </section>
  );
}
