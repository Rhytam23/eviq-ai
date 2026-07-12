"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

export default function WhyFail() {
  return (
    <section className="py-24 md:py-32 bg-[#05070B] border-t border-white/[0.04]">
      <Container>
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <span className="text-[12px] font-bold tracking-widest text-orange uppercase bg-orange/10 px-3 py-1 rounded-full">
            The Paradigm Shift
          </span>
          <h2 className="text-display mt-6 text-[38px] md:text-[56px] text-white font-bold leading-tight tracking-tight">
            Why legacy charging maps fail.
          </h2>
          <p className="mt-4 text-[17px] md:text-[19px] text-[#A0AEC0] max-w-[620px] mx-auto leading-relaxed">
            Existing maps only answer &quot;where is a charger.&quot; EVIQ AI predicts if it works, when it will be free, and how it impacts your battery cell health.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-[1100px] mx-auto">
          {/* Legacy Apps Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[28px] border border-white/[0.03] bg-white/[0.01] p-8 md:p-10 flex flex-col justify-between"
          >
            <div>
              <div className="text-[#546b85] text-[11px] font-mono tracking-widest uppercase mb-4">
                LEGACY MAP FINDERS
              </div>
              <h3 className="text-[22px] font-bold text-[#546b85] mb-6">
                Static & Reactive Databases
              </h3>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="text-red-500 font-bold mt-[2px]">✕</span>
                  <div>
                    <h4 className="text-[15px] font-bold text-white/90">Static Occupancy Reports</h4>
                    <p className="text-[13px] text-[#546b85] mt-1">
                      Shows chargers as &quot;Available&quot; based on stale data, leading to surprise queue times upon arrival.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-red-500 font-bold mt-[2px]">✕</span>
                  <div>
                    <h4 className="text-[15px] font-bold text-white/90">Phantom Green Dots</h4>
                    <p className="text-[13px] text-[#546b85] mt-1">
                      Fails to recognize offline, damaged, or derated charger units until drivers manually report issues.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-red-500 font-bold mt-[2px]">✕</span>
                  <div>
                    <h4 className="text-[15px] font-bold text-white/90">Blind Charging Rates</h4>
                    <p className="text-[13px] text-[#546b85] mt-1">
                      Forces constant maximum power charging speeds, driving up battery degradation rates by up to 3.2x.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-white/[0.04] text-[12px] text-[#546b85] font-mono">
              STATUS: STALE DATA • DRIVERS STRANDED
            </div>
          </motion.div>

          {/* EVIQ AI Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="rounded-[28px] border border-orange/20 bg-[#0A1018] p-8 md:p-10 flex flex-col justify-between shadow-[0_0_50px_rgba(255,122,0,0.03)]"
          >
            <div>
              <div className="text-orange text-[11px] font-mono tracking-widest uppercase mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange animate-ping" />
                EVIQ AI PREDICTIVE OS
              </div>
              <h3 className="text-[22px] font-bold text-white mb-6">
                Dynamic & Proactive Orchestration
              </h3>

              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="text-orange font-bold mt-[2px]">✓</span>
                  <div>
                    <h4 className="text-[15px] font-bold text-white">45-Min Queue Forecasts</h4>
                    <p className="text-[13.5px] text-[#A0AEC0] mt-1">
                      Predicts station availability using incoming vehicle telemetry, locking charging slots ahead of arrivals.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-orange font-bold mt-[2px]">✓</span>
                  <div>
                    <h4 className="text-[15px] font-bold text-white">Thermal & Uptime Scoring</h4>
                    <p className="text-[13.5px] text-[#A0AEC0] mt-1">
                      Constantly scans charging unit health, screening out low-wattage or offline charging ports automatically.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-orange font-bold mt-[2px]">✓</span>
                  <div>
                    <h4 className="text-[15px] font-bold text-white">Active Cell Preservation</h4>
                    <p className="text-[13.5px] text-[#A0AEC0] mt-1">
                      Integrates dynamic battery state of health (SoH) profiles to deliver thermal-aware optimized charger rates.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-orange/10 text-[12px] text-orange font-mono flex justify-between items-center">
              <span>STATUS: ACTIVE CALIBRATING</span>
              <span className="text-white bg-orange px-2 py-0.5 rounded text-[9.5px]">99.4% RELIABILITY SCORE</span>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
