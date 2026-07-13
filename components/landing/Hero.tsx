"use client";
import { Container } from "@/components/ui/Container";
import CockpitHud from "@/components/landing/CockpitHud";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-[130px] md:pt-[168px] pb-20 md:pb-28 overflow-hidden bg-[#05070B]">
      {/* Subtle ambient glow — no intense radials */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(255,122,0,0.025),transparent_70%)] pointer-events-none z-0" />

      <Container>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-10 items-center relative z-10">
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-[11px] font-mono tracking-widest text-white/50 uppercase"
            >
              AI Mobility Intelligence Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="mt-6 text-[42px] sm:text-[60px] lg:text-[72px] text-white font-bold leading-[0.94] tracking-tight"
            >
              Intelligently decides where, when and why you should charge.
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-6 max-w-[540px] text-[17px] md:text-[19px] leading-relaxed text-[#A0AEC0]"
            >
              EVIQ AI connects BMS telemetry with live charger health data to eliminate charging
              anxiety before it starts.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a
                href="/demo"
                className="px-[24px] py-[13px] rounded-full bg-orange text-white text-[14px] font-semibold hover:bg-orange/90 active:scale-[0.98] transition-all"
              >
                Try the demo
              </a>
              <a
                href="#access"
                className="px-[24px] py-[13px] rounded-full bg-white/[0.04] text-white text-[14px] font-medium border border-white/[0.08] hover:bg-white/[0.08] active:scale-[0.98] transition-all"
              >
                Request early access
              </a>
            </motion.div>

            {/* Stats row */}
            <div className="mt-12 border-t border-white/[0.06] pt-7 grid grid-cols-3 gap-6">
              {[
                { value: "<42ms", label: "Solver Latency" },
                { value: "99.4%", label: "Port Uptime" },
                { value: "14M+", label: "Miles Optimized" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="text-white font-bold text-[20px] md:text-[22px]">{s.value}</span>
                  <p className="text-[11px] text-[#A0AEC0] mt-1 font-mono uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: CockpitHud */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <CockpitHud />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
