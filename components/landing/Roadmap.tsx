"use client";
import { Container } from "@/components/ui/Container";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const phases = [
  {
    p: "Phase 1 — Now",
    t: "Consumer AI Assistant",
    items: [
      "Conversational route queries",
      "Battery health indicators",
      "Queue prediction core",
      "Multi-network integrations",
    ],
    metrics: "Target ARR: $1.2M",
    moat: "Direct vehicle battery logs & cross-network reliability indicators.",
    details:
      "Establishes a base consumer footprint and secures direct battery CAN-bus telemetry data feeds.",
  },
  {
    p: "Phase 2 — Q4 2025",
    t: "Fleet Operations Platform",
    items: [
      "Commercial vehicle scheduling",
      "Dynamic queue slot reservations",
      "Dynamic charging curve predictions",
      "Fleet cost analytics dashboard",
    ],
    metrics: "Target ARR: $5.8M",
    moat: "Proprietary scheduling profiles and multi-network reservation APIs.",
    details:
      "Delivers large-scale charging coordination and route scheduling to commercial EV fleets, reducing charging downtime.",
  },
  {
    p: "Phase 3 — Q2 2026",
    t: "Charging Grid OS",
    items: [
      "Operator demand forecasting",
      "Regional station heatmaps",
      "OCPP smart charge controller",
      "Grid VPP load-balance mode",
    ],
    metrics: "Target ARR: $18.4M",
    moat: "Edge OCPP charging rate controls & grid load prediction models.",
    details:
      "Pivots operators to EVIQ AI as their intelligence operating system, balancing utility grids and station queues automatically.",
  },
];

export default function Roadmap() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  return (
    <section className="py-24 md:py-28 bg-[#05070B] select-none">
      <Container>
        <div className="max-w-[640px] mb-12">
          <p className="text-[12px] font-[650] tracking-widest text-orange uppercase">Roadmap</p>
          <h2 className="text-display mt-3 text-[34px] md:text-[44px] text-white font-bold leading-tight">
            The operating system for EV mobility.
          </h2>
          <p className="mt-4 text-[16px] text-ink-500">
            Click on the roadmap phases below to explore target milestones, business metrics, and
            data moats.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* background timeline line */}
          <div className="hidden lg:block absolute top-[22px] left-8 right-8 h-[2.5px] bg-white/[0.08] z-0" />

          {phases.map((ph, i) => {
            const isSelected = selectedIdx === i;
            return (
              <div
                key={ph.p}
                onClick={() => setSelectedIdx(i)}
                className={`relative z-10 rounded-[22px] p-6 border cursor-pointer transition-all duration-300 snap-cursor ${
                  isSelected
                    ? "bg-[#101820] text-white border-orange shadow-glow"
                    : "bg-[#0A1018] border-white/[0.08] text-ink-500 hover:border-orange/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-[44px] h-[44px] rounded-full text-[12px] font-[700] flex items-center justify-center border-[2.5px] transition-colors ${
                      isSelected
                        ? "bg-orange border-orange text-white shadow-glow"
                        : "bg-slate-900 border-white/[0.08] text-white"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-orange tracking-widest uppercase">
                      ACTIVE FOCUS
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <div
                    className={`text-[11.5px] font-[700] tracking-wider uppercase ${isSelected ? "text-orange" : "text-ink-500"}`}
                  >
                    {ph.p}
                  </div>
                  <div
                    className={`text-[20px] font-[700] mt-1 ${isSelected ? "text-white" : "text-[#A0AEC0]"}`}
                  >
                    {ph.t}
                  </div>

                  <ul
                    className={`mt-4 space-y-[9px] text-[14px] ${isSelected ? "text-[#c6d2e2]" : "text-ink-500"}`}
                  >
                    {ph.items.map((it) => (
                      <li key={it} className="flex items-center gap-2">
                        <span className="text-orange">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic details pane beneath the timeline grid */}
        <div className="mt-10 rounded-[28px] border border-white/[0.08] bg-[#101820] p-6 md:p-8 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="grid md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-1">
                <span className="text-[10.5px] font-[750] tracking-widest text-orange uppercase bg-slate-900 px-3 py-1 rounded-full">
                  PHASE {selectedIdx + 1} METRIC
                </span>
                <div className="text-[22px] font-[750] text-white mt-4 font-mono">
                  {phases[selectedIdx].metrics.split(":")[1].trim()}
                </div>
                <div className="text-[11.5px] font-semibold text-ink-350 uppercase mt-1">
                  {phases[selectedIdx].metrics.split(":")[0].trim()}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="text-[10.5px] font-[700] text-ink-350 uppercase tracking-wider">
                    Phase Overview
                  </div>
                  <p className="text-[14.5px] text-white mt-1 leading-relaxed">
                    {phases[selectedIdx].details}
                  </p>
                </div>
                <div className="border-t border-white/[0.08] pt-4">
                  <div className="text-[10.5px] font-[700] text-ink-350 uppercase tracking-wider">
                    Data Moat Compounder
                  </div>
                  <p className="text-[13.5px] text-[#A0AEC0] mt-1 leading-relaxed italic">
                    &ldquo;{phases[selectedIdx].moat}&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
