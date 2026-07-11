"use client";
import { Container } from "@/components/ui/Container";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    k: "01",
    side: "left",
    t: "Vehicle Telemetry Ingestion",
    d: "Reads OBD-II and battery management system CAN-bus streams at 1Hz intervals.",
    tech: "MQTT WebSockets Client",
  },
  {
    k: "02",
    side: "right",
    t: "Event Ingestion Broker",
    d: "Buffers time-series metrics through Kafka topics into partitioned TimescaleDB hypertables.",
    tech: "Partitioned Event Streams",
  },
  {
    k: "03",
    side: "left",
    t: "Predictive Range Forecasting",
    d: "Temporal Fusion Transformers predict battery capacity curves and wait congestion 120 minutes out.",
    tech: "Quantile Regression TFT",
  },
  {
    k: "04",
    side: "right",
    t: "MPC Route Optimization",
    d: "Solver models route elevations, traffic speeds, pricing tariffs, and weather to select optimal stops.",
    tech: "Linear MPC Solver",
  },
  {
    k: "05",
    side: "left",
    t: "Smart Reservation Lock",
    d: "Secures charger reservations on partner operator endpoints, checking slot locks dynamically.",
    tech: "Cross-Network API Sync",
  },
  {
    k: "06",
    side: "right",
    t: "Session Reconciliation",
    d: "Reconciles completed charge time, prices, and SOC health metrics to compile verified savings ledgers.",
    tech: "Explainability Register",
  },
];

export default function SolutionPipeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const lineDraw = useTransform(scrollYProgress, [0.08, 0.95], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      id="product"
      className="py-24 md:py-32 bg-white relative overflow-hidden select-none"
    >
      <Container>
        <div className="max-w-[700px] mx-auto text-center mb-20">
          <p className="text-[12px] font-[650] tracking-widest text-ink-350 uppercase">
            The Decision Pipeline
          </p>
          <h2 className="text-display mt-3 text-[34px] md:text-[46px] text-navy font-bold leading-tight">
            An automated loop,
            <br />
            not just another maps app.
          </h2>
          <p className="mt-4 text-[17px] text-ink-700 max-w-[540px] mx-auto">
            EVIQ AI coordinates telemetry, prediction models, and reservation engines in a continuous, safety-filtered cycle.
          </p>
        </div>

        {/* Vertical Pipeline Timeline */}
        <div className="relative max-w-[860px] mx-auto">
          {/* Central spine line */}
          <div className="absolute left-[36px] md:left-1/2 top-4 bottom-4 w-[2px] bg-black/[0.06] -translate-x-1/2 z-0" />

          {/* Animated active path draw */}
          <motion.div
            style={{ height: lineDraw }}
            className="absolute left-[36px] md:left-1/2 top-4 w-[2px] bg-cyan -translate-x-1/2 z-10 origin-top"
          />

          <div className="space-y-12">
            {steps.map((s, idx) => {
              const isLeft = s.side === "left";
              return (
                <div
                  key={s.k}
                  className={`flex flex-col md:flex-row items-start md:items-center relative z-20 ${
                    isLeft ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Spine node indicator */}
                  <div className="absolute left-[36px] md:left-1/2 w-8 h-8 rounded-full bg-white border border-[#c6d4e2] flex items-center justify-center -translate-x-1/2 font-[700] text-[12px] text-navy shadow-soft z-30 transition-all">
                    <motion.div
                      className="absolute inset-1 rounded-full bg-cyan"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: "-120px" }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                    />
                    <span className="relative z-40 text-[#02132a] text-[10.5px]">{s.k}</span>
                  </div>

                  {/* Left / Right Card alignment wrapper */}
                  <div className="w-full md:w-1/2 pl-14 md:pl-0 md:px-12">
                    <motion.div
                      initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-120px" }}
                      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-[#fbfcfe] rounded-[22px] border border-black/[0.07] p-6 shadow-soft hover:shadow-lift hover:border-cyan/35 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-cyan tracking-wider uppercase bg-navy/5 px-2 py-0.5 rounded">
                          {s.tech}
                        </span>
                      </div>
                      <h3 className="mt-3 font-[680] text-[18px] text-navy tracking-tight">
                        {s.t}
                      </h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-ink-600 font-[450]">
                        {s.d}
                      </p>
                    </motion.div>
                  </div>

                  {/* Empty cell spacer on the opposite side */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-16 text-[12.5px] text-ink-400 font-semibold">
          *All pipeline telemetry metrics and processing flows represent verified operational limits.
        </div>
      </Container>
    </section>
  );
}
