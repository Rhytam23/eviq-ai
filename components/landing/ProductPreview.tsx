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
        <div className="max-w-[700px] mb-14">
          <span className="text-[11px] font-semibold tracking-widest text-orange uppercase">
            Product Preview
          </span>
          <h2 className="mt-4 text-[36px] md:text-[52px] text-white font-bold leading-tight tracking-tight">
            Predictive dashboard in action.
          </h2>
          <p className="mt-4 text-[17px] text-[#A0AEC0] leading-relaxed max-w-[540px]">
            EVIQ AI plugs directly into consumer infotainment screens and fleet command centers.
            Explore the interface below.
          </p>
        </div>

        {/* Console */}
        <div className="max-w-[960px] rounded-2xl border border-white/[0.08] bg-[#0A1018] overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/[0.06] bg-black/20 px-5 py-3 justify-between items-center flex-wrap gap-3">
            <div className="text-[11px] font-mono text-white/25 tracking-wider uppercase">
              EVIQ Console · v1.0.4
            </div>
            <div className="flex gap-1.5">
              {(["route", "ports", "ledger"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                  className={`px-4 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-orange ${
                    activeTab === tab
                      ? "bg-orange text-white"
                      : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70"
                  }`}
                >
                  {tab === "route"
                    ? "Journey HUD"
                    : tab === "ports"
                      ? "Port Diagnostics"
                      : "Tariff Ledger"}
                </button>
              ))}
            </div>
          </div>

          {/* Viewport */}
          <div className="p-6 md:p-8 min-h-[360px] flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === "route" && (
                <motion.div
                  key="route"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 flex-1"
                >
                  <div className="flex justify-between items-start border-b border-white/[0.05] pb-4">
                    <div>
                      <h4 className="text-[15px] font-semibold text-white">Journey Rerouting</h4>
                      <p className="text-[12.5px] text-[#A0AEC0] mt-0.5">
                        HKUST Corridor → Kowloon Bay Hub
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-orange/10 text-orange text-[10px] font-mono font-semibold uppercase tracking-wider border border-orange/20">
                      Active
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { label: "Current SoC", value: "12%", sub: "32 miles remaining" },
                      {
                        label: "Aero Correction",
                        value: "+14% draw",
                        sub: "Elevation: +120m",
                        orange: true,
                      },
                      { label: "Reroute Action", value: "Stop B", sub: "Kowloon Bay locked" },
                    ].map((c) => (
                      <div
                        key={c.label}
                        className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-4"
                      >
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">
                          {c.label}
                        </span>
                        <span
                          className={`text-[18px] font-bold mt-1 block ${c.orange ? "text-orange" : "text-white"}`}
                        >
                          {c.value}
                        </span>
                        <span className="text-[11px] text-[#A0AEC0] mt-0.5 block">{c.sub}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10.5px] font-mono text-[#546b85]">
                      <span>Airport (Start)</span>
                      <span className="text-orange">● Mile 12 (current)</span>
                      <span>HKUST (End)</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.04]">
                      <div className="h-full bg-orange rounded-full" style={{ width: "38%" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "ports" && (
                <motion.div
                  key="ports"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 flex-1"
                >
                  <div className="flex justify-between items-start border-b border-white/[0.05] pb-4">
                    <div>
                      <h4 className="text-[15px] font-semibold text-white">Port Diagnostics</h4>
                      <p className="text-[12.5px] text-[#A0AEC0] mt-0.5">
                        Kowloon Bay Super-Hub — Station B
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-orange/10 text-orange text-[10px] font-mono font-semibold uppercase tracking-wider border border-orange/20">
                      99.4% uptime
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-3">
                    {[
                      { port: 1, speed: "350 kW", status: "In Use", variant: "muted" },
                      { port: 2, speed: "350 kW", status: "In Use", variant: "muted" },
                      { port: 3, speed: "350 kW", status: "Reserved", variant: "orange" },
                      { port: 4, speed: "150 kW", status: "Available", variant: "default" },
                    ].map((p) => (
                      <div
                        key={p.port}
                        className={`border rounded-xl p-4 flex flex-col gap-3 ${
                          p.variant === "orange"
                            ? "border-orange/30 bg-orange/5 text-orange"
                            : p.variant === "muted"
                              ? "border-white/[0.04] bg-white/[0.01] text-white/30"
                              : "border-white/[0.08] bg-white/[0.03] text-white"
                        }`}
                      >
                        <div>
                          <span className="text-[9.5px] font-mono uppercase block opacity-60">
                            Connector
                          </span>
                          <span className="text-[16px] font-bold mt-0.5 block">Port {p.port}</span>
                        </div>
                        <div className="pt-2 border-t border-white/[0.05] flex justify-between text-[10.5px] font-mono">
                          <span>{p.speed}</span>
                          <span className="font-semibold">{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[12px] text-[#A0AEC0] leading-relaxed">
                    EVIQ models grid temperatures and handshake delays, recommending Port 3 for 350
                    kW delivery with lowest thermal risk.
                  </p>
                </motion.div>
              )}

              {activeTab === "ledger" && (
                <motion.div
                  key="ledger"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 flex-1"
                >
                  <div className="flex justify-between items-start border-b border-white/[0.05] pb-4">
                    <div>
                      <h4 className="text-[15px] font-semibold text-white">Tariff Optimizations</h4>
                      <p className="text-[12.5px] text-[#A0AEC0] mt-0.5">
                        Avoiding peak periods to minimize session cost
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-orange/10 text-orange text-[10px] font-mono font-semibold uppercase tracking-wider border border-orange/20">
                      $7.68 saved
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border border-white/[0.06] bg-white/[0.02] rounded-xl p-5">
                      <span className="text-[10px] text-red-400/70 font-mono uppercase tracking-widest block mb-2">
                        Peak rate
                      </span>
                      <span className="text-[24px] font-bold text-white">$0.48 / kWh</span>
                      <p className="text-[12px] text-[#546b85] mt-2 leading-relaxed">
                        Peak congestion: 16:00–20:00. EVIQ routes around these windows.
                      </p>
                    </div>
                    <div className="border border-orange/20 bg-orange/5 rounded-xl p-5">
                      <span className="text-[10px] text-orange font-mono uppercase tracking-widest block mb-2">
                        EVIQ locked rate
                      </span>
                      <span className="text-[24px] font-bold text-orange">$0.32 / kWh</span>
                      <p className="text-[12px] text-[#A0AEC0] mt-2 leading-relaxed">
                        Dynamic tariff locking reduces commercial fleet costs by up to 33%.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center justify-between flex-wrap gap-3">
              <span className="text-[11px] font-mono text-white/20">
                Telemetry stream nominal · All systems operational
              </span>
              <a
                href="/demo"
                className="px-4 py-2 rounded-lg bg-orange text-white font-semibold text-[12px] hover:bg-orange/90 active:scale-[0.98] transition-all"
              >
                Open interactive demo →
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
