import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

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
        <Card label="What a registry shows">
          <p className="font-medium">Example charger, 2 × CCS 150 kW</p>
          <p className="mt-1 text-sm text-muted">Status field: operational</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-ok/10 px-3 py-1 text-sm font-medium text-ok">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ok" />
            Operational
          </p>
        </Card>
        <Card label="What EVIQ shows">
          <p className="font-medium">Example charger, 2 × CCS 150 kW</p>
          <div className="mt-3">
            <StatusBadge status="reported-broken" text="Reported broken · 1 h ago" />
          </div>
          <ul className="mt-4 divide-y divide-line text-sm">
            <li className="flex justify-between py-1.5">
              <span>Broken</span>
              <span className="text-muted">1 h ago</span>
            </li>
            <li className="flex justify-between py-1.5">
              <span>Broken</span>
              <span className="text-muted">3 h ago</span>
            </li>
            <li className="flex justify-between py-1.5">
              <span>Working</span>
              <span className="text-muted">2 days ago</span>
            </li>
          </ul>
        </Card>
      </div>
      <p className="mt-3 text-xs text-muted">
        Illustration with an invented example, not a real station. The live map shows real ones.
      </p>
    </div>
  );
}

export default function Hero() {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 md:grid-cols-[1.25fr_1fr] md:pb-28 md:pt-24">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Driver-verified reliability for EV charging
        </p>
        <h1 className="mt-5 font-serif text-[2.9rem] leading-[1.02] tracking-tight sm:text-6xl md:text-[5.2rem]">
          Know the charger{" "}
          <span className="relative isolate whitespace-nowrap italic">
            <span
              aria-hidden
              className="absolute -inset-x-1 bottom-[0.06em] -z-10 h-[0.3em] bg-volt"
            />
            works
          </span>{" "}
          before you drive there.
        </h1>
        <p className="mt-7 max-w-xl text-lg text-muted md:text-xl">
          Registries tell you a charger exists. They cannot tell you it works. EVIQ adds what
          drivers see on the ground, one tap at a time, and turns it into a status you can check in
          any city.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/map"
            className="rounded-full bg-brand px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-ink"
          >
            Open the live map
          </Link>
          <a
            href={MAILTO}
            className="rounded-full border border-ink/20 px-6 py-3.5 text-base font-medium transition-colors hover:border-ink"
          >
            Talk to the founders
          </a>
        </div>
        <p className="mt-5 text-sm text-muted">
          No account. Works worldwide. We do not save your location in our database.
        </p>
      </div>
      <SameChargerTwice />
    </div>
  );
}
