"use client";
import { Container } from "@/components/ui/Container";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const nodes = [
  {
    name: "Vehicle",
    info: "Telemetry: OBD-II / CAN-bus",
    latency: "Transmission: WebSockets / MQTT",
    extra: "State: SoC, temperature, and cell wear",
  },
  {
    name: "Aggregation",
    info: "Stream Broker: Kafka Cluster",
    latency: "Ingress DB: TimescaleDB Hypertables",
    extra: "Data: Live operator APIs synced",
  },
  {
    name: "Prediction",
    info: "Battery AI: Dynamic range forecasting",
    latency: "Queue AI: Temporal Fusion wait time",
    extra: "Model Uptime: 99.2% failure predictions",
  },
  {
    name: "Decision",
    info: "Solver: Model Predictive Control (MPC)",
    latency: "Criteria: Price, speed, and reliability",
    extra: "Output: Dynamic trip rerouting",
  },
  {
    name: "Reservation",
    info: "Scheduler: Multi-network port lock",
    latency: "Queuing: Virtual queue booking",
    extra: "Execution: Instant one-click confirmation",
  },
  {
    name: "Execution",
    info: "In-car sync: HUD navigation update",
    latency: "Reconciliation: Savings ledger compiled",
    extra: "Impact: Eliminating charging anxiety",
  },
];

export default function AIDecisionStrip() {
  const [pos, setPos] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setPos((p) => (p + 1) % nodes.length);
    }, 1250);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section className="py-14 border-y border-black/[0.07] bg-white/70 relative select-none">
      <Container>
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 relative">
          {nodes.map((n, i) => {
            const isActive = i <= pos;
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={n.name}
                className="flex items-center gap-4 shrink-0 relative"
                onMouseEnter={() => {
                  setPaused(true);
                  setHoveredIdx(i);
                }}
                onMouseLeave={() => {
                  setPaused(false);
                  setHoveredIdx(null);
                }}
              >
                <div
                  className={`transition-all duration-300 rounded-full px-4 py-[9px] text-[13px] font-[600] border cursor-pointer relative z-10 ${
                    isActive
                      ? "bg-cyan text-[#032132] border-cyan shadow-glow"
                      : "bg-shell-100 text-ink-700 border-black/[0.08] hover:border-cyan/40"
                  }`}
                >
                  {n.name}

                  {/* Tooltip Popup */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[260px] bg-navy text-white text-[12px] p-4 rounded-[14px] shadow-lift z-50 border border-white/10 pointer-events-none"
                      >
                        <div className="font-[700] text-cyan tracking-wider text-[10.5px] uppercase border-b border-white/10 pb-1.5 mb-2">
                          {n.name} DETAILS
                        </div>
                        <div className="space-y-1 text-[#c6d2e2]">
                          <div>• {n.info}</div>
                          <div>• {n.latency}</div>
                          <div>• {n.extra}</div>
                        </div>
                        {/* tooltip arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-navy" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {i < nodes.length - 1 && (
                  <div className="w-10 md:w-16 h-[1.5px] bg-gradient-to-r from-[#c9d3df] to-[#e5e9f0] relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 w-6 bg-cyan"
                      animate={{ x: i === pos ? ["-24px", "64px"] : "-24px" }}
                      transition={{
                        duration: i === pos ? 1.05 : 0,
                        ease: "linear",
                        repeat: i === pos ? Infinity : 0,
                      }}
                      style={{ opacity: i === pos ? 1 : 0 }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div className="ml-3 text-emerald-600 font-[700] text-[14px] transition-colors">
            +${(4.5 + pos * 1.2).toFixed(2)} saved
          </div>
        </div>
        <p className="mt-2 text-[13.5px] text-ink-500">
          AI decision loop • 42ms p95 • Hover nodes to explore prediction factors
        </p>
      </Container>
    </section>
  );
}
