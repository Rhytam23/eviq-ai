"use client";
import { Container } from "@/components/ui/Container";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simulated Station Details
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
  x: number;
  y: number;
}

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
    x: 120,
    y: 180,
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
    x: 320,
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
    x: 480,
    y: 90,
  },
];

type DashboardTab = "battery" | "charging" | "operator" | "fleet" | "infra" | "reserve" | "analytics";

export default function DemoPage() {
  // Live Simulator Inputs
  const [batterySoc, setBatterySoc] = useState(12);
  const [trafficSeverity, setTrafficSeverity] = useState<"normal" | "dense" | "gridlock">("normal");
  const [weatherStress, setWeatherStress] = useState<"nominal" | "rain" | "heat">("nominal");
  const [corridor, setCorridor] = useState<"hkust" | "airport" | "central">("hkust");
  const [selectedStation, setSelectedStation] = useState<Station>(initialStations[1]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("battery");

  // Reservation Flow state
  const [reservationState, setReservationState] = useState<"NONE" | "CONFIRMED" | "CHARGING" | "COMPLETED">("NONE");
  const [selectedPort, setSelectedPort] = useState<number | null>(null);

  // Dynamic calculations based on inputs
  const weatherFactor = weatherStress === "nominal" ? 1.0 : weatherStress === "rain" ? 1.15 : 1.30;
  const trafficFactor = trafficSeverity === "normal" ? 0 : trafficSeverity === "dense" ? 15 : 35;
  
  // Calculate dynamic wait times
  const estWaitTime = Math.max(0, selectedStation.queue + trafficFactor - (reservationState === "CONFIRMED" ? selectedStation.queue : 0));
  
  // Calculate optimal range prediction
  const baseRange = Math.round(batterySoc * 3.2);
  const correctedRange = Math.round(baseRange / weatherFactor);
  
  // Calculate pricing based on station and time-slot
  const costPerKwh = selectedStation.id === "B" ? 0.32 : selectedStation.id === "A" ? 0.48 : 0.42;
  const totalCost = (costPerKwh * (80 - batterySoc)).toFixed(2);

  // Terminal state logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, `[${timestamp}] ${msg}`].slice(-8));
  };

  useEffect(() => {
    addLog("System initialized. Monitoring active BMS feeds.");
  }, []);

  // Update simulator on input change
  useEffect(() => {
    addLog(`MPC Recalibrating: Weather Factor ${weatherFactor}x, Extra Traffic Wait +${trafficFactor}m.`);
  }, [batterySoc, trafficSeverity, weatherStress, corridor, weatherFactor, trafficFactor]);

  useEffect(() => {
    addLog(`Selected charger shifted: ${selectedStation.name}. Reliability: ${selectedStation.reliability}%.`);
  }, [selectedStation]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <div className="min-h-screen bg-[#05070B] text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Soft orange grid gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_10%,rgba(255,122,0,0.035),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 grid-faint opacity-[0.25] pointer-events-none z-0" />

      {/* Main header block */}
      <header className="border-b border-white/[0.08] bg-[#0A1018]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-[12px] font-semibold text-orange hover:text-white transition-colors">
            ← BACK TO LANDING
          </a>
          <span className="text-white/20">|</span>
          <h1 className="text-[17px] font-bold tracking-tight text-white flex items-center gap-2">
            EVIQ AI <span className="text-[10px] font-mono tracking-widest text-orange bg-orange/10 px-2.5 py-0.5 rounded-full">SaaS SIMULATOR</span>
          </h1>
        </div>

        <div className="flex gap-4 items-center">
          <div className="hidden md:flex items-center gap-6 text-[12.5px] font-mono text-[#A0AEC0]">
            <div>BATTERY: <span className="text-white font-bold">{batterySoc}%</span></div>
            <div>EST RANGE: <span className="text-orange font-bold">{correctedRange} mi</span></div>
            <div>SOLVER RATE: <span className="text-white font-bold">&lt;42ms</span></div>
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="flex-1 p-6 grid lg:grid-cols-[0.8fr_2.2fr] gap-6 relative z-10">
        
        {/* Left Column: Interactive Simulation Control panel */}
        <section className="rounded-[28px] border border-white/[0.08] bg-[#0A1018] p-6 flex flex-col justify-between shadow-soft h-fit">
          <div className="space-y-6">
            <div className="border-b border-white/[0.06] pb-4">
              <h2 className="text-[12px] font-bold text-orange tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                SIMULATOR CONTROLS
              </h2>
              <p className="text-[12px] text-[#A0AEC0] mt-1">Adjust environmental parameters to update dashboards.</p>
            </div>

            {/* Slider 1: SoC */}
            <div className="space-y-2">
              <div className="flex justify-between text-[13px] font-mono">
                <span className="text-[#A0AEC0]">Battery SoC</span>
                <span className="text-white font-bold">{batterySoc}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                value={batterySoc}
                onChange={(e) => setBatterySoc(parseInt(e.target.value))}
                className="w-full accent-orange cursor-pointer"
              />
            </div>

            {/* Selector 1: Traffic */}
            <div className="space-y-2">
              <span className="text-[13px] font-mono text-[#A0AEC0] block">Traffic Density</span>
              <div className="grid grid-cols-3 gap-2">
                {(["normal", "dense", "gridlock"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTrafficSeverity(t);
                      addLog(`Traffic state altered to ${t.toUpperCase()}.`);
                    }}
                    className={`py-1.5 rounded-lg text-[12px] font-bold uppercase transition-all ${
                      trafficSeverity === t
                        ? "bg-orange text-white"
                        : "bg-white/5 text-[#A0AEC0] hover:bg-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector 2: Weather */}
            <div className="space-y-2">
              <span className="text-[13px] font-mono text-[#A0AEC0] block">Weather Stress</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "nominal", name: "25°C" },
                  { id: "rain", name: "Rain" },
                  { id: "heat", name: "42°C Heat" },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setWeatherStress(w.id as any);
                      addLog(`Weather stress shifted to ${w.name.toUpperCase()}.`);
                    }}
                    className={`py-1.5 rounded-lg text-[12px] font-bold uppercase transition-all ${
                      weatherStress === w.id
                        ? "bg-orange text-white"
                        : "bg-white/5 text-[#A0AEC0] hover:bg-white/10"
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector 3: Corridor */}
            <div className="space-y-2">
              <span className="text-[13px] font-mono text-[#A0AEC0] block">Destination Corridor</span>
              <select
                value={corridor}
                onChange={(e) => {
                  setCorridor(e.target.value as any);
                  addLog(`Route corridor recalculated: ${e.target.value.toUpperCase()}.`);
                }}
                className="w-full bg-[#05070B] border border-white/[0.08] rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange"
              >
                <option value="hkust">HKUST Corridor (Distance: 42mi)</option>
                <option value="airport">Airport Highway (Distance: 58mi)</option>
                <option value="central">Central District Tunnel (Distance: 31mi)</option>
              </select>
            </div>

            {/* Charging Stations Selectors */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <span className="text-[13px] font-mono text-[#A0AEC0] block">Target charging Station</span>
              <div className="space-y-2">
                {initialStations.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStation(st)}
                    className={`w-full text-left p-3.5 rounded-xl border text-[12.5px] transition-all flex justify-between items-center ${
                      selectedStation.id === st.id
                        ? "bg-orange/5 border-orange text-white"
                        : "bg-white/[0.01] border-white/5 text-[#A0AEC0] hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <span className="font-bold block">{st.name}</span>
                      <span className="text-[11px] font-mono block text-[#A0AEC0] mt-0.5">{st.speed} • {st.connector}</span>
                    </div>
                    <span className="font-mono text-orange font-bold">{st.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.06] pt-4">
            <span className="text-[11px] font-mono text-[#546b85] block uppercase">Verification Status</span>
            <div className="mt-2 flex items-center gap-2 text-[12px] text-orange">
              <span className="w-2 h-2 rounded-full bg-orange animate-ping" />
              <span>Calibrating model outputs...</span>
            </div>
          </div>
        </section>

        {/* Right Column: 7 Dashboards Viewport */}
        <section className="space-y-6 flex flex-col justify-between">
          
          {/* Dashboard Hub Header */}
          <div className="rounded-[28px] border border-white/[0.08] bg-[#0A1018] p-6 shadow-soft flex-1">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-[18px] font-bold text-white tracking-tight">EVIQ Platform Dashboard Suite</h3>
                <p className="text-[12.5px] text-[#A0AEC0] mt-0.5">Continuous telemetry analytics and MPC solver decisions.</p>
              </div>

              {/* Tabs list */}
              <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl">
                {([
                  { id: "battery", label: "🔋 Battery" },
                  { id: "charging", label: "⚡ Charging" },
                  { id: "operator", label: "🖥️ Operator" },
                  { id: "fleet", label: "🚚 Fleet" },
                  { id: "infra", label: "🗺️ Infrastructure" },
                  { id: "reserve", label: "🔒 Reservation" },
                  { id: "analytics", label: "📈 Analytics" },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all uppercase font-mono ${
                      activeTab === tab.id
                        ? "bg-orange text-white"
                        : "text-[#A0AEC0] hover:bg-white/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Rendering Viewport */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* 1. BATTERY DASHBOARD */}
                {activeTab === "battery" && (
                  <motion.div
                    key="battery"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-4 gap-4">
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">BATTERY STATE OF HEALTH</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">94.6% SOH</span>
                        <span className="text-[12px] text-orange mt-1 block">Optimal calibration status</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">INTERNAL TEMPERATURE</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">28.4 °C</span>
                        <span className="text-[12px] text-[#A0AEC0] mt-1 block">Max threshold limit: 45°C</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">NOMINAL CELL VOLTAGE</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">398 V</span>
                        <span className="text-[12px] text-[#A0AEC0] mt-1 block">Current draw: 84kW peak</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">DYNAMIC TARGET RATE</span>
                        <span className="text-[26px] font-bold text-orange mt-1 block">80% Limit</span>
                        <span className="text-[12px] text-orange mt-1 block">Configured for cell health</span>
                      </div>
                    </div>

                    <div className="border border-white/[0.06] rounded-2xl p-6 bg-black/20">
                      <h4 className="text-[14px] font-bold text-white uppercase tracking-wider mb-4">Battery Degradation Wear Model</h4>
                      {/* degradation mock chart */}
                      <div className="h-44 flex items-end justify-between gap-2.5 pt-6 border-b border-l border-white/10 px-4 relative">
                        <span className="absolute top-1 left-2 text-[10.5px] text-[#546b85] font-mono font-bold">100% capacity</span>
                        <span className="absolute bottom-2 right-2 text-[10.5px] text-[#546b85] font-mono font-bold">50k miles</span>
                        <div className="w-full bg-[#101820] h-32 rounded-t relative">
                          <div className="absolute inset-x-0 bottom-0 bg-orange/20 h-28 rounded-t" />
                          <div className="absolute inset-x-0 bottom-0 bg-orange/40 h-16 rounded-t" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. CHARGING DASHBOARD */}
                {activeTab === "charging" && (
                  <motion.div
                    key="charging"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">CURRENT SPEED LIMIT</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">{selectedStation.speed}</span>
                        <span className="text-[12px] text-orange mt-1 block">Dynamic handshake calibration ok</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">CONNECTOR PROTOCOL</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">{selectedStation.connector.split(" / ")[0]}</span>
                        <span className="text-[12px] text-[#A0AEC0] mt-1 block">Hardware lock target secure</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">SESSION PRICE SEGMENT</span>
                        <span className="text-[26px] font-bold text-orange mt-1 block">{selectedStation.price.split(" (")[0]}</span>
                        <span className="text-[12px] text-orange mt-1 block">Off-Peak locked tarif</span>
                      </div>
                    </div>

                    <div className="bg-[#101820] border border-white/[0.08] rounded-2xl p-6">
                      <h4 className="text-[14px] font-bold text-white uppercase tracking-wider mb-4">Charge Speed Delivery Curve</h4>
                      <div className="h-32 bg-black/40 rounded-xl relative overflow-hidden flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 120">
                          <path d="M 0 100 Q 150 20 400 30 T 800 110" fill="none" stroke="#FF7A00" strokeWidth="3" />
                          <circle cx="280" cy="30" r="5" fill="#FF7A00" />
                        </svg>
                        <span className="absolute bottom-2 right-4 text-[10px] font-mono text-[#546b85]">350 kW DC Peak Target</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. OPERATOR DASHBOARD */}
                {activeTab === "operator" && (
                  <motion.div
                    key="operator"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-6">
                        <span className="text-[10px] text-orange font-mono uppercase block mb-2">GRID CONGESTION TARIFFS</span>
                        <h4 className="text-[24px] font-bold text-white">$0.32 - $0.48 / kWh</h4>
                        <p className="text-[13px] text-[#A0AEC0] mt-2 leading-relaxed">
                          Peak rate tariffs dynamically trigger between 16:00 and 20:00. EVIQ routes vehicles around congestion spikes.
                        </p>
                      </div>

                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-6">
                        <span className="text-[10px] text-orange font-mono uppercase block mb-2">TRANSFORMER LOAD CAPACITY</span>
                        <h4 className="text-[24px] font-bold text-white">820 kVA Nominal</h4>
                        <p className="text-[13px] text-[#A0AEC0] mt-2 leading-relaxed">
                          Local sub-station thermal profiles are scanned continuously to ensure active hardware is running at 100% capacity.
                        </p>
                      </div>
                    </div>

                    <div className="border border-white/[0.06] rounded-2xl p-5 bg-black/20">
                      <div className="flex justify-between items-center text-[13px] mb-3">
                        <span className="font-bold text-white">Active Grid Power Allocation</span>
                        <span className="text-[#A0AEC0] font-mono">68% Load Factor</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-orange rounded-full" style={{ width: "68%" }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. FLEET DASHBOARD */}
                {activeTab === "fleet" && (
                  <motion.div
                    key="fleet"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-4 gap-4">
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">ACTIVE FLEET VEHICLES</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">4 Vehicles</span>
                        <span className="text-[12px] text-orange mt-1 block">Connected OBD-II streams</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">FLEET AVERAGE SOC</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">62% SoC</span>
                        <span className="text-[12px] text-[#A0AEC0] mt-1 block">Safe margins calibration ok</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">OPTIMIZED TRIP PATHS</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">100% Active</span>
                        <span className="text-[12px] text-[#A0AEC0] mt-1 block">0 wait delays triggered</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">EMERGENCY BYPASSES</span>
                        <span className="text-[26px] font-bold text-orange mt-1 block">0 Required</span>
                        <span className="text-[12px] text-orange mt-1 block">All vehicles clear</span>
                      </div>
                    </div>

                    <div className="border border-white/[0.06] rounded-2xl p-4 bg-black/20 space-y-3">
                      <h4 className="text-[13px] font-bold text-white uppercase tracking-wider">Active Fleet Dispatch Tracker</h4>
                      {[
                        { id: "EV-901", status: "Optimized Route Active", range: "142 mi", statusColor: "text-orange" },
                        { id: "EV-902", status: "Charging Stop Lock", range: "282 mi", statusColor: "text-orange animate-pulse" },
                        { id: "EV-904", status: "Calibration Complete", range: "310 mi", statusColor: "text-[#A0AEC0]" },
                      ].map((v) => (
                        <div key={v.id} className="flex justify-between items-center text-[12.5px] border-b border-white/5 pb-2">
                          <span className="font-mono font-bold text-white">{v.id}</span>
                          <span className={v.statusColor}>{v.status}</span>
                          <span className="font-mono text-[#A0AEC0]">{v.range}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 5. INFRASTRUCTURE DASHBOARD */}
                {activeTab === "infra" && (
                  <motion.div
                    key="infra"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-3 gap-4">
                      {initialStations.map((st) => (
                        <div key={st.id} className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[12px] font-bold text-white">{st.id} - {st.name.split(" (")[0]}</span>
                            <span className="text-[10px] font-mono text-orange font-bold">{st.reliability}% Score</span>
                          </div>
                          <div className="text-[12px] text-[#A0AEC0]">
                            Speed Cap: {st.speed} <br />
                            Price: {st.price.split(" (")[0]} <br />
                            Queue: {st.queue} mins wait
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#101820] border border-white/[0.08] rounded-2xl p-6 space-y-4">
                      <h4 className="text-[14px] font-bold text-white uppercase tracking-wider">Telemetry Corridors Coverage</h4>
                      <div className="h-32 bg-black/40 rounded-xl relative overflow-hidden flex items-center justify-center">
                        <span className="text-[#A0AEC0] text-[13px] font-mono">MAP LATITUDE GRID ACTIVE</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 6. RESERVATION DASHBOARD */}
                {activeTab === "reserve" && (
                  <motion.div
                    key="reserve"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    <div className="bg-[#101820] border border-white/[0.08] rounded-[24px] p-6 space-y-6">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <div>
                          <span className="text-[10.5px] font-mono text-orange uppercase tracking-wider block">RESERVATION CODE</span>
                          <span className="text-[20px] font-bold text-white block mt-0.5">EVIQ-SECURE-99A</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-orange/15 text-orange font-mono font-bold text-[11px] uppercase">
                          {reservationState === "NONE" ? "No Session" : reservationState}
                        </span>
                      </div>

                      {reservationState === "NONE" ? (
                        <div className="text-center py-8">
                          <p className="text-[13.5px] text-[#A0AEC0] italic">
                            No slot locked. Reserve Station B to allocate Port 3.
                          </p>
                          <button
                            onClick={() => {
                              setReservationState("CONFIRMED");
                              setSelectedPort(3);
                              addLog(`Port 3 reservation secured at Kowloon Bay Super-Hub.`);
                            }}
                            className="mt-4 px-6 py-2.5 bg-orange text-white font-bold rounded-full text-[13px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Reserve Kowloon Bay Stop Now
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid sm:grid-cols-3 gap-4 text-[13px]">
                            <div className="bg-black/35 rounded-xl p-4">
                              <span className="text-[#546b85] text-[10px] block font-mono">SELECTED PORT</span>
                              <span className="text-white font-bold block mt-1">Port {selectedPort} (EA)</span>
                            </div>
                            <div className="bg-black/35 rounded-xl p-4">
                              <span className="text-[#546b85] text-[10px] block font-mono">QUEUE ELIMINATED</span>
                              <span className="text-orange font-bold block mt-1">{estWaitTime} mins wait</span>
                            </div>
                            <div className="bg-black/35 rounded-xl p-4">
                              <span className="text-[#546b85] text-[10px] block font-mono">COST LOCK ESTIMATE</span>
                              <span className="text-white font-bold block mt-1">${totalCost}</span>
                            </div>
                          </div>

                          <div className="flex gap-2.5 pt-4">
                            <button
                              onClick={() => {
                                setReservationState("NONE");
                                setSelectedPort(null);
                                addLog("Reservation cancelled manually by driver.");
                              }}
                              className="flex-1 py-2 rounded-full border border-white/10 text-red-400 text-[12.5px] font-semibold hover:bg-white/5 transition-all"
                            >
                              Cancel Booking
                            </button>
                            <button
                              onClick={() => {
                                addLog("Reservation lock timer extended +15 mins.");
                              }}
                              className="flex-1 py-2 bg-white text-slate-950 text-[12.5px] font-bold rounded-full hover:scale-[1.02] transition-all"
                            >
                              Extend Lock Timer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 7. ANALYTICS DASHBOARD */}
                {activeTab === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">TOTAL DRIVER SAVINGS</span>
                        <span className="text-[26px] font-bold text-orange mt-1 block">$14.50 Saved</span>
                        <span className="text-[12px] text-[#A0AEC0] mt-1 block">Dynamic pricing optimization ok</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">QUEUE WAITING ELIMINATED</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">33 Minutes Saved</span>
                        <span className="text-[12px] text-[#A0AEC0] mt-1 block">Congestion routes bypassed</span>
                      </div>
                      <div className="bg-[#101820] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-[10px] text-[#546b85] font-mono uppercase block">BATTERY SOH RETAINED</span>
                        <span className="text-[26px] font-bold text-white mt-1 block">+0.42% SOH Wear</span>
                        <span className="text-[12px] text-[#A0AEC0] mt-1 block">Smart thermal scaling limits</span>
                      </div>
                    </div>

                    <div className="bg-[#101820] border border-white/[0.08] rounded-2xl p-6">
                      <h4 className="text-[14px] font-bold text-white uppercase tracking-wider mb-4">Historical Savings Optimizations Ledger</h4>
                      <div className="h-28 bg-black/40 rounded-xl relative overflow-hidden flex items-center justify-center">
                        <span className="text-[#A0AEC0] text-[13px] font-mono">LEDGER ARCHIVE METRICS LOGGED</span>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Live Decision Terminal Logs */}
          <div className="rounded-[28px] border border-white/[0.08] bg-[#0A1018] p-5 shadow-soft">
            <span className="text-[11px] font-mono text-orange block uppercase tracking-wider mb-2.5">
              Live Decision Solver Terminal Output
            </span>
            <div
              ref={logContainerRef}
              className="bg-black/60 border border-white/5 rounded-xl p-4 h-36 overflow-y-auto font-mono text-[12px] leading-relaxed text-[#A0AEC0] space-y-1.5"
            >
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))}
              {terminalLogs.length === 0 && (
                <div className="text-[#546b85] italic">No logs parsed. Run simulator queries above.</div>
              )}
            </div>
          </div>

        </section>
      </main>

      {/* Bottom Footer Details */}
      <footer className="px-6 py-4 border-t border-white/[0.08] bg-[#05070B] text-center text-[11px] text-[#A0AEC0] font-semibold relative z-30">
        EVIQ AI Cockpit Simulator • Model: Temporal Fusion Transformer MPC • HKUST Entrepreneurship Demo Version
      </footer>
    </div>
  );
}
