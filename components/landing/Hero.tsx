import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { INDIA_CITIES, cityMapHref } from "@/lib/cities";

const MAILTO = "mailto:founders@eviq.ai?subject=EVIQ";

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_0_rgba(20,24,27,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Illustrative only: the same charger, seen through a registry and through EVIQ. Not a real station. */
function SameChargerTwice() {
  return (
    <div className="relative">
      <div className="space-y-4">
        <div className="float">
          <Card label="What a registry shows">
            <p className="font-medium">Example charger, 2 × CCS 150 kW</p>
            <p className="mt-1 text-sm text-muted">Status field: operational</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-ok/10 px-3 py-1 text-sm font-medium text-ok">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ok" />
              Operational
            </p>
          </Card>
        </div>
        <div className="float" style={{ ["--d" as string]: "1.2s" }}>
          <Card label="What EVIQ shows">
            <p className="font-medium">Example charger, 2 × CCS 150 kW</p>
            <div className="relative mt-3 inline-block">
              <span
                aria-hidden
                className="ping-soft absolute inset-0 rounded-full bg-bad/25 motion-reduce:hidden"
              />
              <span className="relative">
                <StatusBadge status="reported-broken" text="Reported broken · 1 h ago" />
              </span>
            </div>
            <ul className="mt-4 divide-y divide-line text-sm">
              {[
                ["Broken", "1 h ago"],
                ["Broken", "3 h ago"],
                ["Working", "2 days ago"],
              ].map(([label, when], i) => (
                <li
                  key={when}
                  className="rise flex justify-between py-1.5"
                  style={{ ["--d" as string]: `${1100 + i * 250}ms` }}
                >
                  <span>{label}</span>
                  <span className="text-muted">{when}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Illustration with an invented example, not a real station. The live map shows real ones.
      </p>
    </div>
  );
}

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="drift absolute -left-24 top-10 h-80 w-80 rounded-full bg-volt/40 blur-3xl" />
        <div
          className="drift absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-brand/10 blur-3xl"
          style={{ animationDelay: "-7s" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,24,27,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,24,27,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 md:grid-cols-[1.25fr_1fr] md:pb-28 md:pt-24">
        <div>
          <p className="rise inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pl-3 pr-4 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            <span aria-hidden className="relative flex h-2.5 w-2.5">
              <span className="ping absolute inset-0 rounded-full bg-ok motion-reduce:hidden" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-ok" />
            </span>
            Launching in India first
            <span aria-hidden className="tricolor h-2 w-6 rounded-full border border-line" />
          </p>
          <h1
            className="rise mt-6 font-serif text-[2.9rem] leading-[1.02] tracking-tight sm:text-6xl md:text-[5.2rem]"
            style={{ ["--d" as string]: "120ms" }}
          >
            Know the charger{" "}
            <span className="relative isolate whitespace-nowrap italic">
              <span
                aria-hidden
                className="draw absolute -inset-x-1 bottom-[0.06em] -z-10 h-[0.3em] bg-volt"
              />
              works
            </span>{" "}
            before you drive there.
          </h1>
          <p
            className="rise mt-7 max-w-xl text-lg text-muted md:text-xl"
            style={{ ["--d" as string]: "280ms" }}
          >
            Registries tell you a charger exists. They cannot tell you it works. EVIQ adds what
            drivers see on the ground, one tap at a time, and turns it into a status you can check
            in your city.
          </p>
          <div
            className="rise mt-9 flex flex-wrap items-center gap-3"
            style={{ ["--d" as string]: "420ms" }}
          >
            <Link
              href="/map"
              className="inline-flex min-h-12 items-center rounded-full bg-brand px-6 py-3.5 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-ink hover:shadow-lg"
            >
              Open the live map
            </Link>
            <a
              href={MAILTO}
              className="inline-flex min-h-12 items-center rounded-full border border-ink/20 px-6 py-3.5 text-base font-medium transition-all hover:-translate-y-0.5 hover:border-ink"
            >
              Talk to the founders
            </a>
          </div>
          <div className="rise mt-7" style={{ ["--d" as string]: "560ms" }}>
            <p className="text-sm text-muted">Jump to a city:</p>
            <ul className="mt-1 flex flex-wrap gap-x-1">
              {INDIA_CITIES.map((c) => (
                <li key={c.name}>
                  <Link
                    href={cityMapHref(c)}
                    className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-brand underline-offset-4 hover:bg-brand/5 hover:underline"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="rise mt-2 text-sm text-muted" style={{ ["--d" as string]: "680ms" }}>
            No account. We do not save your location in our database.
          </p>
        </div>
        <SameChargerTwice />
      </div>
    </div>
  );
}
