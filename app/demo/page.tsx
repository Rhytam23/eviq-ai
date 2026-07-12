"use client";
import { useState, useMemo } from "react";
import TripMap from "@/components/demo/TripMap";
import StationCard from "@/components/demo/StationCard";
import AiRecommendation from "@/components/demo/AiRecommendation";
import ReservationPanel from "@/components/demo/ReservationPanel";
import EnterpriseInsights from "@/components/demo/EnterpriseInsights";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Station {
  id: string;
  name: string;
  speed: string;
  speedKw: number;
  connector: string;
  pricePerKwh: number;
  price: string;
  baseQueue: number;
  reliability: number;
}

// ─── Static station data ──────────────────────────────────────────────────────

const STATIONS: Station[] = [
  {
    id: "A",
    name: "Cyberport Charger Hub (Station A)",
    speed: "150 kW",
    speedKw: 150,
    connector: "CCS2 / NACS",
    pricePerKwh: 0.48,
    price: "$0.48 / kWh",
    baseQueue: 41,
    reliability: 82,
  },
  {
    id: "B",
    name: "Kowloon Bay Super-Hub (Station B)",
    speed: "350 kW",
    speedKw: 350,
    connector: "Liquid-Cooled NACS",
    pricePerKwh: 0.32,
    price: "$0.32 / kWh",
    baseQueue: 0,
    reliability: 99,
  },
  {
    id: "C",
    name: "Sha Tin Gateway (Station C)",
    speed: "120 kW",
    speedKw: 120,
    connector: "CCS2",
    pricePerKwh: 0.42,
    price: "$0.42 / kWh",
    baseQueue: 12,
    reliability: 91,
  },
];

// ─── Corridor data ────────────────────────────────────────────────────────────

const CORRIDOR_DISTANCES = {
  hkust: 42,
  airport: 58,
  central: 31,
};

