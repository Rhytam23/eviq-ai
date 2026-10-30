import Link from "next/link";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import WhatsAppShare from "@/components/WhatsAppShare";
import DataApi from "@/components/landing/DataApi";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import PinField from "@/components/landing/PinField";
import Roadmap from "@/components/landing/Roadmap";
import Section from "@/components/landing/Section";
import StatusRules from "@/components/landing/StatusRules";
import { INDIA_CITIES, cityMapHref } from "@/lib/cities";
import type { Lang } from "@/lib/i18n";
import { LANDING_COPY } from "@/lib/landingCopy";

const ENGLISH_ONLY_NUMBERS = { rules: "04", data: "05", status: "06", faq: "07" };

export default function LandingPage({ lang }: { lang: Lang }) {
  const copy = LANDING_COPY[lang];
  const home = lang === "hi" ? "/hi" : "/";
  const mapHref = copy.mapQuery ? `/map?${copy.mapQuery}` : "/map";
  const [gapA, gapB, gapC] = copy.gapTitle;
  const [indiaA, indiaB, indiaC] = copy.indiaTitle;

  return (
    <div lang={copy.htmlLang}>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-5">
          <Logo />
          <nav
            aria-label="Sections"
            className="hidden items-center gap-2 text-sm text-muted md:flex"
          >
            {copy.nav.map(([href, label]) => (
              <a
                key={href}
                className="inline-flex min-h-11 items-center px-3 hover:text-ink"
                href={href}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Link
              href={copy.switchLang.href}
              lang={copy.switchLang.lang}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-brand hover:bg-brand/5"
            >
              {copy.switchLang.label}
            </Link>
            <Link
              href={mapHref}
              className="inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-medium text-white hover:bg-ink"
            >
              {copy.openMap}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Hero copy={copy} />

        <div
          aria-hidden
          className="marquee overflow-hidden border-y border-line bg-brand py-3.5 text-paper"
        >
          <div className="marquee-track flex w-max gap-10 whitespace-nowrap font-serif text-xl italic">
            {[...copy.marquee, ...copy.marquee].map((m, i) => (
              <span key={i} className="flex items-center gap-10">
                {m}
                <span className="h-1.5 w-1.5 rounded-full bg-volt" />
              </span>
            ))}
          </div>
        </div>

        <Section
          id="the-gap"
          number="01"
          label={lang === "hi" ? "समस्या" : undefined}
          title={
            <>
              {gapA}
              <em>{gapB}</em>
              {gapC}
            </>
          }
        >
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {copy.gap.map((g) => (
              <div key={g.title} className="bg-surface p-7 transition-colors hover:bg-paper">
                <h3 className="font-serif text-2xl leading-snug">{g.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{g.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="how-it-works"
          number="02"
          label={lang === "hi" ? "कैसे काम करता है" : undefined}
          title={copy.howTitle}
          intro={copy.howIntro}
        >
          <ol className="grid gap-10 md:grid-cols-3">
            {copy.steps.map((s, i) => (
              <li key={s.title} className="lift -m-4 rounded-2xl border border-transparent p-4">
                <span className="font-serif text-6xl italic text-brand/30">{i + 1}</span>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="india-first"
          number="03"
          label={lang === "hi" ? "भारत पहले" : undefined}
          title={
            <>
              {indiaA}
              <em>{indiaB}</em>
              {indiaC}
            </>
          }
          intro={copy.indiaIntro}
        >
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
            <ul className="grid grid-cols-2 gap-3">
              {INDIA_CITIES.map((c, i) => (
                <li key={c.name}>
                  <Reveal delay={i * 70}>
                    <Link
                      href={cityMapHref(c) + (copy.mapQuery ? `&${copy.mapQuery}` : "")}
                      className="lift group flex min-h-24 flex-col justify-between rounded-2xl border border-line bg-surface p-5"
                    >
                      <span className="font-serif text-2xl">{c.name}</span>
                      <span className="mt-4 text-sm text-brand">
                        {copy.openCity}{" "}
                        <span
                          aria-hidden
                          className="inline-block transition-transform group-hover:translate-x-1"
                        >
                          &rarr;
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
            <PinField note={copy.indiaMapNote} queryString={copy.mapQuery} />
          </div>
        </Section>

        {copy.englishNote && (
          <p className="border-t border-line bg-surface px-5 py-4 text-center text-sm text-muted">
            {copy.englishNote}
          </p>
        )}

        <div lang="en">
          <Section
            id="status-rules"
            number={ENGLISH_ONLY_NUMBERS.rules}
            title={
              <>
                Four labels. The rules are <em>public</em>.
              </>
            }
            intro="No score from a model nobody can inspect. Every status is one of four labels, chosen by a short rule you can read, and the same rules run in the code and are tested. Full rules on the rules page."
          >
            <StatusRules />
          </Section>

          <Section
            id="data-and-api"
            number={ENGLISH_ONLY_NUMBERS.data}
            tone="dark"
            title={
              <>
                The map collects it. The <em>data</em> is the business.
              </>
            }
          >
            <DataApi />
          </Section>

          <Section
            id="status"
            number={ENGLISH_ONLY_NUMBERS.status}
            title="Where we are, honestly."
            intro="This is an early product. The map and the report loop work end to end. Everything marked next or later is not built."
          >
            <Roadmap />
          </Section>

          <Section id="faq" number={ENGLISH_ONLY_NUMBERS.faq} title="Questions we would ask.">
            <Faq />
          </Section>
        </div>

        <section className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 md:flex-row md:items-center md:justify-between">
            <h2 className="max-w-xl font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              {copy.closing}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={mapHref}
                className="rounded-full bg-brand px-6 py-3.5 font-medium text-white hover:bg-ink"
              >
                {copy.ctaMap}
              </Link>
              <WhatsAppShare
                text={
                  lang === "hi"
                    ? "EVIQ: गाड़ी निकालने से पहले जानें कि EV चार्जर चलता है या नहीं।"
                    : "EVIQ: know whether an EV charger works before you drive there."
                }
                path={home}
                label={lang === "hi" ? "WhatsApp पर शेयर करें" : "Share on WhatsApp"}
                className="rounded-full border border-ink/20 px-6 py-3.5 font-medium text-ok hover:border-ink"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
