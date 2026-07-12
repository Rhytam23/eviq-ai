"use client";
import { Container } from "@/components/ui/Container";
import CockpitHud from "@/components/landing/CockpitHud";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-[130px] md:pt-[170px] pb-20 md:pb-28 overflow-hidden bg-[#05070B] select-none">
      {/* Background radial soft light */}
      <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_0%,rgba(255,122,0,0.03),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 grid-faint opacity-[0.25] pointer-events-none z-0" />

      <Container>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center relative z-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange/20 bg-orange/5 px-3.5 py-1 text-[11px] font-mono tracking-widest text-orange uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange shadow-[0_0_10px_rgba(255,122,0,0.7)] animate-pulse" />
              AI Mobility Intelligence Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-display mt-6 text-[44px] sm:text-[62px] lg:text-[76px] text-white font-bold leading-[0.95] tracking-tight font-sans"
            >
              Intelligently decides where, when and why you should charge.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="mt-6 max-w-[560px] text-[18px] md:text-[20px] leading-relaxed text-[#A0AEC0]"
            >
              EVIQ AI is the world&apos;s first AI Operating System for electric vehicles. By connecting BMS telemetry with charger health data, we eliminate charging anxiety.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="/demo"
                className="px-[26px] py-[14px] rounded-full bg-orange text-white text-[15px] font-[650] hover:bg-orange/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow"
              >
                Launch Simulator
              </a>
              <a
                href="#access"
                className="px-[26px] py-[14px] rounded-full bg-white/[0.03] text-white text-[15px] font-[600] border border-white/[0.08] hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Request early access
              </a>
            </motion.div>

            <div className="mt-14 border-t border-white/[0.06] pt-8 grid grid-cols-3 gap-6 text-left">
              <div>
                <span className="text-white font-[700] text-[20px] md:text-[24px]">&lt;42ms</span>
                <p className="text-[12px] text-[#A0AEC0] mt-1 font-mono uppercase tracking-wider">Solver Latency</p>
              </div>
              <div>
                <span className="text-white font-[700] text-[20px] md:text-[24px]">99.4%</span>
                <p className="text-[12px] text-[#A0AEC0] mt-1 font-mono uppercase tracking-wider">Uptime Accuracy</p>
              </div>
              <div>
                <span className="text-white font-[700] text-[20px] md:text-[24px]">14M+</span>
                <p className="text-[12px] text-[#A0AEC0] mt-1 font-mono uppercase tracking-wider">Miles Optimized</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <CockpitHud />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