const CORRIDOR_LABELS = {
  hkust: "HKUST Corridor",
  airport: "Airport Highway",
  central: "Central District",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAiScore(reliability: number, pricePerKwh: number, queue: number): number {
  const rScore = reliability * 0.4;
  const pScore = (1 / pricePerKwh) * 15 * 0.3;
  const qScore = Math.max(0, (50 - queue) / 50) * 30 * 0.3;
  return Math.min(100, Math.round(rScore + pScore + qScore));
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DemoPage() {
  // ── User inputs ──
  const [batterySoc, setBatterySoc] = useState(22);
  const [trafficSeverity, setTrafficSeverity] = useState<"normal" | "dense" | "gridlock">("normal");
  const [weatherStress, setWeatherStress] = useState<"nominal" | "rain" | "heat">("nominal");
  const [corridor, setCorridor] = useState<"hkust" | "airport" | "central">("hkust");

  // ── Reservation state machine ──
  const [reservationStatus, setReservationStatus] = useState<"NONE" | "CONFIRMED" | "ACTIVE">("NONE");
  const [reservedStationId, setReservedStationId] = useState<string | null>(null);

  // ── Derived values ──
  const weatherFactor = weatherStress === "nominal" ? 1.0 : weatherStress === "rain" ? 1.15 : 1.3;
  const trafficAdder = trafficSeverity === "normal" ? 0 : trafficSeverity === "dense" ? 15 : 35;
  const distanceMi = CORRIDOR_DISTANCES[corridor];
  const energyNeededKwh = distanceMi * 0.25 * weatherFactor; // ~0.25 kWh/mi adj for weather
  const correctedRange = Math.round((batterySoc * 3.8) / weatherFactor);

  const stationsWithDerived = useMemo(() => {
    return STATIONS.map((st) => {
      // Queue = base + traffic, minus 0 if reserved at this station
      const effectiveQueue =
        reservedStationId === st.id && reservationStatus !== "NONE"
          ? 0
          : st.baseQueue + trafficAdder;

      // Arrival SoC: subtract energy consumed driving to station
      const driveKwh = energyNeededKwh * (st.id === "B" ? 0.9 : st.id === "C" ? 1.1 : 1.0);
      const arrivalSoc = Math.max(5, Math.round(batterySoc - (driveKwh / 0.8) * 10));

      // Charge time to 80%: kWh to add / station speed in kW, ×60 for minutes
      const kwhToAdd = Math.max(0, (80 - arrivalSoc) * 0.8);
      const chargeTimeMin = Math.round((kwhToAdd / st.speedKw) * 60);

      const totalCost = +(kwhToAdd * st.pricePerKwh).toFixed(2);
      const aiScore = calcAiScore(st.reliability, st.pricePerKwh, effectiveQueue);

      return {
        ...st,
        effectiveQueue,
        arrivalSoc,
        chargeTimeMin,
        totalCost,
        aiScore,
      };
    });
  }, [batterySoc, reservedStationId, reservationStatus, trafficAdder, energyNeededKwh]);

  // ── Find recommended station (highest AI score) ──
  const recommendedStation = useMemo(
    () => [...stationsWithDerived].sort((a, b) => b.aiScore - a.aiScore)[0],
    [stationsWithDerived]
  );

  // ── Currently reserved/selected station ──
  const activeStation = useMemo(
    () => stationsWithDerived.find((s) => s.id === (reservedStationId ?? recommendedStation.id)) ?? recommendedStation,
    [stationsWithDerived, reservedStationId, recommendedStation]
  );

  // ── Map station markers ──
  const mapStations = stationsWithDerived.map((st) => ({
    id: st.id,
    name: st.name,
    x: 0,
    y: 0,
    isRecommended: st.id === recommendedStation.id,
    isSelected: st.id === (reservedStationId ?? recommendedStation.id),
  }));

  // ── AI recommendation reasons (dynamic) ──
  const aiReasons = useMemo(() => {
    const st = recommendedStation;
    const reasons: string[] = [];
    if (st.effectiveQueue === 0) reasons.push("No queue — immediate port access available");
    else reasons.push(`Shortest wait — ${st.effectiveQueue} min queue vs alternatives`);
    reasons.push(`Lowest rate at $${st.pricePerKwh.toFixed(2)}/kWh${weatherStress !== "nominal" ? " (weather-adjusted tariff locked)" : ""}`);
    reasons.push(`${st.reliability}% port reliability — highest uptime in corridor`);
    return reasons;
  }, [recommendedStation, weatherStress]);

  const rejectedStations = useMemo(() => {
    return stationsWithDerived
      .filter((s) => s.id !== recommendedStation.id)
      .map((s) => {
        let reason = "";
        if (s.effectiveQueue > recommendedStation.effectiveQueue + 10)
          reason = `${s.effectiveQueue} min queue`;
        else if (s.pricePerKwh > recommendedStation.pricePerKwh)
          reason = `Higher rate $${s.pricePerKwh}/kWh`;
        else if (s.reliability < recommendedStation.reliability)
          reason = `Lower reliability ${s.reliability}%`;
        else reason = "Lower composite AI score";
        return { id: s.id, name: s.name, reason };
      });
  }, [stationsWithDerived, recommendedStation]);

  // ── Time saved vs worst alternative ──
  const worstQueue = Math.max(...stationsWithDerived.map((s) => s.effectiveQueue));
  const timeSavedVsWorst = Math.max(0, worstQueue - recommendedStation.effectiveQueue);

  // ── Cost saved vs most expensive alternative ──
  const maxCost = Math.max(...stationsWithDerived.map((s) => s.totalCost));
  const costSaved = +(maxCost - activeStation.totalCost).toFixed(2);

  // ── Enterprise insights (derived from current state) ──
  const avgQueue = Math.round(
    stationsWithDerived.reduce((a, s) => a + s.effectiveQueue, 0) / stationsWithDerived.length
  );
  const networkUtil = trafficSeverity === "normal" ? 62 : trafficSeverity === "dense" ? 78 : 91;
  const predictedDemand = trafficSeverity === "gridlock" ? 94 : trafficSeverity === "dense" ? 81 : 67;

  // ── Handlers ──
  function handleReserve(stationId: string) {
    setReservedStationId(stationId);
    setReservationStatus("CONFIRMED");
  }

  function handleCancelReservation() {
    setReservationStatus("NONE");
    setReservedStationId(null);
  }

  function handleStartSession() {
    setReservationStatus("ACTIVE");
  }

  return (
    <div className="min-h-screen bg-[#05070B] text-white font-sans flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#05070B]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          {/* Left: Back + Wordmark */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              aria-label="Back to home"
              className="text-[11px] font-mono text-white/35 hover:text-white/70 transition-colors flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Home
            </a>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold tracking-tight text-white">EVIQ</span>
              <span className="text-[15px] font-light text-white/50">AI</span>
              <span className="ml-1 text-[9px] font-mono font-bold uppercase tracking-widest text-[#FF7A00] bg-[#FF7A00]/10 px-2 py-0.5 rounded border border-[#FF7A00]/20">
                Demo
              </span>
            </div>
          </div>

          {/* Center: Live trip metrics */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-white/30 uppercase">Battery</span>
              <span className="text-[13px] font-semibold text-white tabular-nums">{batterySoc}%</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-white/30 uppercase">Est. Range</span>
              <span className="text-[13px] font-semibold text-[#FF7A00] tabular-nums">{correctedRange} mi</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-white/30 uppercase">Corridor</span>
              <span className="text-[13px] font-semibold text-white">{CORRIDOR_LABELS[corridor]}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-white/30 uppercase">AI Rec.</span>
              <span className="text-[13px] font-semibold text-white">Station {recommendedStation.id}</span>
            </div>
          </div>

          {/* Right: Reservation status */}
          <div className="flex items-center gap-2">
            {reservationStatus === "NONE" ? (
              <span className="text-[10px] font-mono text-white/25">No active reservation</span>
            ) : reservationStatus === "CONFIRMED" ? (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400">Port Reserved</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
                <span className="text-[10px] font-mono text-[#FF7A00]">Charging Active</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main 3-column layout ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-5 grid lg:grid-cols-[280px_1fr_340px] gap-4 items-start">

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
        <aside className="space-y-4">

          {/* Vehicle & Trip Parameters */}
          <div className="rounded-2xl bg-[#0A1018] border border-white/[0.07] overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
              <p className="text-[11px] font-semibold text-white/80">Trip Parameters</p>
              <p className="text-[10px] text-white/30 mt-0.5">Adjust to update AI analysis</p>
            </div>
            <div className="px-4 py-4 space-y-5">

              {/* SoC slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="soc-slider" className="text-[11px] text-white/45">
                    Battery State of Charge
                  </label>
                  <span className="text-[12px] font-semibold font-mono text-white tabular-nums">{batterySoc}%</span>
                </div>
                <input
                  id="soc-slider"
                  type="range"
                  min={5}
                  max={90}
                  step={1}
                  value={batterySoc}
                  onChange={(e) => setBatterySoc(parseInt(e.target.value))}
                  aria-label="Battery state of charge"
                  className="w-full accent-orange cursor-pointer"
                />
              </div>

              {/* Traffic */}
              <div>
                <p className="text-[11px] text-white/45 mb-2">Traffic Conditions</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["normal", "dense", "gridlock"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTrafficSeverity(t)}
                      aria-pressed={trafficSeverity === t}
                      className={`py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-orange ${
                        trafficSeverity === t
                          ? "bg-[#FF7A00] text-white"
                          : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather */}
              <div>
                <p className="text-[11px] text-white/45 mb-2">Weather</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "nominal", label: "Clear" },
                      { id: "rain", label: "Rain" },
                      { id: "heat", label: "42°C" },
                    ] as const
                  ).map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWeatherStress(w.id)}
                      aria-pressed={weatherStress === w.id}
                      className={`py-1.5 rounded-lg text-[11px] font-medium transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-orange ${
                        weatherStress === w.id
                          ? "bg-[#FF7A00] text-white"
                          : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corridor */}
              <div>
                <label htmlFor="corridor-select" className="text-[11px] text-white/45 block mb-2">
                  Destination Corridor
                </label>
                <select
                  id="corridor-select"
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value as typeof corridor)}
                  aria-label="Select destination corridor"
                  className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-[12px] text-white/80 focus:outline-none focus:border-[#FF7A00]/50 transition-colors cursor-pointer"
                >
                  <option value="hkust">HKUST Corridor — 42 mi</option>
                  <option value="airport">Airport Highway — 58 mi</option>
                  <option value="central">Central District — 31 mi</option>
                </select>
              </div>

            </div>
          </div>

          {/* Enterprise Insights */}
          <EnterpriseInsights
            activeChargers={20 - (trafficSeverity === "gridlock" ? 2 : 1)}
            offlineChargers={trafficSeverity === "gridlock" ? 2 : 1}
            avgQueueMin={avgQueue}
            networkUtilPct={networkUtil}
            predictedDemandPct={predictedDemand}
          />
        </aside>

        {/* ── CENTER: MAP ────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          {/* Map */}
          <div className="h-[480px] lg:h-[540px]">
            <TripMap
              corridor={corridor}
              trafficSeverity={trafficSeverity}
              weatherStress={weatherStress}
              stations={mapStations}
              onSelectStation={(id) => {
                // Clicking a station on the map sets it as the reservation target
                if (reservationStatus === "NONE") {
                  setReservedStationId(id === recommendedStation.id ? null : id);
                }
              }}
            />
          </div>

          {/* Station comparison cards */}
          <div>
            <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-3 px-1">
              Candidate Stations · {CORRIDOR_LABELS[corridor]}
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {stationsWithDerived
                .sort((a, b) => b.aiScore - a.aiScore)
                .map((st) => (
                  <StationCard
                    key={st.id}
                    id={st.id}
                    name={st.name}
                    speed={st.speed}
                    connector={st.connector}
                    price={st.price}
                    pricePerKwh={st.pricePerKwh}
                    queue={st.effectiveQueue}
                    reliability={st.reliability}
                    aiScore={st.aiScore}
                    arrivalSoc={st.arrivalSoc}
                    isRecommended={st.id === recommendedStation.id}
                    isSelected={st.id === (reservedStationId ?? recommendedStation.id)}
                    onSelect={() => {
                      if (reservationStatus === "NONE") {
                        setReservedStationId(st.id === recommendedStation.id ? null : st.id);
                      }
                    }}
                    onReserve={() => handleReserve(st.id)}
                    reservationActive={reservationStatus !== "NONE"}
                  />
                ))}
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL: Decision Journey ─────────────────────────────────── */}
        <aside className="space-y-4">

          {/* AI Recommendation */}
          <AiRecommendation
            stationName={recommendedStation.name}
            stationId={recommendedStation.id}
            confidence={Math.min(99, 70 + recommendedStation.aiScore - Math.max(...stationsWithDerived.filter(s => s.id !== recommendedStation.id).map(s => s.aiScore)))}
            reasons={aiReasons}
            rejectedStations={rejectedStations}
            estimatedChargeTime={recommendedStation.chargeTimeMin}
            estimatedCost={recommendedStation.totalCost}
            timeSavedVsWorst={timeSavedVsWorst}
          />

          {/* Reservation Panel */}
          <ReservationPanel
            status={reservationStatus}
            stationName={activeStation.name}
            portNumber={3}
            estimatedCost={activeStation.totalCost}
            estimatedChargeTime={activeStation.chargeTimeMin}
            timeSaved={timeSavedVsWorst}
            costSaved={Math.max(0, costSaved)}
            onReserve={() => handleReserve(reservedStationId ?? recommendedStation.id)}
            onCancel={handleCancelReservation}
            onStartSession={handleStartSession}
          />

        </aside>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] px-6 py-4 mt-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <span className="text-[11px] text-white/20 font-mono">
            EVIQ AI · Temporal Fusion Transformer MPC · HKUST Entrepreneurship Demo
          </span>
          <span className="text-[11px] text-white/20 font-mono">
            GridPulse Engineering
          </span>
        </div>
      </footer>
    </div>
  );
}
