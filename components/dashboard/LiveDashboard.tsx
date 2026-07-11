"use client";
import { Container } from "@/components/ui/Container";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    idx: 0,
    name: "1. Scanning Route",
    desc: "AI monitors vehicle SoC, weather conditions, and topography.",
  },
  {
    idx: 1,
    name: "2. Queue Forecasted",
    desc: "Wait forecast at target charger rises to 28 mins due to high traffic.",
  },
  {
    idx: 2,
    name: "3. AI Optimization",
    desc: "EVIQ AI finds Stop 2 with 0 queue wait, locking a reservation slot.",
  },
  {
    idx: 3,
    name: "4. Reservation Locked",
    desc: "Approved charger syncs with HUD. Rerouting updates instantly.",
  },
  {
    idx: 4,
    name: "5. Session Reconciliation",
    desc: "Charging completes. Time saved and battery health metrics logged.",
  },
];

export default function LiveDashboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  // telemetry metrics matching the story phase
  const [speed, setSpeed] = useState(0);
  const [queue, setQueue] = useState(0);
  const [battery, setBattery] = useState(16);
  const [cost, setCost] = useState(42);
  const [status, setStatus] = useState("MONITORING ROUTE");

  // Listen to global Copilot approvals to fast-forward to step 3
  useEffect(() => {
    const handleApprove = () => {
      setActiveStep(3);
    };
    window.addEventListener("eviq-approve", handleApprove);
    return () => window.removeEventListener("eviq-approve", handleApprove);
  }, []);

  // Update telemetry states based on selected story step
  useEffect(() => {
    if (activeStep === 0) {
      setSpeed(0);
      setQueue(0);
      setBattery(16);
      setCost(42);
      setStatus("MONITORING ROUTE");
    } else if (activeStep === 1) {
      setSpeed(0);
      setQueue(28);
      setBattery(14);
      setCost(48);
      setStatus("CONGESTION RISK (87%)");
    } else if (activeStep === 2) {
      setSpeed(0);
      setQueue(28);
      setBattery(14);
      setCost(48);
      setStatus("REROUTING RECOMMENDED");
    } else if (activeStep === 3) {
      setSpeed(350); // charging speed in kW
      setQueue(0);
      setBattery(48);
      setCost(32); // cheaper pricing segment
      setStatus("CHARGING ACTIVE");

      // Auto-advance to step 4 (reconciliation) after 2 seconds
      const id = setTimeout(() => {
        setActiveStep(4);
      }, 2000);
      return () => clearTimeout(id);
    } else if (activeStep === 4) {
      setSpeed(0);
      setQueue(0);
      setBattery(80);
      setCost(32);
      setStatus("COMPLETED & SYNCED");
    }
  }, [activeStep]);

  // canvas drawing loop matching the active story step
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const draw = () => {
      const w = (c.width = c.clientWidth * 2);
      const h = (c.height = 180);
      ctx.clearRect(0, 0, w, h);

      // Target limit line (red)
      ctx.strokeStyle = "rgba(239, 68, 68, 0.45)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, h * 0.42);
      ctx.lineTo(w, h * 0.42);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for limit line
      ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
      ctx.font = "18px monospace";
      ctx.fillText("CHARGER SPEED CAPACITY (350 kW)", 24, h * 0.36);

      // Draw the main telemetry line
      ctx.lineWidth = 3;
      const grad = ctx.createLinearGradient(0, 0, w, 0);

      // Line color adapts to stage
      if (activeStep >= 3) {
        grad.addColorStop(0, "#4FD1FF");
        grad.addColorStop(1, "#10b981"); // green success
      } else if (activeStep >= 1) {
        grad.addColorStop(0, "#4FD1FF");
        grad.addColorStop(1, "#ef4444"); // red alert
      } else {
        grad.addColorStop(0, "#4FD1FF");
        grad.addColorStop(1, "#1c7ca3");
      }
      ctx.strokeStyle = grad;
      ctx.beginPath();

      for (let x = 0; x < w; x += 4) {
        const t = Date.now() / 1200 + x * 0.012;
        let amp = 20;
        let offset = h * 0.58;

        if (activeStep === 1 || activeStep === 2) {
          offset = h * 0.65;
          amp = 5;
        } else if (activeStep >= 3) {
          offset = h * 0.45;
          amp = 18;
        }

        const y = offset + Math.sin(t) * amp + Math.sin(t * 1.9) * (amp * 0.35);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Infill under line
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const fg = ctx.createLinearGradient(0, 0, 0, h);
      if (activeStep >= 3) {
        fg.addColorStop(0, "rgba(16, 185, 129, 0.14)");
      } else if (activeStep >= 1) {
        fg.addColorStop(0, "rgba(239, 68, 68, 0.14)");
      } else {
        fg.addColorStop(0, "rgba(79, 209, 255, 0.15)");
      }
      fg.addColorStop(1, "rgba(79, 209, 255, 0)");
      ctx.fillStyle = fg;
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [activeStep]);

  return (
    <section id="demo" className="py-24 md:py-32 bg-white select-none">
      <Container>
        <div className="flex items-end justify-between flex-wrap gap-5 mb-10">
          <div>
            <p className="text-[12px] font-[650] tracking-widest text-ink-350 uppercase">
              Simulated Demonstration
            </p>
            <h2 className="text-display mt-3 text-[34px] md:text-[44px] text-navy font-bold leading-tight">
              Trace an optimized journey.
            </h2>
          </div>
          <div className="text-[13px] text-ink-500">
            EV Route Simulation • Click stages on the right to simulate
          </div>
        </div>

        <div className="rounded-[28px] border border-black/[0.08] bg-[#fcfdfe] shadow-lift overflow-hidden">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-0">
            {/* LEFT: DASHBOARD VIEWPORT */}
            <div className="p-7 md:p-9 border-r border-black/[0.06]">
              <div className="flex items-baseline justify-between border-b border-black/[0.05] pb-4 mb-4">
                <div>
                  <div className="text-[10px] font-[700] tracking-wider text-ink-350 uppercase">
                    OPERATIONAL STATUS
                  </div>
                  <span
                    className={`inline-block text-[11px] font-[700] px-2.5 py-0.5 rounded-full mt-1.5 ${
                      status.includes("ACTIVE") || status.includes("COMPLETED")
                        ? "bg-emerald-100 text-emerald-800"
                        : status.includes("RISK") || status.includes("RECOMMENDED")
                          ? "bg-red-100 text-red-800"
                          : "bg-[#e2edf7] text-navy"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-ink-350 font-[700] uppercase tracking-wider">
                    Telemetry Latency
                  </div>
                  <div className="text-[14px] font-[650] text-navy mt-1">42ms p95</div>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] font-[600] tracking-wider text-ink-350 uppercase">
                    Vehicle Charging Speed
                  </div>
                  <div className="text-[36px] font-[750] tracking-[-0.025em] text-navy font-mono">
                    {speed} <span className="text-[16px] text-ink-500 font-[550]">kW</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-ink-400 uppercase font-[600] tracking-wider">
                    Estimated Route Cost
                  </div>
                  <div className="text-[20px] font-[750] text-navy font-mono">
                    {activeStep >= 3 ? "$18.40" : "$26.88"}{" "}
                    {activeStep >= 3 && (
                      <span className="text-emerald-600 text-[12px] font-bold">-31%</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Canvas Wave */}
              <div className="mt-5 rounded-[16px] border border-black/[0.065] bg-white overflow-hidden relative">
                <canvas ref={canvasRef} className="w-full h-[98px] block" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 text-[12.5px] font-mono">
                <div className="rounded-[14px] bg-shell-100 px-4 py-3">
                  <div className="text-ink-500 font-sans font-medium">Queue Wait</div>
                  <div className="text-[17px] font-[680] text-navy mt-1">
                    {queue} mins
                  </div>
                </div>
                <div className="rounded-[14px] bg-shell-100 px-4 py-3">
                  <div className="text-ink-500 font-sans font-medium">Battery SOC</div>
                  <div className="text-[17px] font-[680] text-navy mt-1">{battery}%</div>
                </div>
                <div className="rounded-[14px] bg-shell-100 px-4 py-3">
                  <div className="text-ink-500 font-sans font-medium">Charge Pricing</div>
                  <div className="text-[17px] font-[680] text-navy mt-1">{cost}¢/kWh</div>
                </div>
              </div>

              {/* Savings Ledger Overlay */}
              <AnimatePresence>
                {activeStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="mt-6"
                  >
                    <div className="p-4 rounded-[14px] bg-emerald-500/10 border border-emerald-500/20 text-[13.5px] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-emerald-700 font-[750] uppercase tracking-wider">
                          Virtual Queue Booked
                        </div>
                        <div className="text-navy font-[600] mt-0.5">
                          Locked Stop 2 charger at 16:22
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-emerald-700 font-[750] uppercase tracking-wider">
                          Est. Time Saved
                        </div>
                        <div className="text-emerald-600 font-[800] text-[16.5px] font-mono">
                          +24 mins
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT: STORY CONTROL STEPPER */}
            <div className="p-7 md:p-8 bg-[#f8fafc] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-[650] tracking-wider text-ink-350 uppercase mb-4">
                  Event Story Steps
                </div>

                <div className="space-y-3">
                  {steps.map((st) => {
                    const isActive = activeStep === st.idx;
                    const isPassed = activeStep > st.idx;

                    return (
                      <div
                        key={st.idx}
                        onClick={() => setActiveStep(st.idx)}
                        className={`rounded-[14px] border p-3 text-[13.5px] cursor-pointer transition-all duration-200 snap-cursor ${
                          isActive
                            ? "border-cyan bg-cyan/5 text-navy shadow-glow"
                            : isPassed
                              ? "border-emerald-200 bg-emerald-50/40 text-emerald-800"
                              : "border-black/[0.05] bg-white text-ink-700 hover:border-black/15"
                        }`}
                      >
                        <div className="font-[680] flex items-center justify-between">
                          <span>{st.name}</span>
                          {isPassed && (
                            <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                              PASSED
                            </span>
                          )}
                          {isActive && (
                            <span className="text-[9px] bg-cyan text-[#02132a] px-2 py-0.5 rounded-full font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <p className="text-[12.5px] text-ink-600 mt-1 leading-relaxed">
                            {st.desc}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation approve button */}
              <div className="mt-6 pt-5 border-t border-black/[0.05]">
                {activeStep === 2 ? (
                  <button
                    onClick={() => setActiveStep(3)}
                    className="w-full py-3 rounded-full bg-cyan text-[#02132a] font-[750] text-[13px] hover:scale-[1.02] transition-transform shadow-glow snap-cursor"
                  >
                    Approve AI Recommendation
                  </button>
                ) : activeStep >= 3 ? (
                  <div className="text-center text-[12.5px] text-emerald-600 font-[700] bg-emerald-50 border border-emerald-100 rounded-full py-2.5">
                    ✓ Optimization recommendation deployed successfully
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="w-full py-3 rounded-full bg-navy text-white font-[650] text-[13px] hover:bg-navy/90 hover:scale-[1.02] transition-transform snap-cursor"
                  >
                    Simulate Next Stage
                  </button>
                )}
                <div className="text-[10px] text-center text-ink-400 font-semibold mt-2.5">
                  *Demonstration uses representative simulated vehicle and charger parameters.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
