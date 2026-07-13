"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

const legacy = [
  {
    title: "Static Occupancy Reports",
    body: 'Shows chargers as "Available" based on stale data, causing surprise queues on arrival.',
  },
  {
    title: "Phantom Green Dots",
    body: "Fails to detect offline, damaged, or derated charger units until drivers manually report issues.",
  },
  {
    title: "Blind Charging Rates",
    body: "Forces maximum power regardless of battery state, driving degradation up by 3.2× over lifetime.",
  },
];

const eviq = [
  {
    title: "45-Minute Queue Forecasts",
    body: "Predicts station availability from incoming vehicle telemetry, locking slots ahead of arrivals.",
  },
  {
    title: "Thermal & Uptime Scoring",
    body: "Continuously scans port health and thermal profiles, routing drivers away from degraded hardware.",
  },
  {
    title: "Active Cell Preservation",
    body: "Integrates live battery SoH profiles to deliver thermal-aware charge rates that extend lifespan.",
  },
];

export default function WhyFail() {
  return (
    <section id="platform" className="py-24 md:py-32 bg-[#05070B] border-t border-white/[0.04]">
      <Container>
        <div className="max-w-[720px] mb-14">
          <span className="text-[11px] font-semibold tracking-widest text-orange uppercase">
            The Paradigm Shift
          </span>
          <h2 className="mt-4 text-[36px] md:text-[52px] text-white font-bold leading-tight tracking-tight">
            Why legacy charging maps fail.
          </h2>
          <p className="mt-4 text-[17px] text-[#A0AEC0] leading-relaxed max-w-[580px]">
            Existing maps answer{" "}
            <span className="text-white/70 italic">&ldquo;where is a charger.&rdquo;</span> EVIQ AI
            predicts if it works, when it&apos;s free, and how it affects your battery.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-[1100px]">
          {/* Legacy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-7 md:p-9 flex flex-col"
          >
            <div className="text-[10px] font-mono tracking-widest uppercase text-white/25 mb-4">
              Legacy Map Finders
            </div>
            <h3 className="text-[18px] font-semibold text-white/40 mb-6">
              Static &amp; Reactive Databases
            </h3>
            <ul className="space-y-5 flex-1">
              {legacy.map((item) => (
                <li key={item.title} className="flex gap-3 items-start">
                  <span className="mt-1 flex-shrink-0 text-red-500/70 font-bold text-[13px]">
                    ✕
                  </span>
                  <div>
                    <h4 className="text-[14px] font-semibold text-white/60">{item.title}</h4>
                    <p className="text-[12.5px] text-[#546b85] mt-1 leading-relaxed">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-7 pt-5 border-t border-white/[0.04] text-[11px] text-[#546b85] font-mono">
              Status: stale data · drivers stranded
            </div>
          </motion.div>

          {/* EVIQ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-orange/20 bg-[#0A1018] p-7 md:p-9 flex flex-col"
          >
            <div className="text-[10px] font-mono tracking-widest uppercase text-orange mb-4">
              EVIQ AI Predictive OS
            </div>
            <h3 className="text-[18px] font-semibold text-white mb-6">
              Dynamic &amp; Proactive Orchestration
            </h3>
            <ul className="space-y-5 flex-1">
              {eviq.map((item) => (
                <li key={item.title} className="flex gap-3 items-start">
                  <span className="mt-1 flex-shrink-0 text-orange font-bold text-[13px]">✓</span>
                  <div>
                    <h4 className="text-[14px] font-semibold text-white">{item.title}</h4>
                    <p className="text-[12.5px] text-[#A0AEC0] mt-1 leading-relaxed">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-7 pt-5 border-t border-orange/10 text-[11px] text-orange font-mono flex justify-between items-center">
              <span>Status: active · 99.4% reliability</span>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
