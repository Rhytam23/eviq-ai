"use client";
import { Container } from "@/components/ui/Container";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const inputs = [
  {
    id: "bms",
    name: "BMS Battery Telemetry",
    details: "State of Charge: 12% • Temperature: 38.4°C • SOH: 94.6%",
    icon: "🔋",
  },
  {
    id: "network",
    name: "Network Occupancy Streams",
    details: "Kowloon Bay Hub: 2/10 ports active • Cyberport: 6/6 active (41m queue)",
    icon: "⚡",
  },
  {
    id: "tariff",
    name: "Dynamic Utility Tariffs",
    details: "Peak pricing: $0.48/kWh • Off-peak locked: $0.32/kWh",
    icon: "💵",
  },
  {
    id: "topography",
    name: "Topography & Weather",
    details: "Elevation climb: +120m ahead • Wind: 14mph headwind friction",
    icon: "⛰️",
  },
];

const recommendation = {
  title: "EVIQ Optimal Charging Target",
  target: "Kowloon Bay Super-Hub (Station B)",
  etaSoc: "Arrive with 8% SoC (32mi safe margins)",
  savings: "$7.68 Off-Peak Locked Saving",
  waitSaved: "33 Mins Queue Time Saved",
  port: "Port 3 Reserved & Secured",
};

export default function DecisionEngine() {
  const [activeInput, setActiveInput] = useState<string>("bms");

  return (
    <section className="py-24 md:py-32 bg-[#05070B] border-t border-white/[0.04]">
      <Container>
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <span className="text-[12px] font-bold tracking-widest text-orange uppercase bg-orange/10 px-3 py-1 rounded-full">
            REAL-TIME SOLVER
          </span>
          <h2 className="text-display mt-6 text-[38px] md:text-[56px] text-white font-bold leading-tight tracking-tight">
            The AI Decision Engine.
          </h2>
          <p className="mt-4 text-[17px] md:text-[19px] text-[#A0AEC0] max-w-[620px] mx-auto leading-relaxed">
            Click the telemetry feeds on the left to watch raw parameters converge dynamically into
            a single optimal charging action.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.8fr_1.1fr] gap-8 items-center max-w-[1200px] mx-auto relative">
          {/* Left Column: Data Feeds */}
          <div className="space-y-4">
            <h3 className="text-[#546b85] text-[11px] font-mono tracking-widest uppercase mb-2 pl-2">
              ACTIVE VEHICLE & ENV INPUTS
            </h3>
            {inputs.map((input) => {
              const isActive = activeInput === input.id;
              return (
                <button
                  key={input.id}
                  onClick={() => setActiveInput(input.id)}
                  className={`w-full text-left p-6 rounded-[22px] border transition-all duration-300 ${
                    isActive
                      ? "bg-[#0A1018] border-orange shadow-[0_0_20px_rgba(255,122,0,0.03)]"
                      : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{input.icon}</span>
                    <div>
                      <h4
                        className={`text-[15.5px] font-bold ${isActive ? "text-orange" : "text-white"}`}
                      >
                        {input.name}
                      </h4>
                      <p className="text-[12.5px] text-[#A0AEC0] mt-1 font-mono">{input.details}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Middle Column: Flow Visualizer */}
          <div className="hidden lg:flex flex-col items-center justify-center h-full relative min-h-[300px]">
            <svg viewBox="0 0 200 400" className="w-full h-full absolute inset-0">
              {/* Paths from inputs to recommendation */}
              <path
                d="M 10 80 Q 100 80 100 200"
                fill="none"
                stroke={activeInput === "bms" ? "#FF7A00" : "rgba(255,255,255,0.06)"}
                strokeWidth={activeInput === "bms" ? 3 : 1.5}
                className="transition-all duration-300"
              />
              <path
                d="M 10 160 Q 100 160 100 200"
                fill="none"
                stroke={activeInput === "network" ? "#FF7A00" : "rgba(255,255,255,0.06)"}
                strokeWidth={activeInput === "network" ? 3 : 1.5}
                className="transition-all duration-300"
              />
              <path
                d="M 10 240 Q 100 240 100 200"
                fill="none"
                stroke={activeInput === "tariff" ? "#FF7A00" : "rgba(255,255,255,0.06)"}
                strokeWidth={activeInput === "tariff" ? 3 : 1.5}
                className="transition-all duration-300"
              />
              <path
                d="M 10 320 Q 100 320 100 200"
                fill="none"
                stroke={activeInput === "topography" ? "#FF7A00" : "rgba(255,255,255,0.06)"}
                strokeWidth={activeInput === "topography" ? 3 : 1.5}
                className="transition-all duration-300"
              />

              {/* Output path */}
              <path d="M 100 200 H 190" fill="none" stroke="#FF7A00" strokeWidth="3" />

              {/* Central convergence node */}
              <circle cx="100" cy="200" r="8" fill="#FF7A00" />
              <circle
                cx="100"
                cy="200"
                r="16"
                fill="none"
                stroke="#FF7A00"
                strokeWidth="1.5"
                className="animate-ping"
              />
            </svg>
            <span className="text-[10px] font-mono text-orange tracking-widest absolute top-[215px] uppercase">
              MPC SOLVER
            </span>
          </div>

          {/* Right Column: AI Output recommendation */}
          <div className="rounded-[28px] border border-orange/20 bg-[#0A1018] p-8 shadow-[0_0_50px_rgba(255,122,0,0.035)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange text-white text-[9px] font-mono font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
              LOCKED & VERIFIED
            </div>

            <span className="text-[10.5px] font-bold text-orange tracking-wider font-mono uppercase block mb-3">
              {recommendation.title}
            </span>

            <h3 className="text-[22px] font-bold text-white mb-2 leading-tight">
              {recommendation.target}
            </h3>
            <p className="text-[13px] text-[#A0AEC0] font-mono mb-6">
              Calculated dynamically in &lt;42ms
            </p>

            <div className="space-y-4">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] text-[#546b85] font-mono uppercase">
                    BATTERY STATUS
                  </div>
                  <div className="text-[14.5px] font-bold text-white mt-0.5">
                    {recommendation.etaSoc}
                  </div>
                </div>
                <span className="text-xl">📊</span>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] text-[#546b85] font-mono uppercase">
                    TARIFF LEDGER
                  </div>
                  <div className="text-[14.5px] font-bold text-orange mt-0.5">
                    {recommendation.savings}
                  </div>
                </div>
                <span className="text-xl">💰</span>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] text-[#546b85] font-mono uppercase">
                    ROUTE DELAYS
                  </div>
                  <div className="text-[14.5px] font-bold text-orange mt-0.5">
                    {recommendation.waitSaved}
                  </div>
                </div>
                <span className="text-xl">⏱️</span>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] text-[#546b85] font-mono uppercase">SECURE PORT</div>
                  <div className="text-[14.5px] font-bold text-white mt-0.5">
                    {recommendation.port}
                  </div>
                </div>
                <span className="text-xl">🔒</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
