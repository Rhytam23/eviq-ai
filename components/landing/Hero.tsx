import Link from "next/link";
import TryIt from "@/components/landing/TryIt";
import { INDIA_CITIES, cityMapHref } from "@/lib/cities";
import type { LandingCopy } from "@/lib/landingCopy";

const MAILTO = "mailto:founders@eviq.ai?subject=EVIQ";

export default function Hero({ copy }: { copy: LandingCopy }) {
  const mapHref = copy.mapQuery ? `/map?${copy.mapQuery}` : "/map";
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
      <div className="mx-auto grid max-w-6xl items-start gap-14 px-5 pb-20 pt-14 md:grid-cols-[1.25fr_1fr] md:pb-28 md:pt-24">
        <div>
          <p className="rise inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pl-3 pr-4 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            <span aria-hidden className="relative flex h-2.5 w-2.5">
              <span className="ping absolute inset-0 rounded-full bg-ok motion-reduce:hidden" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-ok" />
            </span>
            {copy.badge}
            <span aria-hidden className="tricolor h-2 w-6 rounded-full border border-line" />
          </p>
          <h1
            className={`rise mt-6 font-serif tracking-tight ${
              copy.htmlLang === "hi"
                ? "text-[2.2rem] leading-[1.25] sm:text-5xl md:text-[3.6rem]"
                : "text-[2.9rem] leading-[1.02] sm:text-6xl md:text-[5.2rem]"
            }`}
            style={{ ["--d" as string]: "120ms" }}
          >
            {copy.heroBefore}
            <span className="relative isolate whitespace-nowrap italic">
              <span
                aria-hidden
                className="draw absolute -inset-x-1 bottom-[0.06em] -z-10 h-[0.3em] bg-volt"
              />
              {copy.heroWord}
            </span>
            {copy.heroAfter}
          </h1>
          <p
            className="rise mt-7 max-w-xl text-lg text-muted md:text-xl"
            style={{ ["--d" as string]: "280ms" }}
          >
            {copy.heroText}
          </p>
          <div
            className="rise mt-9 flex flex-wrap items-center gap-3"
            style={{ ["--d" as string]: "420ms" }}
          >
            <Link
              href={mapHref}
              className="inline-flex min-h-12 items-center rounded-full bg-brand px-6 py-3.5 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-ink hover:shadow-lg"
            >
              {copy.ctaMap}
            </Link>
            <a
              href={MAILTO}
              className="inline-flex min-h-12 items-center rounded-full border border-ink/20 px-6 py-3.5 text-base font-medium transition-all hover:-translate-y-0.5 hover:border-ink"
            >
              {copy.ctaTalk}
            </a>
          </div>
          <div className="rise mt-7" style={{ ["--d" as string]: "560ms" }}>
            <p className="text-sm text-muted">{copy.jump}</p>
            <ul className="mt-1 flex flex-wrap gap-x-1">
              {INDIA_CITIES.map((c) => (
                <li key={c.name}>
                  <Link
                    href={cityMapHref(c) + (copy.mapQuery ? `&${copy.mapQuery}` : "")}
                    className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-brand underline-offset-4 hover:bg-brand/5 hover:underline"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="rise mt-2 text-sm text-muted" style={{ ["--d" as string]: "680ms" }}>
            {copy.noAccount}
          </p>
        </div>
        <div className="rise" style={{ ["--d" as string]: "400ms" }}>
          <p className="mb-3 font-serif text-2xl italic text-brand">{copy.demo.title}</p>
          <TryIt copy={copy.demo} />
        </div>
      </div>
    </div>
  );
}
