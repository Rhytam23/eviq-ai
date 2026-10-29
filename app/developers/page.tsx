import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Developers",
  description: "A free read API for driver-verified EV charger status. Alpha, no key needed.",
};

const EXAMPLES = [
  {
    title: "Chargers near a point",
    code: `curl "${SITE_URL}/api/v1/stations?lat=52.52&lng=13.405&radiusKm=5"`,
  },
  { title: "One charger", code: `curl "${SITE_URL}/api/v1/stations/osm:n1234567890"` },
  {
    title: "Its recent reports",
    code: `curl "${SITE_URL}/api/v1/stations/osm:n1234567890/reports"`,
  },
];

export default function DevelopersPage() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
          <Logo />
          <Link
            href="/map"
            className="inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-medium text-white"
          >
            Open map
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="inline-block rounded-full bg-volt px-3 py-1 text-xs font-semibold text-brand">
          Alpha
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
          Charger status API
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          The same status the map shows, as JSON. Read-only, no key, CORS open, cached for 30
          seconds. Built to be the reliability layer inside routing apps, vehicle software and fleet
          tools.
        </p>

        <section className="mt-10 space-y-6" aria-label="Examples">
          {EXAMPLES.map((e) => (
            <div key={e.title}>
              <h2 className="text-sm font-semibold">{e.title}</h2>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-ink p-4 text-[13px] text-paper">
                <code>{e.code}</code>
              </pre>
            </div>
          ))}
        </section>

        <section className="mt-12 max-w-2xl space-y-3 leading-relaxed text-muted">
          <h2 className="font-serif text-3xl text-ink">What to know</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Alpha.</strong> The shape may change, there is no uptime
              commitment, and we may add keys and plans later. Tell us what you need.
            </li>
            <li>
              <strong className="text-ink">Limits.</strong> 60 requests per minute per client
              address, radius up to 50 km, at most 200 chargers per call. Coordinates are rounded to
              about 100 m.
            </li>
            <li>
              <strong className="text-ink">Ids.</strong> <code>ocm:&lt;number&gt;</code> or{" "}
              <code>osm:&lt;n|w|r&gt;&lt;number&gt;</code>. <code>ocm:</code> lookups need an Open
              Charge Map key on our side.
            </li>
            <li>
              <strong className="text-ink">Unknown is null.</strong> Price, power and point counts
              the registry does not publish come back as <code>null</code>, never estimated.
            </li>
            <li>
              <strong className="text-ink">Licences.</strong> Registry data is Open Charge Map (CC
              BY 4.0) and OpenStreetMap contributors (ODbL): credit them. Terms for reuse of the
              report data are not written yet; ask first for anything commercial.
            </li>
            <li>
              <strong className="text-ink">Rules.</strong> How a status is computed is on{" "}
              <Link href="/how-it-works" className="text-brand underline">
                the rules page
              </Link>
              .
            </li>
          </ul>
          <p>
            Full contract:{" "}
            <a
              href="/openapi.yaml"
              className="inline-flex min-h-11 items-center text-brand underline"
            >
              openapi.yaml
            </a>
            . Design partner or feedback:{" "}
            <a href="mailto:founders@eviq.ai?subject=EVIQ%20API" className="text-brand underline">
              founders@eviq.ai
            </a>
            .
          </p>
        </section>
      </main>
    </>
  );
}
