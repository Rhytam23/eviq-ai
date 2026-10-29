import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import StatusRules from "@/components/landing/StatusRules";
import {
  BROKEN_WINDOW_HOURS,
  COOLDOWN_MINUTES,
  REPORT_RETENTION_HOURS,
  VERIFIED_WINDOW_HOURS,
} from "@/lib/reliability";

export const metadata: Metadata = {
  title: "How statuses work",
  description:
    "The exact rules EVIQ uses to label a charger, how long reports count, and how we limit abuse.",
};

export default function HowItWorksPage() {
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
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
          How a status is decided
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          There is no hidden score. Every charger gets one of four labels from the rules below. This
          page is rendered from the same constants the app and the tests use, so it cannot drift
          from the code.
        </p>

        <div className="mt-12">
          <h2 className="mb-6 font-serif text-3xl">The four labels</h2>
          <StatusRules />
        </div>

        <section className="mt-14 max-w-2xl space-y-4 leading-relaxed">
          <h2 className="font-serif text-3xl">The numbers, in one place</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>{`A "working" or "busy" report keeps a charger verified for ${VERIFIED_WINDOW_HOURS} hours.`}</li>
            <li>{`A "broken" report flags a charger for ${BROKEN_WINDOW_HOURS} hours.`}</li>
            <li>{`Reports older than ${REPORT_RETENTION_HOURS} hours are ignored.`}</li>
            <li>{`One report per charger per client every ${COOLDOWN_MINUTES} minutes.`}</li>
          </ul>
          <h2 className="pt-6 font-serif text-3xl">What we do not know</h2>
          <p className="text-muted">
            A report is one driver&apos;s word. We cannot prove it, so reports expire, the newest
            report wins, and a determined attacker rotating networks could still skew a single
            charger. Price, live availability and queue times are not published by the registries we
            use, so we show them as unknown, never as an estimate.
          </p>
          <h2 className="pt-6 font-serif text-3xl">Where the data comes from</h2>
          <p className="text-muted">
            Chargers, connectors and operator status come from Open Charge Map (when a key is
            configured) or OpenStreetMap. Driver reports are EVIQ&apos;s own. Each station shows its
            source.
          </p>
          <p>
            <Link
              href="/developers"
              className="inline-flex min-h-11 items-center text-brand underline"
            >
              Read the data through the API
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
