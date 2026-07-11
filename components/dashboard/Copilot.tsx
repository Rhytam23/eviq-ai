"use client";
import { Container } from "@/components/ui/Container";
import { useEffect, useState } from "react";

const presets = [
  {
    pill: "I have 16% battery",
    query: "I have 16% battery. When should I charge?",
    answer: `Your current State of Charge is 16% (est. 42 miles remaining range).

• Route analysis shows your destination is 68 miles away. You cannot reach it without charging.
• AI Charger Search identifies Electrify America Hub 2 (3.4 miles north, off Route 101) as your optimal stop.
• Expected wait time is 0 minutes (Virtual booking slot reserved automatically).
• Charger health is verified at 99.2% with active speed profiles running at 350 kW.

Recommendation: Reroute to Electrify America Hub 2. Est. charge duration: 18 mins to hit 80% SoC. Charging cost: $11.20 (optimized off-peak rate). Sync to HUD?`,
  },
  {
    pill: "Book the fastest charger",
    query: "Book the fastest available charger on my route.",
    answer: `Fastest charger recommendation: EVgo Super-Hub (12.2 miles east).

• Ports speed: 350 kW (Liquid-cooled CCS2/NACS connectors).
• Occupancy: 6 / 8 ports active. 2 ports ready.
• Arrival SoC: 11% (est. temp nominal at 26.2°C for optimal charging curve).
• Wait forecast: 0 minutes wait.

Recommendation: I've locked a 15-minute slot reservation for Port 3. HUD path updated to EVgo Super-Hub. Estimated arrival: 14:12. Confirm booking?`,
  },
  {
    pill: "Show battery health",
    query: "Show battery health and degradation analysis.",
    answer: `Battery Health Intelligence Summary (Tesla Model 3, VIN: 5YJ3...):

• State of Health (SoH): 94.6% nominal capacity.
• Cell degradation: -1.2% capacity loss today vs. historical average (optimal curve).
• Bad habits impact: 3 consecutive supercharging events above 85°C cell temp, causing +0.4% efficiency loss.

Recommendation: Keep daily charging limits capped at 80% SoC. Limit fast-charging sessions when ambient temperature exceeds 36°C. No manual calibration required.`,
  },
];

export default function Copilot() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [approved, setApproved] = useState(false);

  const activePreset = presets[activeIdx];

  // Re-trigger typewriter whenever active preset changes
  useEffect(() => {
    setTyped("");
    setCharIdx(0);
  }, [activeIdx]);

  useEffect(() => {
    if (charIdx >= activePreset.answer.length) return;
    const id = setTimeout(
      () => {
        setTyped(activePreset.answer.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      },
      2 + Math.random() * 3
    ); // 2-5ms typing speed (nearly instant)
    return () => clearTimeout(id);
  }, [charIdx, activePreset.answer]);

  const handleApprove = () => {
    setApproved(true);
    window.dispatchEvent(new CustomEvent("eviq-approve"));
    setTimeout(() => {
      setApproved(false);
    }, 5000);
  };

  return (
    <section id="copilot" className="py-24 md:py-28 bg-navy text-white relative overflow-hidden select-none">
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, #4FD1FF 0%, transparent 34%), radial-gradient(circle at 80% 70%, #5dd4ff 0%, transparent 27%)",
        }}
      />
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[12px] font-[650] tracking-widest text-cyan/90 uppercase">
              EVIQ AI Assistant
            </p>
            <h2 className="text-display mt-4 text-[36px] md:text-[46px] font-bold leading-tight">
              Ask your co-pilot anything.
            </h2>
            <p className="mt-4 text-[17px] text-[#c6d2e2] leading-relaxed max-w-[520px]">
              Natural language operations. Root-cause in seconds. Act with one click. Built on your
              vehicle battery logs, operators datasets, and charging algorithms — not generic LLM guesses.
            </p>

            {/* Interactive presets pills */}
            <div className="mt-8">
              <span className="text-[10px] font-[700] text-ink-350 tracking-wider uppercase block mb-3">
                Driver Queries
              </span>
              <div className="flex flex-col gap-2.5 max-w-[420px]">
                {presets.map((p, idx) => (
                  <button
                    key={p.pill}
                    onClick={() => setActiveIdx(idx)}
                    className={`text-left text-[13.5px] px-4 py-3 rounded-[14px] border transition-all duration-200 snap-cursor ${
                      idx === activeIdx
                        ? "bg-cyan/10 border-cyan text-white shadow-glow"
                        : "bg-white/[0.03] border-white/10 text-[#a9bcd1] hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    {p.pill}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3 flex-wrap text-[12.5px] text-[#9fb3c8]">
              <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
                Secure vehicle link
              </span>
              <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
                Cross-network scheduling
              </span>
              <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
                Explainable decisions
              </span>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/[0.10] bg-white/[0.045] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.09] text-[11.5px] tracking-wider text-[#9eb8cf] uppercase font-[600]">
              AI Mobility Copilot • Route Active
            </div>
            <div className="px-5 pt-5 pb-3">
              <div className="text-[13.5px] text-[#a9bcd1]">You</div>
              <div className="mt-1 text-[15.5px] text-white font-[500] font-mono">
                {activePreset.query}
              </div>
            </div>
            <div className="px-5 pb-6 border-t border-white/[0.07] pt-4 min-h-[268px]">
              <div className="text-[13.5px] text-cyan font-[600]">EVIQ AI</div>
              <pre
                className="mt-2 text-[14px] leading-[1.62] text-[#d8e6f5] whitespace-pre-wrap font-[450]"
                style={{ fontFamily: "ui-monospace, monospace" }}
              >
                {typed}
                {charIdx < activePreset.answer.length && (
                  <span className="inline-block w-[7px] h-[1.1em] bg-cyan ml-[2px] animate-pulse align-[-2px]" />
                )}
              </pre>
            </div>
            <div className="px-5 py-3 border-t border-white/[0.09] flex items-center justify-between text-[12px] text-[#8ea9c0]">
              <span className="text-[10px] font-semibold text-[#8ea9c0] block">
                *Simulated response based on historical patterns.
              </span>
              <button
                onClick={handleApprove}
                className={`px-4 py-[8px] rounded-full font-[700] text-[12.5px] transition-all duration-300 snap-cursor ${
                  approved
                    ? "bg-emerald-500 text-white shadow-soft cursor-default"
                    : "bg-cyan text-[#032132] hover:scale-[1.03]"
                }`}
              >
                {approved ? "Rerouting HUD..." : "Confirm Reroute"}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
