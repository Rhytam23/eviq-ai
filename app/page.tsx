import Link from "next/link";
import Logo from "@/components/Logo";
import DataApi from "@/components/landing/DataApi";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Roadmap from "@/components/landing/Roadmap";
import Section from "@/components/landing/Section";
import StatusRules from "@/components/landing/StatusRules";

const GAP = [
  {
    title: "A registry knows where, not whether",
    body: "Open Charge Map and OpenStreetMap record that a charger exists and who runs it. A status field can exist, but it depends on someone updating it, so it is often blank or stale.",
  },
  {
    title: "Drivers find out on arrival",
    body: "The first person to learn a charger is dead is whoever drives to it. That knowledge is never written down for the next driver.",
  },
  {
    title: "The people who know are right there",
    body: "Every driver at a charger can answer one question in one tap: did it work? Nobody collects those answers, so everyone starts from zero.",
  },
];

const STEPS = [
  {
    title: "Read the registry",
    body: "We pull chargers, connectors, power and operator status from Open Charge Map, or OpenStreetMap anywhere it has no key or no coverage.",
  },
  {
    title: "Ask the drivers",
    body: "At a charger, one tap: working, broken or busy. No account, no form. Reports age out so old news cannot mislead.",
  },
  {
    title: "Compute one status, show the work",
    body: "Fresh driver reports and operator data become a single label with the time it was confirmed and the rule behind it.",
  },
];

export default function Page() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav
            aria-label="Sections"
            className="hidden items-center gap-2 text-sm text-muted md:flex"
          >
            {[
              ["/#how-it-works", "How it works"],
              ["/how-it-works", "Status rules"],
              ["/#data-and-api", "Data and API"],
              ["/developers", "Developers"],
              ["/#faq", "FAQ"],
            ].map(([href, label]) => (
              <a
                key={href}
                className="inline-flex min-h-11 items-center px-3 hover:text-ink"
                href={href}
              >
                {label}
              </a>
            ))}
          </nav>
          <Link
            href="/map"
            className="inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-medium text-white hover:bg-ink"
          >
            Open map
          </Link>
        </div>
      </header>

      <main>
        <Hero />

        <Section
          id="the-gap"
          number="01"
          title={
            <>
              A charger on a map is a <em>promise</em>. Nobody checks it.
            </>
          }
        >
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {GAP.map((g) => (
              <div key={g.title} className="bg-surface p-7">
                <h3 className="font-serif text-2xl leading-snug">{g.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{g.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="how-it-works"
          number="02"
          title="Registry data plus what drivers actually see."
          intro="EVIQ is not another charger directory. It is a reliability layer on top of the open ones."
        >
          <ol className="grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="font-serif text-6xl italic text-brand/30">{i + 1}</span>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="status-rules"
          number="03"
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
          number="04"
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
          number="05"
          title="Where we are, honestly."
          intro="This is an early product. The map and the report loop work end to end. Everything marked next or later is not built."
        >
          <Roadmap />
        </Section>

        <Section id="faq" number="06" title="Questions we would ask.">
          <Faq />
        </Section>

        <section className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 md:flex-row md:items-center md:justify-between">
            <h2 className="max-w-xl font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              See what is working near you, right now.
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/map"
                className="rounded-full bg-brand px-6 py-3.5 font-medium text-white hover:bg-ink"
              >
                Open the live map
              </Link>
              <a
                href="mailto:founders@eviq.ai?subject=EVIQ"
                className="rounded-full border border-ink/20 px-6 py-3.5 font-medium hover:border-ink"
              >
                founders@eviq.ai
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
