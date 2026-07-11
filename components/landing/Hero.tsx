"use client";
import { Container } from "@/components/ui/Container";
import BuildingVisual from "@/components/landing/BuildingVisual";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-[120px] md:pt-[152px] pb-16 md:pb-24 overflow-hidden">
      {/* ambient grid */}
      <div className="absolute inset-0 grid-faint opacity-[0.9] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      <div
        className="absolute -top-32 right-[-10%] w-[760px] h-[520px] rounded-full blur-[120px] opacity-[0.17] pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, #8de4ff 0%, #4FD1FF 45%, transparent 70%)",
        }}
      />

      <Container>
        <div className="grid lg:grid-cols-[1.09fr_0.91fr] gap-14 lg:gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-[7px] text-[11.5px] font-[550] text-ink-700 shadow-sm"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-cyan shadow-[0_0_10px_rgba(79,209,255,0.7)]" />
              AI Mobility Intelligence Platform • Private beta
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.78, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="text-display mt-7 text-[40px] sm:text-[54px] lg:text-[68px] text-navy font-bold leading-tight"
            >
              Know Where To Charge.<br />Know Why.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-6 max-w-[540px] text-[17px] md:text-[18.5px] leading-relaxed text-ink-700 font-[450]"
            >
              EVIQ AI predicts the best charging decision using real-time intelligence, battery awareness and infrastructure analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <a
                href="/demo"
                className="px-[22px] py-[13px] rounded-full bg-navy text-white text-[15px] font-[600] shadow-lift hover:translate-y-[-1px] transition-transform"
              >
                Try AI Assistant
              </a>
              <a
                href="/demo"
                className="px-[22px] py-[13px] rounded-full bg-white text-navy text-[15px] font-[600] border border-black/[0.11] shadow-soft hover:bg-[#fafafa] transition-colors"
              >
                Interactive Demo
              </a>
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-8 text-[13px] text-ink-500">
              <div>
                <span className="text-navy font-[650] text-[15px]">&lt;90ms</span>
                <br />
                Decision latency
              </div>
              <div>
                <span className="text-navy font-[650] text-[15px]">99.2%</span>
                <br />
                Charger reliability
              </div>
              <div>
                <span className="text-navy font-[650] text-[15px]">14M+</span>
                <br />
                Miles optimized
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.985, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <BuildingVisual />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
