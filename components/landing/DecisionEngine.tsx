"use client";
import { Container } from "@/components/ui/Container";
import { useState } from "react";
import { motion } from "framer-motion";

const inputs = [
  {
    id: "bms",
    name: "BMS Battery Telemetry",
    details: "SoC: 12% · Temp: 38.4°C · SoH: 94.6%",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M13 6.5V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <rect x="3" y="6" width="5" height="4" rx="0.5" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "network",
    name: "Network Occupancy Streams",
    details: "Kowloon Bay: 2/10 active · Cyberport: 6/6 (41m queue)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" opacity="0.4" />
        <path
          d="M8 1.5V4M8 12V14.5M1.5 8H4M12 8H14.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "tariff",
    name: "Dynamic Utility Tariffs",
    details: "Peak: $0.48/kWh · Off-peak locked: $0.32/kWh",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M8 4V5M8 11V12M6 7.5C6 6.67 6.9 6 8 6C9.1 6 10 6.67 10 7.5C10 8.33 9.1 9 8 9C6.9 9 6 9.67 6 10.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "topography",
    name: "Topography & Weather",
    details: "Elevation: +120m ahead · Wind: 14mph headwind",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M1 13L5 6L8.5 10L11 7L15 13H1Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const OUTPUT_BY_INPUT: Record<string, { label: string; value: string; accent?: boolean }[]> = {
  bms: [
    { label: "Battery arrival SoC", value: "8% (32mi margins)" },
    { label: "Target charge rate", value: "186 kW thermal-safe" },
    { label: "Cell temp limit", value: "45°C max enforced" },
  ],
  network: [
    { label: "Queue at Station B", value: "0 min (port locked)" },
    { label: "Station A queue", value: "41 min — avoided", accent: false },
    { label: "Station C queue", value: "12 min — avoided", accent: false },
  ],
  tariff: [
    { label: "Off-peak rate locked", value: "$0.32/kWh", accent: true },
    { label: "Savings vs peak", value: "$7.68 this session", accent: true },
    { label: "Tariff window closes", value: "20:00 — 4h margin" },
  ],
  topography: [
    { label: "Range correction", value: "-14% headwind draw" },
    { label: "Adjusted ETA SoC", value: "8% (recalculated)" },
    { label: "Reroute triggered", value: "Mile 28 checkpoint" },
  ],
};

export default function DecisionEngine() {
  const [activeInput, setActiveInput] = useState("bms");
  const outputRows = OUTPUT_BY_INPUT[activeInput] ?? [];

  return (
    <section
      id="decision-engine"
      className="py-24 md:py-32 bg-[#05070B] border-t border-white/[0.04]"
    >
      <Container>
        <div className="max-w-[700px] mb-14">
          <span className="text-[11px] font-semibold tracking-widest text-orange uppercase">
            Real-Time Solver
          </span>
          <h2 className="mt-4 text-[36px] md:text-[52px] text-white font-bold leading-tight tracking-tight">
            The AI Decision Engine.
          </h2>
          <p className="mt-4 text-[17px] text-[#A0AEC0] leading-relaxed max-w-[560px]">
            Select a telemetry feed to see how raw vehicle and environment data converges into a
            single optimal charging action.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.7fr_1fr] gap-6 items-start max-w-[1200px]">
          {/* Input feeds */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
              Active inputs
            </p>
            {inputs.map((input) => {
              const isActive = activeInput === input.id;
              return (
                <button
                  key={input.id}
                  onClick={() => setActiveInput(input.id)}
                  aria-pressed={isActive}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-orange ${
                    isActive
                      ? "bg-[#0A1018] border-orange/40"
                      : "bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex-shrink-0 ${isActive ? "text-orange" : "text-white/30"}`}
                    >
                      {input.icon}
                    </span>
                    <div>
                      <h4
                        className={`text-[13.5px] font-semibold ${isActive ? "text-white" : "text-white/50"}`}
                      >
                        {input.name}
                      </h4>
                      <p className="text-[11.5px] text-[#A0AEC0] mt-0.5 font-mono leading-relaxed">
                        {input.details}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Flow visualizer */}
          <div className="hidden lg:flex flex-col items-center justify-center min-h-[280px] relative">
            <svg viewBox="0 0 120 280" className="w-full h-full absolute inset-0">
              {inputs.map((inp, idx) => {
                const y = 35 + idx * 70;
                const isActive = activeInput === inp.id;
                return (
                  <path
                    key={inp.id}
                    d={`M 10 ${y} Q 60 ${y} 60 140`}
                    fill="none"
                    stroke={isActive ? "#FF7A00" : "rgba(255,255,255,0.05)"}
                    strokeWidth={isActive ? 2 : 1}
                    className="transition-all duration-300"
                  />
                );
              })}
              <path d="M 60 140 H 110" fill="none" stroke="#FF7A00" strokeWidth="2" />
              <circle cx="60" cy="140" r="5" fill="#FF7A00" />
              <circle
                cx="60"
                cy="140"
                r="12"
                fill="none"
                stroke="#FF7A00"
                strokeWidth="1"
                opacity="0.3"
              />
            </svg>
            <span className="text-[9px] font-mono text-orange/70 tracking-widest uppercase absolute bottom-8">
              MPC Solver
            </span>
          </div>

          {/* Output recommendation */}
          <div className="rounded-2xl border border-orange/20 bg-[#0A1018] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange/90 text-white text-[9px] font-mono font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
              Locked
            </div>

            <p className="text-[10px] font-mono text-orange uppercase tracking-widest mb-1">
              Optimal target
            </p>
            <h3 className="text-[17px] font-semibold text-white mb-0.5">Kowloon Bay Super-Hub</h3>
            <p className="text-[11.5px] text-[#546b85] font-mono mb-5">
              Calculated in &lt;42ms · Station B · Port 3
            </p>

            <motion.div
              key={activeInput}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              {outputRows.map((row) => (
                <div
                  key={row.label}
                  className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3.5 flex justify-between items-center"
                >
                  <span className="text-[11.5px] text-[#A0AEC0]">{row.label}</span>
                  <span
                    className={`text-[12.5px] font-semibold font-mono ${row.accent ? "text-orange" : "text-white"}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </motion.div>

            <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-white/40">Port 3 reserved</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
