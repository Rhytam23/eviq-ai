"use client";
import { Container } from "@/components/ui/Container";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Station {
  id: string;
  name: string;
  speed: string;
  occupancy: string;
  queue: number;
  reliability: number;
  price: string;
  connector: string;
  safety: number;
  amenities: string[];
  x: number;
  y: number;
}

// Simulated Stations
const initialStations: Station[] = [
  {
    id: "A",
    name: "Cyberport Charger Hub (Station A)",
    speed: "150 kW DC",
    occupancy: "6 / 6 active",
    queue: 41,
    reliability: 82,
    price: "$0.48/kWh",
    connector: "CCS2 / NACS",
    safety: 8.8,
    amenities: ["Vending", "Restrooms"],
    x: 320,
    y: 200,
  },
  {
    id: "B",
    name: "Kowloon Bay Super-Hub (Station B)",
    speed: "350 kW DC",
    occupancy: "2 / 10 active",
    queue: 0,
    reliability: 99.4,
    price: "$0.32/kWh (Off-Peak Locked)",
    connector: "Liquid-Cooled NACS",
    safety: 9.9,
    amenities: ["Coffee Shop", "Lounge", "WiFi", "Restrooms"],
    x: 480,
    y: 110,
  },
  {
    id: "C",
    name: "Sha Tin Gateway (Station C)",
    speed: "120 kW DC",
    occupancy: "4 / 4 active",
    queue: 12,
    reliability: 91,
    price: "$0.42/kWh",
    connector: "CCS2",
    safety: 9.1,
    amenities: ["Supermarket", "Coffee"],
    x: 620,
    y: 90,
  },
  {
    id: "D",
    name: "Tseung Kwan O Hub (Station D)",
    speed: "250 kW DC",
    occupancy: "7 / 8 active",
    queue: 5,
    reliability: 95,
    price: "$0.45/kWh",
    connector: "CCS2 / CHAdeMO",
    safety: 9.3,
    amenities: ["Restrooms", "Shopping"],
    x: 680,
    y: 160,
  },
];

