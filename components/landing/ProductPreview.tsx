"use client";
import { Container } from "@/components/ui/Container";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "route" | "ports" | "ledger";

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState<Tab>("route");

  return (
    <section id="demo-preview" className="py-24 md:py-32 bg-[#05070B] border-t border-white/[0.04]">
      <Container>
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <span className="text-[12px] font-bold tracking-widest text-orange uppercase bg-orange/10 px-3 py-1 rounded-full">
            PRODUCT DEMO
          </span>
          <h2 className="text-display mt-6 text-[38px] md:text-[56px] text-white font-bold leading-tight tracking-tight">
            Predictive dashboard in action.
          </h2>
          <p className="mt-4 text-[17px] md:text-[19px] text-[#A0AEC0] max-w-[620px] mx-auto leading-relaxed">
            EVIQ AI plugs directly into consumer infotainment screens and commercial fleet command centers. Explore the dynamic interface below.
          </p>
        </div>

        {/* Console Container */}
        <div className="max-w-[1000px] mx-auto rounded-[28px] border border-white/[0.08] bg-[#0A1018] overflow-hidden shadow-[0_0_50px_rgba(255,122,0,0.02)]">
          {/* Header Tabs */}
          <div className="flex border-b border-white/[0.06] bg-black/20 p-4 justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-white/20 ml-2">|</span>
              <span className="text-[12.5px] font-mono text-[#546b85] tracking-wider uppercase">
                CONSOLE v1.0.4 • CONNECTED
              </span>
            </div>

            <div className="flex gap-2">
              {(["route", "ports", "ledger"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold font-mono transition-all uppercase ${
                    activeTab === tab
                      ? "bg-orange text-white"
                      : "bg-white/5 border border-white/5 text-[#A0AEC0] hover:bg-white/10"
                  }`}
                >
                  {tab === "route" ? "Journey HUD" : tab === "ports" ? "Port Diagnostics" : "Tariff Ledger"}
                </button>
              ))}
            </div>
          </div>

          {/* Console Viewport */}
          <div className="p-6 md:p-8 min-h-[380px] bg-black/40 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {activeTab === "route" && (
                <motion.div
                  key="route"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Route Telemetry */}
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-4">
                    <div>
                      <h4 className="text-[17px] font-bold text-white">Journey Rerouting Simulation</h4>
                      <p className="text-[13px] text-[#A0AEC0] mt-0.5">HKUST Corridor ➔ Kowloon Highway Corridor</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-orange/15 text-orange text-[10px] font-mono font-bold uppercase tracking-wider">
                      AUTOPILOT INGEST ACTIVE
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-4">
                      <span className="text-[10px] text-[#546b85] font-mono uppercase block">CURRENT ESTIMATE</span>
                      <span className="text-[20px] font-bold text-white mt-1 block">12% SoC</span>
                      <span className="text-[11.5px] text-[#A0AEC0] mt-0.5 block">32 miles range remaining</span>
                    </div>
                    <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-4">
                      <span className="text-[10px] text-[#546b85] font-mono uppercase block">AERO & WIND CORRECTION</span>
                      <span className="text-[20px] font-bold text-orange mt-1 block">+14% Draw</span>
                      <span className="text-[11.5px] text-[#A0AEC0] mt-0.5 block">Elevation climbed: 120m</span>
                    </div>
                    <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-4">
                      <span className="text-[10px] text-[#546b85] font-mono uppercase block">REROUTE ACTION</span>
                      <span className="text-[20px] font-bold text-white mt-1 block">Stop B Reserved</span>
                      <span className="text-[11.5px] text-orange mt-0.5 block">Locking Kowloon Bay Hub</span>
                    </div>
                  </div>

                  {/* Route Progress Bar */}
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-[11.5px] font-mono text-[#546b85]">
                      <span>AIRPORT (START)</span>
                      <span className="text-orange font-bold">CURRENT VEHICLE POINT (12mi)</span>
                      <span>HKUST (END)</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                      <div className="h-full bg-orange rounded-full" style={{ width: "38%" }} />
                      <div className="absolute left-[38%] -top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-orange shadow-[0_0_8px_#FF7A00] animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "ports" && (
                <motion.div
                  key="ports"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Charger Diagnostics */}
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-4">
                    <div>
                      <h4 className="text-[17px] font-bold text-white">Live Station Port Diagnostics</h4>
                      <p className="text-[13px] text-[#A0AEC0] mt-0.5">Kowloon Bay Super-Hub (Station B)</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-orange/15 text-orange text-[10px] font-mono font-bold uppercase tracking-wider">
                      Uptime: 99.4%
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-4">
                    {[
                      { port: 1, speed: "350kW", status: "In Use", color: "text-[#546b85] border-white/5 bg-white/[0.01]" },
                      { port: 2, speed: "350kW", status: "In Use", color: "text-[#546b85] border-white/5 bg-white/[0.01]" },
                      { port: 3, speed: "350kW", status: "Ready", color: "text-orange border-orange bg-orange/5" },
                      { port: 4, speed: "150kW", status: "Ready", color: "text-white border-white/10 bg-white/5" },
                    ].map((p) => (
                      <div key={p.port} className={`border rounded-2xl p-4 flex flex-col justify-between ${p.color}`}>
                        <div>
                          <span className="text-[10px] font-mono uppercase block">CONNECTOR</span>
                          <span className="text-[18px] font-bold mt-1 block">Port {p.port}</span>
                        </div>
                        <div className="mt-4 pt-2 border-t border-white/5 flex justify-between text-[11px] font-mono">
                          <span>{p.speed}</span>
                          <span className="font-bold">{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[12.5px] text-[#A0AEC0] italic leading-relaxed">
                    *EVIQ AI models grid temperatures and handshake delays, recommending **Port 3** over other alternatives to secure 350kW rates.
                  </p>
                </motion.div>
              )}

              {activeTab === "ledger" && (
                <motion.div
                  key="ledger"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Pricing optimizations */}
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-4">
                    <div>
                      <h4 className="text-[17px] font-bold text-white">Dynamic Tariff Optimizations</h4>
                      <p className="text-[13px] text-[#A0AEC0] mt-0.5">Avoiding peak periods to limit session expenses</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-orange/15 text-orange text-[10px] font-mono font-bold uppercase tracking-wider">
                      $7.68 SAVED OFF-PEAK
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-5">
                      <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest block mb-2">PEAK SPEED RATE</span>
                      <span className="text-[26px] font-bold text-white">$0.48 / kWh</span>
                      <p className="text-[12.5px] text-[#546b85] mt-1.5">
                        High grid congestion period between 16:00 and 20:00. Rerouting algorithms bypass these zones.
                      </p>
                    </div>

                    <div className="border border-orange/20 bg-orange/5 rounded-2xl p-5">
                      <span className="text-[10px] text-orange font-mono uppercase tracking-widest block mb-2">EVIQ LOCKED SEGMENT</span>
                      <span className="text-[26px] font-bold text-orange">$0.32 / kWh</span>
                      <p className="text-[12.5px] text-[#A0AEC0] mt-1.5">
                        Dynamic tariff locking locks in off-peak slots, reducing commercial fleet costs by up to 33%.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulated Action Drawer */}
            <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between text-[11.5px] font-mono text-[#546b85] flex-wrap gap-4">
              <div>DEVICE LOGS: TELEMETRY STREAM NOMINAL • TARGET METRICS LOCK OK</div>
              <a
                href="/demo"
                className="px-4.5 py-1.5 rounded-full bg-orange text-white hover:bg-orange/95 font-bold uppercase text-[10.5px] tracking-wider transition-all"
              >
                Launch Fully Interactive Cockpit ➔
              </a>
            </div>
          </div>
        </div>

      </Container>
    </section>
  );
}
