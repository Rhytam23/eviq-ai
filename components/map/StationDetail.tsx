"use client";

import StatusBadge from "@/components/StatusBadge";
import { COOLDOWN_MINUTES } from "@/lib/reliability";
import { formatDistance, timeAgo } from "@/lib/format";
import { STATUS_RULES, operatorLine, statusHeadline } from "@/lib/statusMeta";
import type { ReportStatus, Station } from "@/types/station";

export interface ReportUi {
  pending?: ReportStatus;
  done?: ReportStatus;
  error?: string;
}

interface Props {
  station: Station;
  miles: boolean;
  storage: "supabase" | "memory";
  reportsAvailable: boolean;
  reportUi: ReportUi;
  onReport: (status: ReportStatus) => void;
  onClose: () => void;
}

const ACTIONS: { status: ReportStatus; label: string; hint: string }[] = [
  { status: "working", label: "Working", hint: "I charged here" },
  { status: "broken", label: "Broken", hint: "It would not charge" },
  { status: "busy", label: "Busy", hint: "All bays in use" },
];

function sourceLink(station: Station): { label: string; href: string } {
  if (station.source === "ocm") {
    return {
      label: "Open Charge Map",
      href: `https://openchargemap.org/site/poi/details/${station.id.slice(4)}`,
    };
  }
  const kind = { n: "node", w: "way", r: "relation" }[station.id[4] as "n" | "w" | "r"];
  return {
    label: "OpenStreetMap",
    href: `https://www.openstreetmap.org/${kind}/${station.id.slice(5)}`,
  };
}

export default function StationDetail({
  station,
  miles,
  storage,
  reportsAvailable,
  reportUi,
  onReport,
  onClose,
}: Props) {
  const source = sourceLink(station);
  const busy = Boolean(reportUi.pending);
  const locked = busy || Boolean(reportUi.done);

  return (
    <article className="px-4 pb-6 pt-3" aria-label={`Details for ${station.name}`}>
      <button
        type="button"
        onClick={onClose}
        className="mb-3 inline-flex items-center gap-1 text-sm text-brand underline-offset-2 hover:underline"
      >
        <span aria-hidden>←</span> Back to list
      </button>

      <h2 className="font-serif text-2xl leading-tight">{station.name}</h2>
      <p className="mt-1 text-sm text-muted">
        {[station.operator, station.address].filter(Boolean).join(" · ") ||
          "No operator or address listed"}
        {station.distanceKm !== null && ` · ${formatDistance(station.distanceKm, miles)} away`}
      </p>

      <div className="mt-3">
        <StatusBadge status={station.reliability} text={statusHeadline(station)} />
      </div>
      <p className="mt-2 text-sm text-muted">{operatorLine(station)}</p>
      <p className="mt-1 text-sm text-muted">Why: {STATUS_RULES[station.reliability]}</p>

      <section className="mt-5" aria-labelledby="report-heading">
        <h3 id="report-heading" className="text-sm font-semibold">
          Was it working when you got here?
        </h3>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {ACTIONS.map((a) => {
            const chosen = reportUi.done === a.status || reportUi.pending === a.status;
            return (
              <button
                key={a.status}
                type="button"
                disabled={locked}
                aria-pressed={chosen}
                onClick={() => onReport(a.status)}
                className={`rounded-lg border px-2 py-3 text-center disabled:cursor-not-allowed ${
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
          {reportUi.pending && <p className="text-muted">Sending…</p>}
          {reportUi.done && (
            <p className="text-ok">
              Thanks, your report is in. You can report this charger again in {COOLDOWN_MINUTES}{" "}
              minutes.
            </p>
          )}
          {reportUi.error && <p className="text-bad">{reportUi.error}</p>}
        </div>
        {storage === "memory" && (
          <p className="mt-2 rounded-md bg-warn/10 px-3 py-2 text-xs text-warn">
            Reports are not persisted on this server: they are kept in memory and lost on restart.
            Set the Supabase variables to store them.
          </p>
        )}
        {!reportsAvailable && (
          <p className="mt-2 rounded-md bg-warn/10 px-3 py-2 text-xs text-warn">
            Driver reports could not be loaded just now, so statuses show operator data only.
          </p>
        )}
      </section>

      <section className="mt-5" aria-labelledby="specs-heading">
        <h3 id="specs-heading" className="text-sm font-semibold">
          Chargers
        </h3>
        {station.connectors.length > 0 ? (
          <ul className="mt-1 divide-y divide-line text-sm">
            {station.connectors.map((c) => (
              <li key={`${c.type}-${c.kw}`} className="flex justify-between py-1.5">
                <span>
                  {c.type}
                  {c.quantity ? ` × ${c.quantity}` : ""}
                </span>
                <span className="tabular-nums text-muted">
                  {c.kw ? `${c.kw} kW` : "power unknown"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">Connector details are not listed.</p>
        )}
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted">Charging points</dt>
            <dd>{station.points ?? "Unknown"}</dd>
          </div>
          <div>
            <dt className="text-muted">Price</dt>
            <dd>{station.cost ?? "Unknown"}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5" aria-labelledby="reports-heading">
        <h3 id="reports-heading" className="text-sm font-semibold">
          Recent driver reports
        </h3>
        {station.reports.recent.length > 0 ? (
          <ul className="mt-1 text-sm">
            {station.reports.recent.slice(0, 5).map((r) => (
              <li key={`${r.at}-${r.status}`} className="flex justify-between py-1">
                <span className="capitalize">{r.status}</span>
                <span className="text-muted">{timeAgo(r.at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">
            No driver reports in the last 72 hours. Be the first.
          </p>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white"
        >
          Get directions
        </a>
        <p className="text-muted">
          Source:{" "}
          <a href={source.href} target="_blank" rel="noopener noreferrer" className="underline">
            {source.label}
          </a>
        </p>
      </div>
    </article>
  );
}