export default function DemoPage() {
  // Simulator states
  const [batterySoc, setBatterySoc] = useState(12);
  const [activeStep, setActiveStep] = useState(0); // 0: Normal, 1: Journey Started, 2: Scan complete, 3: Recommendation, 4: Reserved, 5: Charging, 6: Completed
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [reservationState, setReservationState] = useState<"NONE" | "PENDING" | "CONFIRMED" | "CHARGING" | "COMPLETED">("NONE");
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [customQuery, setCustomQuery] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "ai"; text: string; confidence?: number; explanation?: string }>>([
    {
      sender: "ai",
      text: "EVIQ AI connected. Monitoring vehicle CAN-bus streams. State of Charge: 12%. Range estimation: 32 miles remaining.",
    },
  ]);

  // Map elements refs
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Critical battery calculations
  const isEmergency = batterySoc <= 5;
  const isCritical = batterySoc <= 10 && batterySoc > 5;
  const isPlanning = batterySoc <= 20 && batterySoc > 10;

  // Sync state if slider changes manually
  useEffect(() => {
    if (batterySoc <= 5) {
      // Auto recommend closest safe charger in Emergency
      setSelectedStation(initialStations.find((s) => s.id === "B") || null);
    }
  }, [batterySoc]);

  // Typewriter simulated logger trigger
  const addChatMessage = (sender: "user" | "ai", text: string, confidence?: number, explanation?: string) => {
    setChatLog((prev) => [...prev, { sender, text, confidence, explanation }]);
  };

  // Run Step-by-Step Scenario
  const runNextScenarioStep = () => {
    if (activeStep === 0) {
      // Step 1: Journey Started
      setActiveStep(1);
      setBatterySoc(12);
      setSelectedStation(null);
      setReservationState("NONE");
      setSelectedPort(null);
      setChatLog([
        {
          sender: "user",
          text: "I have 12% battery. Route to Hong Kong International Airport.",
        },
        {
          sender: "ai",
          text: "Charging Planning Active: Battery SoC is 12% (est. 32 miles range). Destination distance is 42 miles. Topography shows steep elevation climbs ahead. Stopped session required.",
        },
      ]);
    } else if (activeStep === 1) {
      // Step 2: Scan Complete
      setActiveStep(2);
      addChatMessage("ai", "Network scanned. Station A is closer but occupied with a 41-minute queue wait. Station B has 0 wait times.", undefined, "Station A has high wait-times; Station B offers off-peak pricing segment.");
      setSelectedStation(initialStations.find((s) => s.id === "B") || null);
    } else if (activeStep === 2) {
      // Step 3: Recommendation
      setActiveStep(3);
      setSelectedStation(initialStations.find((s) => s.id === "B") || null);
      addChatMessage(
        "ai",
        "EVIQ AI recommends Stop B (Kowloon Bay Super-Hub). You will arrive with 8% battery. 0 mins queue wait. Est. charge duration: 18 mins. Cost: $11.20.",
        96,
        "Why: Kowloon Bay offers 350kW liquid-cooled charging loops and off-peak pricing segments, saving you 33 minutes of queue waiting."
      );
    } else if (activeStep === 3) {
      // Step 4: Reservation & HUD Sync
      setActiveStep(4);
      setReservationState("CONFIRMED");
      setSelectedPort(3);
      addChatMessage(
        "ai",
        "Reservation Confirmed. Port 3 locked. EVIQ security token sync complete. HUD navigation updated.",
        99,
        "Rerouting active: Kowloon Bay Super-Hub added to journey path. Port 3 booked."
      );
    } else if (activeStep === 4) {
      // Step 5: Charging Session Active
      setActiveStep(5);
      setReservationState("CHARGING");
      setBatterySoc(45);
      addChatMessage(
        "ai",
        "Charging Active at Kowloon Bay. Delivery rate: 350 kW peak. Real-time battery temperature: 28.4°C."
      );
    } else if (activeStep === 5) {
      // Step 6: Completed & Reconciled
      setActiveStep(6);
      setReservationState("COMPLETED");
      setBatterySoc(80);
      addChatMessage(
        "ai",
        "Charging session completed. Reclaimed range: +242 miles. Time saved: 33 minutes. Battery State of Health (SoH) calibrated: 94.6% (Optimal). Sync complete.",
        100,
        "Savings ledger reconciled: $7.68 saved off-peak; 33 minutes wait time eliminated."
      );
    }
  };

  const resetDemo = () => {
    setActiveStep(0);
    setBatterySoc(12);
    setSelectedStation(null);
    setReservationState("NONE");
    setSelectedPort(null);
    setChatLog([
      {
        sender: "ai",
        text: "EVIQ AI connected. Monitoring vehicle CAN-bus streams. State of Charge: 12%. Range estimation: 32 miles remaining.",
      },
    ]);
  };

  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    const q = customQuery;
    setCustomQuery("");
    addChatMessage("user", q);

    setTimeout(() => {
      if (q.toLowerCase().includes("14%")) {
        addChatMessage(
          "ai",
          "You can safely travel another 38 miles. Based on traffic, weather and battery temp, your destination is reachable, but I recommend charging now.",
          98,
          "Why: Battery temperature is nominal, but destination exceeds range bounds."
        );
      } else if (q.toLowerCase().includes("fastest")) {
        addChatMessage(
          "ai",
          "Kowloon Bay Super-Hub offers 350kW liquid-cooled charging loops. 0 wait times.",
          99,
          "Why: Station B has 8 available high-speed ports."
        );
      } else {
        addChatMessage(
          "ai",
          "EVIQ AI recommendation: Keep State of Charge between 20% and 80% to maximize cell health.",
          94,
          "Why: High-voltage SoC cycles lead to battery degradation."
        );
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-x-hidden font-sans">
      {/* Background neon grids & spots */}
      <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_20%,rgba(79,209,255,0.04),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 grid-faint opacity-[0.2] pointer-events-none z-0" />

      {/* Critical Battery Alerts Bar */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-950/70 border-b border-red-500/30 text-red-400 text-center py-2 text-[12.5px] font-[600] tracking-wider uppercase relative z-40 flex items-center justify-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            ⚠️ Emergency Battery Level ({batterySoc}%) — Autopilot routing active. Recommending reachable hubs only.
          </motion.div>
        )}
        {isCritical && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-950/70 border-b border-amber-500/30 text-amber-400 text-center py-2 text-[12.5px] font-[600] tracking-wider uppercase relative z-40 flex items-center justify-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            ⚠️ Critical Battery Mode ({batterySoc}%) — Rerouting highly advised. Filtering low-reliability ports.
          </motion.div>
        )}
        {isPlanning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-cyan/10 border-b border-cyan/30 text-cyan text-center py-2 text-[12.5px] font-[600] tracking-wider uppercase relative z-40 flex items-center justify-center gap-2"
          >
            <span className="w-2 h-2 bg-cyan rounded-full animate-pulse" />
            ⚡ Charging Planning Active ({batterySoc}%) — Off-route charging segments mapping.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Cockpit Header */}
      <header className="border-b border-white/[0.08] bg-slate-950/50 backdrop-blur-md relative z-30 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <a href="/" className="text-[12px] font-semibold text-cyan hover:text-white transition-colors flex items-center gap-1.5 snap-cursor">
            ← BACK TO LANDING
          </a>
          <span className="text-white/20">|</span>
          <h1 className="text-[17px] font-bold tracking-tight text-white flex items-center gap-2">
            EVIQ AI <span className="text-[10px] font-mono tracking-widest text-[#a9bcd1] bg-white/5 border border-white/10 px-2 py-0.5 rounded">DEMO COCKPIT</span>
          </h1>
        </div>

        {/* Center Controls: Step Sequencer */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetDemo}
            className="px-3.5 py-1.5 rounded-full border border-white/10 text-white/70 text-[12px] font-medium hover:bg-white/5 hover:text-white transition-all snap-cursor"
          >
            Reset Simulation
          </button>
          <button
            onClick={runNextScenarioStep}
            className="px-4.5 py-1.5 rounded-full bg-cyan text-[#02050A] text-[12px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow snap-cursor flex items-center gap-1"
          >
            {activeStep === 0 ? "Start Demo Scenario" : `Simulate Stage ${activeStep} / 6`}
            <span className="text-[10px] opacity-70">➔</span>
          </button>
        </div>

        {/* Right Slider Controls */}
        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 px-4 py-1.5 rounded-full min-w-[240px]">
          <div className="text-[11.5px] font-semibold text-[#a9bcd1] w-24">
            Battery SoC: <span className="font-mono text-white">{batterySoc}%</span>
          </div>
          <input
            type="range"
            min="2"
            max="100"
            value={batterySoc}
            onChange={(e) => setBatterySoc(parseInt(e.target.value))}
            className="w-28 accent-cyan cursor-pointer snap-cursor"
          />
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 p-6 grid lg:grid-cols-[1fr_1.3fr_1.1fr] gap-6 relative z-10">
        
        {/* Left Column: AI Mobility Copilot */}
        <section className="rounded-[22px] border border-white/[0.08] bg-slate-950/40 backdrop-blur-xl p-5 flex flex-col justify-between shadow-lift">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
              <h2 className="text-[12px] font-bold text-cyan tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                AI MOBILITY COPILOT
              </h2>
              <span className="text-[10.5px] font-mono text-ink-350 bg-white/5 border border-white/15 px-2 py-0.5 rounded">
                CONNECTED
              </span>
            </div>

            {/* Chat Log Viewport */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {chatLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${log.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed max-w-[90%] font-mono ${
                      log.sender === "user"
                        ? "bg-cyan/10 border border-cyan/20 text-white"
                        : "bg-white/[0.03] border border-white/5 text-[#d8e6f5]"
                    }`}
                  >
                    {log.text}
                    {log.confidence && (
                      <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2 text-[11px] text-cyan">
                        <span>Confidence: {log.confidence}%</span>
                        <span className="text-white/30">•</span>
                        <span>AI Verified</span>
                      </div>
                    )}
                    {log.explanation && (
                      <div className="mt-1.5 text-[11px] text-[#8fa7be] italic leading-relaxed">
                        {log.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt input / Presets */}
          <div className="mt-6 border-t border-white/[0.06] pt-4">
            <span className="text-[10px] font-bold text-[#8fa7be] tracking-wider uppercase block mb-2.5">
              Interactive Presets
            </span>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => {
                  setCustomQuery("I have 14% battery");
                  addChatMessage("user", "I have 14% battery");
                  setTimeout(() => {
                    addChatMessage(
                      "ai",
                      "You can safely travel another 38 miles. Based on traffic, weather and battery temp, your destination is reachable, but I recommend charging now.",
                      98,
                      "Why: Battery temperature is nominal, but destination exceeds range bounds."
                    );
                  }, 600);
                }}
                className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-[11.5px] text-[#a9bcd1] hover:text-white transition-all snap-cursor"
              >
                &quot;I have 14% battery&quot;
              </button>
              <button
                onClick={() => {
                  setCustomQuery("Book the fastest charger");
                  addChatMessage("user", "Book the fastest charger");
                  setTimeout(() => {
                    addChatMessage(
                      "ai",
                      "Kowloon Bay Super-Hub offers 350kW liquid-cooled charging loops. 0 wait times.",
                      99,
                      "Why: Station B has 8 available high-speed ports."
                    );
                  }, 600);
                }}
                className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-[11.5px] text-[#a9bcd1] hover:text-white transition-all snap-cursor"
              >
                &quot;Fastest charger&quot;
              </button>
            </div>

            <form onSubmit={handleCustomQuery} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask EVIQ AI..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 text-[13px] text-white placeholder-[#6b7c93] focus:outline-none focus:border-cyan transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-[#02050A] rounded-full font-bold text-[13px] hover:scale-[1.03] active:scale-[0.97] transition-all snap-cursor"
              >
                Send
              </button>
            </form>
          </div>
        </section>

        {/* Center Column: Interactive Map */}
        <section className="rounded-[22px] border border-white/[0.08] bg-slate-950/40 backdrop-blur-xl p-5 flex flex-col justify-between shadow-lift relative">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
              <h2 className="text-[12px] font-bold text-cyan tracking-widest uppercase flex items-center gap-1.5">
                ⚡ CHARGING INTELLIGENCE MAP
              </h2>
              <span className="text-[11px] text-[#a9bcd1] font-semibold">
                HKUST ➔ Airport Corridor
              </span>
            </div>

            {/* Interactive Vector Map Layout */}
            <div
              ref={mapContainerRef}
              className="w-full h-[280px] bg-[#020617]/80 rounded-[18px] border border-white/[0.06] relative overflow-hidden flex items-center justify-center select-none"
            >
              {/* Map background highway paths */}
              <svg viewBox="0 0 800 300" className="absolute inset-0 w-full h-full opacity-[0.8]">
                {/* Grid lines */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Primary Airport Route */}
                <path
                  d="M 50 150 Q 200 80 400 150 T 750 150"
                  fill="none"
                  stroke={isEmergency ? "#ef4444" : "#1e293b"}
                  strokeWidth="6"
                  className="transition-colors duration-500"
                />
                <path
                  d="M 50 150 Q 200 80 400 150 T 750 150"
                  fill="none"
                  stroke={isEmergency ? "#ef4444" : "#4FD1FF"}
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  className="transition-colors duration-500"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="100;0"
                    dur="5s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Station connections */}
                <path d="M 320 200 L 250 130" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 480 110 L 450 140" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* City Center & HKUST Labels */}
                <text x="730" y="190" fill="#a9bcd1" fontSize="10.5" fontFamily="monospace" textAnchor="middle">HKUST</text>
                <text x="50" y="190" fill="#a9bcd1" fontSize="10.5" fontFamily="monospace" textAnchor="middle">AIRPORT</text>
                <text x="400" y="270" fill="#6b7c93" fontSize="9.5" fontFamily="monospace" textAnchor="middle">LATITUDE AUTO-SCALE REGION</text>

                {/* Moving Vehicle Dot */}
                {activeStep > 0 && (
                  <circle
                    cx={activeStep === 1 ? 650 : activeStep === 2 || activeStep === 3 ? 550 : activeStep === 4 || activeStep === 5 ? 480 : 120}
                    cy={activeStep === 1 ? 150 : activeStep === 2 || activeStep === 3 ? 142 : activeStep === 4 || activeStep === 5 ? 110 : 140}
                    r="6.5"
                    fill="#10b981"
                    filter="drop-shadow(0px 0px 8px #10b981)"
                    style={{ transition: "all 1.6s cubic-bezier(0.22, 1, 0.36, 1)" }}
                  />
                )}
              </svg>

              {/* Interactive Station Markers */}
              {initialStations.map((st) => {
                const isSelected = selectedStation?.id === st.id;
                const isRecommended = st.id === "B";
                const isStationA = st.id === "A";

                // emergency filters out low reliability or out of range stations
                const isFiltered = (isEmergency && !isRecommended) || (isCritical && isStationA);

                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      if (isFiltered) return;
                      setSelectedStation(st);
                    }}
                    style={{ left: st.x, top: st.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group snap-cursor ${
                      isFiltered ? "opacity-20 cursor-default" : ""
                    }`}
                  >
                    <div className="relative">
                      {/* Pulsing ring for recommended */}
                      {isRecommended && (
                        <span className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping" />
                      )}
                      {/* Pulsing ring for station A error state */}
                      {isStationA && st.queue > 20 && (
                        <span className="absolute -inset-3 rounded-full bg-red-500/10 animate-pulse" />
                      )}

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-[12px] transition-all shadow-glow ${
                          isSelected
                            ? "bg-cyan border-cyan text-slate-950 scale-110"
                            : isRecommended
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                              : isStationA
                                ? "bg-red-500/10 border-red-500/70 text-red-400"
                                : "bg-slate-900 border-white/20 text-[#a9bcd1]"
                        }`}
                      >
                        {st.id}
                      </div>
                    </div>
                    {/* Small tag */}
                    <span className="mt-1 bg-slate-950/80 border border-white/10 rounded px-1.5 py-0.5 text-[8.5px] font-mono tracking-tighter text-white whitespace-nowrap">
                      {st.id === "B" ? "AI RECOMMEND" : st.id === "A" ? `${st.queue}m queue` : "AI Verified"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Recommendation Panel Details */}
          <div className="mt-5 border-t border-white/[0.06] pt-4 min-h-[140px]">
            {selectedStation ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-[16px] p-4 text-[13px]"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <h3 className="font-bold text-white text-[14px]">
                    {selectedStation.name}
                  </h3>
                  <span
                    className={`font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                      selectedStation.id === "B"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : selectedStation.id === "A"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-white/5 text-[#a9bcd1]"
                    }`}
                  >
                    {selectedStation.id === "B" ? "AI Verified (99.4%)" : "Connected"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
                  <div>
                    <div className="text-[10px] text-ink-350 font-semibold uppercase">SPEED</div>
                    <div className="font-semibold text-white mt-0.5">{selectedStation.speed}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink-350 font-semibold uppercase">QUEUE WAIT</div>
                    <div className={`font-semibold mt-0.5 ${selectedStation.queue > 10 ? "text-red-400" : "text-emerald-400"}`}>
                      {selectedStation.queue === 0 ? "0 mins wait" : `${selectedStation.queue} mins wait`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink-350 font-semibold uppercase">RELIABILITY</div>
                    <div className="font-semibold text-white mt-0.5">{selectedStation.reliability}% Score</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink-350 font-semibold uppercase">PRICE</div>
                    <div className="font-semibold text-white mt-0.5">{selectedStation.price}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink-350 font-semibold uppercase">SAFETY SCORE</div>
                    <div className="font-semibold text-white mt-0.5">{selectedStation.safety} / 10</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink-350 font-semibold uppercase">AMENITIES</div>
                    <div className="font-semibold text-white mt-0.5 text-[11.5px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {selectedStation.amenities.join(", ")}
                    </div>
                  </div>
                </div>

                {selectedStation.id === "B" && (
                  <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-[11.5px]">
                    <div className="text-[#a9bcd1]">
                      ⚡ Save <span className="text-emerald-400 font-bold">33 minutes</span> wait time
                    </div>
                    {reservationState === "NONE" && (
                      <button
                        onClick={() => {
                          setReservationState("CONFIRMED");
                          setSelectedPort(3);
                          setActiveStep(4);
                          addChatMessage(
                            "ai",
                            "Reservation Confirmed. Port 3 locked. Reroute sync complete.",
                            99,
                            "Kowloon Bay Super-Hub reservation completed."
                          );
                        }}
                        className="px-3 py-1 bg-cyan text-[#02050A] font-bold rounded-full hover:scale-[1.03] transition-all snap-cursor"
                      >
                        Reserve Hub B
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#6b7c93] text-[13.5px] italic">
                Select a charger node on the map to review recommendation variables.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Reservation & Journey Timeline */}
        <section className="space-y-6 flex flex-col justify-between">
          
          {/* Reservation Console */}
          <div className="rounded-[22px] border border-white/[0.08] bg-slate-950/40 backdrop-blur-xl p-5 shadow-lift">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
              <h2 className="text-[12px] font-bold text-cyan tracking-widest uppercase">
                🛡️ RESERVATION EXPERIENCE
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  reservationState === "CONFIRMED"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : reservationState === "CHARGING"
                      ? "bg-cyan/15 text-cyan"
                      : "bg-white/5 text-[#a9bcd1]"
                }`}
              >
                {reservationState}
              </span>
            </div>

            {reservationState === "NONE" ? (
              <div className="py-6 text-center text-[#6b7c93] text-[13px] italic">
                No active reservations locked. Trigger the demo scenario or select Station B to reserve.
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5 text-[12px]">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                    <div className="text-[9.5px] text-ink-350 uppercase">EST. ARRIVAL</div>
                    <div className="text-[14px] font-bold text-white mt-0.5">14:12 (8% SoC)</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                    <div className="text-[9.5px] text-ink-350 uppercase">CHARGING DURATION</div>
                    <div className="text-[14px] font-bold text-white mt-0.5">18 mins</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                    <div className="text-[9.5px] text-ink-350 uppercase">COMPLETION TIME</div>
                    <div className="text-[14px] font-bold text-white mt-0.5">14:30 (80% SoC)</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                    <div className="text-[9.5px] text-ink-350 uppercase">WAIT TIME SAVED</div>
                    <div className="text-[14px] font-bold text-emerald-400 mt-0.5">33 mins</div>
                  </div>
                </div>

                {/* Port Selection */}
                <div>
                  <span className="text-[10px] font-bold text-[#8fa7be] tracking-wider uppercase block mb-2">
                    Available Charger Ports
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((port) => {
                      const isBooked = selectedPort === port;
                      return (
                        <button
                          key={port}
                          onClick={() => setSelectedPort(port)}
                          className={`py-2 rounded-xl text-[12px] font-bold border transition-all snap-cursor ${
                            isBooked
                              ? "bg-cyan border-cyan text-slate-950 shadow-glow"
                              : port === 1 || port === 2
                                ? "bg-white/[0.02] border-white/5 text-[#6b7c93] cursor-not-allowed"
                                : "bg-white/[0.03] border-white/10 text-white hover:border-white/20"
                          }`}
                          disabled={port === 1 || port === 2}
                        >
                          Port {port}
                          <span className="block text-[8px] opacity-60">
                            {port === 1 || port === 2 ? "In Use" : isBooked ? "Reserved" : "Ready"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setReservationState("NONE");
                      setSelectedPort(null);
                      setActiveStep(0);
                      addChatMessage("ai", "Reservation cancelled. Rerouting disabled.");
                    }}
                    className="flex-1 py-2 rounded-full border border-white/10 text-red-400 text-[12.5px] font-semibold hover:bg-white/5 transition-all snap-cursor"
                  >
                    Cancel Reservation
                  </button>
                  <button
                    onClick={() => {
                      addChatMessage("ai", "Reservation modified. Lock duration extended +10 mins.");
                    }}
                    className="flex-1 py-2 bg-white text-slate-950 text-[12.5px] font-bold rounded-full hover:scale-[1.02] transition-all snap-cursor"
                  >
                    Modify Reservation
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Journey Timeline */}
          <div className="rounded-[22px] border border-white/[0.08] bg-slate-950/40 backdrop-blur-xl p-5 shadow-lift flex-1">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
              <h2 className="text-[12px] font-bold text-cyan tracking-widest uppercase">
                🛤️ JOURNEY TIMELINE
              </h2>
              <span className="text-[10px] font-semibold text-[#a9bcd1] tracking-wider font-mono">
                STAGE {activeStep} / 6
              </span>
            </div>

            <div className="relative pl-6 space-y-4 text-[12.5px]">
              {/* Vertical timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] bg-white/10" />

              {[
                { s: 0, label: "Battery Status Checked", desc: `SOC: ${batterySoc}% • Safe range active` },
                { s: 1, label: "AI Range Prediction", desc: "Topographic & wind friction calibrated" },
                { s: 2, label: "Recommended Stop Located", desc: "Station B selected; 33m wait saved" },
                { s: 3, label: "Reservation Locked", desc: "Port 3 slot verified & pre-booked" },
                { s: 4, label: "HUD Navigation Synced", desc: "Real-time rerouting loaded to center cockpit" },
                { s: 5, label: "Active Charger Sync", desc: "Fast-charging active at 350 kW rate" },
                { s: 6, label: "State of Health Calibrated", desc: "Battery profile updated: 94.6% SoH" },
              ].map((item) => {
                const isCurrent = activeStep === item.s;
                const isCompleted = activeStep > item.s;

                return (
                  <div key={item.s} className="relative transition-all">
                    {/* Node indicator */}
                    <div
                      className={`absolute -left-[23.5px] top-1.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                        isCurrent
                          ? "bg-cyan border-cyan scale-110 shadow-glow"
                          : isCompleted
                            ? "bg-emerald-500 border-emerald-500"
                            : "bg-slate-950 border-white/20"
                      }`}
                    >
                      {isCompleted && <span className="text-[7.5px] text-slate-950">✓</span>}
                    </div>

                    <div className={`${isCurrent ? "text-white" : isCompleted ? "text-[#a9bcd1]" : "text-[#546b85]"}`}>
                      <div className="font-bold flex items-center gap-2">
                        {item.label}
                        {isCurrent && <span className="text-[8px] bg-cyan/15 text-cyan px-1.5 py-0.5 rounded tracking-widest font-mono">ACTIVE</span>}
                      </div>
                      <div className="text-[11.5px] text-ink-500 font-semibold mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Footer Details */}
      <footer className="px-6 py-4 border-t border-white/[0.08] bg-slate-950/20 text-center text-[11px] text-ink-400 font-semibold relative z-30">
        EVIQ AI Cockpit Simulator • Model: Temporal Fusion Transformer MPC • HKUST Entrepreneurship Demo Version
      </footer>
    </div>
  );
}
