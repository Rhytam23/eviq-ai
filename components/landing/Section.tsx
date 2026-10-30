import Reveal from "@/components/Reveal";

export default function Section({
  id,
  number,
  label,
  title,
  intro,
  children,
  tone = "paper",
}: {
  id: string;
  number: string;
  label?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children: React.ReactNode;
  tone?: "paper" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <section
      id={id}
      className={`scroll-mt-16 ${dark ? "bg-brand text-paper" : "border-t border-line"}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "text-volt" : "text-brand"}`}
          >
            {number} &mdash; {label ?? id.replace(/-/g, " ")}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-4 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl"
          >
            {title}
          </h2>
          {intro && (
            <p className={`mt-5 max-w-2xl text-lg ${dark ? "text-paper/80" : "text-muted"}`}>
              {intro}
            </p>
          )}
        </Reveal>
        <Reveal className="mt-12 md:mt-16" delay={120}>
          {children}
        </Reveal>
      </div>
    </section>
  );
}
