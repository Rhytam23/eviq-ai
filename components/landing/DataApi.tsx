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

const DELIVERABLES = [
  {
    title: "A current status",
    body: "Working, reported broken, offline according to the operator, or unverified.",
  },
  {
    title: "How fresh it is",
    body: "When a driver last confirmed it, so you know how far to trust it.",
  },
  {
    title: "The reason behind it",
    body: "What the operator says and what recent drivers reported, side by side.",
  },
];

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
        <div className="rounded-2xl bg-white/[0.06] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-volt">
            What a buyer gets for every charger
          </p>
          <ul className="mt-6 space-y-5">
            {DELIVERABLES.map((d) => (
              <li key={d.title}>
                <p className="font-semibold">{d.title}</p>
                <p className="text-paper/75">{d.body}</p>
              </li>
            ))}
          </ul>
          <a
            href="/developers"
            className="mt-8 inline-flex min-h-[44px] items-center rounded-full bg-volt px-5 font-semibold text-brand"
          >
            See how to get access
          </a>
        </div>
        <p className="mt-4 text-sm text-paper/70">
          Want to be an early partner? Email{" "}
          <a className="underline" href="mailto:founders@eviq.ai?subject=EVIQ%20data">
            founders@eviq.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}
