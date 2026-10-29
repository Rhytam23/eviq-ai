const BUYERS = [
  {
    title: "Routing and navigation apps",
    body: "Stop sending drivers to chargers that were broken an hour ago.",
  },
  {
    title: "Vehicle makers",
    body: "Trip planners in the car that route around known-bad stations.",
  },
  {
    title: "Fleets and rental companies",
    body: "Fewer stranded vehicles and failed charging stops.",
  },
  {
    title: "Charge point operators",
    body: "See how drivers experience each site, before the support tickets arrive.",
  },
];

const SAMPLE = `GET /v1/stations/ocm:12345/reliability

{
  "station_id": "ocm:12345",
  "status": "reported-broken",
  "last_report_at": "2026-03-02T09:41:00Z",
  "reports_72h": { "working": 1, "broken": 2, "busy": 0 },
  "operator_status": "operational",
  "rules_version": "1"
}`;

export default function DataApi() {
  return (
    <div className="grid gap-12 md:grid-cols-2 md:gap-16">
      <div className="min-w-0">
        <p className="text-lg leading-relaxed text-paper/90">
          A registry is a list anyone can copy. A running record of what actually worked, charger by
          charger, hour by hour, is not. Every tap makes that record better and every new city makes
          the network of reporters more useful.
        </p>
        <p className="mt-5 text-lg leading-relaxed text-paper/90">
          The map is how drivers feed it and use it. The business is selling the same data, as an
          API, to the companies that route people to chargers.
        </p>
        <ul className="mt-9 space-y-5">
          {BUYERS.map((b) => (
            <li key={b.title} className="border-l-2 border-volt pl-4">
              <p className="font-semibold">{b.title}</p>
              <p className="text-paper/75">{b.body}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0">
        <div className="overflow-hidden rounded-2xl bg-ink">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs">
            <span className="text-paper/60">Sketch of the planned API</span>
            <span className="rounded-full bg-volt px-2.5 py-0.5 font-semibold text-brand">
              Not built yet
            </span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-paper/90">
            {SAMPLE}
          </pre>
        </div>
        <p className="mt-4 text-sm text-paper/70">
          The response shape is a design sketch with example values. Today the same status is
          computed inside the app. Interested in being a design partner? Email{" "}
          <a className="underline" href="mailto:founders@eviq.ai?subject=EVIQ%20API">
            founders@eviq.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}
