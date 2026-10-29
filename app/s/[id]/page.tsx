import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import ShareReport from "@/components/ShareReport";
import StatusBadge from "@/components/StatusBadge";
import { formatDistance } from "@/lib/format";
import { recordEvent } from "@/lib/metrics";
import { operatorLine, STATUS_RULES, statusHeadline } from "@/lib/statusMeta";
import { lookupStation } from "@/lib/stationView";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const lookup = await lookupStation(id);
  if (!lookup.found) return { title: "Charger", robots: { index: false } };
  const { station } = lookup;
  const title = `${station.name}: ${statusHeadline(station)}`;
  return {
    title,
    description: `Driver-verified status for ${station.name}. ${STATUS_RULES[station.reliability]}`,
    robots: { index: false },
    openGraph: { title, type: "website" },
  };
}

export default async function SharePage({ params }: Params) {
  const { id } = await params;
  const lookup = await lookupStation(id);

  const shell = (children: React.ReactNode) => (
    <main className="mx-auto max-w-xl px-5 py-8">
      <Logo />
      {children}
    </main>
  );

  if (!lookup.found) {
    const copy = {
      invalid: "That is not a valid charger link.",
      "not-found":
        "We could not find that charger in the registry. It may have been removed, or it needs an Open Charge Map key we do not have configured.",
      unavailable: "The charger registry did not answer. Try again in a moment.",
    }[lookup.reason];
    return shell(
      <>
        <h1 className="mt-8 font-serif text-4xl tracking-tight">Charger not available</h1>
        <p className="mt-3 text-muted">{copy}</p>
        <Link
          href="/map"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-6 font-medium text-white"
        >
          Open the map
        </Link>
      </>
    );
  }

  recordEvent("share_view");
  const { station, storage, reportsAvailable } = lookup;
  const mapHref = `/map?${new URLSearchParams({ lat: String(station.lat), lng: String(station.lng), station: station.id })}`;

  return shell(
    <article className="mt-8">
      <h1 className="font-serif text-4xl leading-tight tracking-tight">{station.name}</h1>
      <p className="mt-2 text-muted">
        {[station.operator, station.address].filter(Boolean).join(" · ") ||
          "No operator or address listed"}
      </p>
      <div className="mt-4">
        <StatusBadge status={station.reliability} text={statusHeadline(station)} />
      </div>
      <p className="mt-2 text-sm text-muted">{operatorLine(station)}</p>
      <p className="mt-1 text-sm text-muted">Why: {STATUS_RULES[station.reliability]}</p>

      <div className="mt-6">
        <ShareReport stationId={station.id} storage={storage} reportsAvailable={reportsAvailable} />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted">Connectors</dt>
          <dd>
            {station.connectors.length
              ? station.connectors.map((c) => `${c.type}${c.kw ? ` ${c.kw} kW` : ""}`).join(", ")
              : "Unknown"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Price</dt>
          <dd>{station.cost ?? "Unknown"}</dd>
        </div>
        <div>
          <dt className="text-muted">Charging points</dt>
          <dd>{station.points ?? "Unknown"}</dd>
        </div>
        <div>
          <dt className="text-muted">Data source</dt>
          <dd>{station.source === "ocm" ? "Open Charge Map" : "OpenStreetMap"}</dd>
        </div>
      </dl>
      {station.distanceKm !== null && (
        <p className="sr-only">{formatDistance(station.distanceKm, false)}</p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={mapHref}
          className="inline-flex min-h-11 items-center rounded-full bg-brand px-6 font-medium text-white"
        >
          See it on the map
        </Link>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-6 font-medium"
        >
          Get directions
        </a>
      </div>
    </article>
  );
}
