"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

const problems = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M9 2L16 14H2L9 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="12.5" r="0.75" fill="currentColor" />
      </svg>
    ),
    title: "21% Hardware Offline Rates",
    body: "Public charging ports are regularly offline, damaged, or derated — causing routing failures drivers only discover on arrival.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5V9L12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "38-Minute Average Hub Wait",
    body: "High-density hubs experience long unpredicted queues. Static apps offer no occupancy forecasting — drivers arrive blind.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M2 14L6 9L10 11L16 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13 4H16V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Unpredictable Battery Range",
    body: "Weather, elevation, and thermal variance cause unexpected range drops. Drivers are left guessing, not planning.",
  },
];

export default function Problem() {
  return (
    <section id="why" className="py-24 md:py-32 bg-[#05070B] border-t border-white/[0.04]">
      <Container>
        <div className="grid lg:grid-cols-2 gap-14 items-center max-w-[1100px] mx-auto">
          <div>
            <span className="text-[11px] font-semibold tracking-widest text-orange uppercase">
              The Problem
            </span>
            <h2 className="mt-4 text-[36px] md:text-[52px] text-white font-bold leading-tight tracking-tight">
              EV charging is broken.
              <br />
              EVIQ fixes it.
            </h2>
            <p className="mt-5 text-[17px] text-[#A0AEC0] leading-relaxed max-w-[460px]">
              Electric vehicles have reached mass adoption. The charging infrastructure has not.
              Drivers navigate fragmented, offline, and unpredictable networks with no real
              intelligence.
            </p>
            <p className="mt-4 text-[13px] text-[#546b85] font-mono leading-relaxed">
              EVIQ AI operates as a predictive layer above existing hardware — solving the three
              core constraints of electric mobility.
            </p>
          </div>

          <div className="space-y-4">
            {problems.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="bg-[#0A1018] border border-white/[0.06] rounded-2xl p-5 flex gap-4 items-start"
              >
                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50">
                  {p.icon}
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white">{p.title}</h4>
                  <p className="text-[13px] text-[#A0AEC0] mt-1 leading-relaxed">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
