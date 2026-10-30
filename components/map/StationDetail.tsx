"use client";

import StatusBadge from "@/components/StatusBadge";
import ReportPanel, { type ReportUi } from "@/components/ReportPanel";
import WhatsAppShare from "@/components/WhatsAppShare";
import { useLang } from "@/components/useLang";
import { t, timeAgoIn } from "@/lib/i18n";
import { formatDistance } from "@/lib/format";
import { STATUS_RULES, operatorLine, statusHeadline } from "@/lib/statusMeta";
import type { ReportStatus, Station } from "@/types/station";

interface Props {
  station: Station;
  miles: boolean;
  storage: "supabase" | "memory";
  reportsAvailable: boolean;
  reportUi: ReportUi;
  onReport: (status: ReportStatus) => void;
  onClose: () => void;
}

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
  const [lang] = useLang();
  const headline = statusHeadline(station, undefined, lang);

  return (
    <article className="px-4 pb-6 pt-3" aria-label={`Details for ${station.name}`}>
      <button
        type="button"
        onClick={onClose}
        className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm text-brand underline-offset-2 hover:underline"
      >
        <span aria-hidden>←</span> {t(lang, "back")}
      </button>

      <h2 className="font-serif text-2xl leading-tight">{station.name}</h2>
      <p className="mt-1 text-sm text-muted">
        {[station.operator, station.address].filter(Boolean).join(" · ") ||
          "No operator or address listed"}
        {station.distanceKm !== null && ` · ${formatDistance(station.distanceKm, miles)} away`}
      </p>

      <div className="mt-3">
        <StatusBadge status={station.reliability} text={headline} />
      </div>
      <p className="mt-2 text-sm text-muted">{operatorLine(station)}</p>
      <p className="mt-1 text-sm text-muted">
        {t(lang, "why")}: {STATUS_RULES[station.reliability]}
      </p>

      <div className="mt-5">
        <ReportPanel
          ui={reportUi}
          storage={storage}
          reportsAvailable={reportsAvailable}
          onReport={onReport}
        />
      </div>

      <section className="mt-5" aria-labelledby="specs-heading">
        <h3 id="specs-heading" className="text-sm font-semibold">
          {t(lang, "chargers")}
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
            <dt className="text-muted">{t(lang, "chargingPoints")}</dt>
            <dd>{station.points ?? t(lang, "unknown")}</dd>
          </div>
          <div>
            <dt className="text-muted">{t(lang, "price")}</dt>
            <dd>{station.cost ?? t(lang, "unknown")}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5" aria-labelledby="reports-heading">
        <h3 id="reports-heading" className="text-sm font-semibold">
          {t(lang, "recentReports")}
        </h3>
        {station.reports.recent.length > 0 ? (
          <ul className="mt-1 text-sm">
            {station.reports.recent.slice(0, 5).map((r) => (
              <li key={`${r.at}-${r.status}`} className="flex justify-between py-1">
                <span className="capitalize">{r.status}</span>
                <span className="text-muted">{timeAgoIn(lang, r.at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">{t(lang, "noReports")}</p>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-lg bg-brand px-4 font-medium text-white"
        >
          {t(lang, "directions")}
        </a>
        <p className="flex flex-wrap gap-x-4 text-muted">
          <a
            href={`/s/${encodeURIComponent(station.id)}`}
            className="inline-flex min-h-11 items-center underline"
          >
            {t(lang, "sharePage")}
          </a>
          <WhatsAppShare
            text={t(lang, "whatsappText", { name: station.name, status: headline })}
            path={`/s/${encodeURIComponent(station.id)}`}
            label={t(lang, "whatsapp")}
            className="font-medium text-ok underline"
          />
          <a
            href={`/qr/${encodeURIComponent(station.id)}`}
            className="inline-flex min-h-11 items-center underline"
          >
            {t(lang, "qr")}
          </a>
        </p>
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
