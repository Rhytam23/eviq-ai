"use client";
import { motion } from "framer-motion";

interface StationCardProps {
  id: string;
  name: string;
  network: string;
  powerKw: number;
  connectorType: string;
  portsAvailable: number;
  portsTotal: number;
  pricePerKwh: number;
  currentQueueMinutes: number;
  predictedQueueMinutes: number;
  reliabilityScore: number;
  arrivalSoc: number;
  chargingTimeMinutes: number;
  distanceMiles: number;
  durationMinutes: number;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onReserve: () => void;
  reservationActive: boolean;
}

export default function StationCard({
  id,
  name,
  network,
  powerKw,
  connectorType,
  portsAvailable,
  portsTotal,
  pricePerKwh,
  currentQueueMinutes,
  predictedQueueMinutes,
  reliabilityScore,
  arrivalSoc,
  chargingTimeMinutes,
  distanceMiles,
  durationMinutes,
  isRecommended,
  isSelected,
  onSelect,
  onReserve,
  reservationActive,
}: StationCardProps) {
  const shortName = name.split(" - ")[1] || name;

  // AI confidence evaluation helper
  const getReliabilityColor = (score: number) => {
    if (score >= 95) return "text-cyan-400";
    if (score >= 85) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-rose-400";
  };

  const getSoCColor = (soc: number) => {
    if (soc <= 10) return "text-rose-400";
    if (soc <= 20) return "text-amber-400";
    return "text-cyan-400";
  };

  return (
    <motion.div
      layout
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      aria-pressed={isSelected}
      className={`relative rounded-2xl p-5 cursor-pointer text-left transition-all duration-200 border ${
        isSelected
          ? "bg-zinc-900 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
          : isRecommended
            ? "bg-[#09151c] border-cyan-500/35 hover:border-cyan-500/50"
            : "bg-zinc-950 border-white/[0.06] hover:border-white/[0.12]"
      }`}
      whileHover={{ y: -2 }}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-4 right-4">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
            AI RECOMMENDED
          </span>
        </div>
      )}

      {/* Header Info */}
      <div className="mb-4 pr-20">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {network}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white leading-tight">{shortName}</h4>
        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
          {connectorType} · {powerKw} kW
        </p>
      </div>

      {/* Main Grid Metrics */}
      <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 mb-5 border-t border-b border-white/[0.05] py-3.5">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Rate</p>
          <p className="text-xs font-semibold text-white font-mono">
            ${pricePerKwh.toFixed(2)}{" "}
            <span className="text-[10px] font-normal text-zinc-500">/ kWh</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
            Availability
          </p>
          <p className="text-xs font-semibold text-white">
            {portsAvailable} / {portsTotal}{" "}
            <span className="text-[10px] text-zinc-500 font-normal">ports</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
            Queue (Live / AI)
          </p>
          <p className="text-xs font-semibold text-white">
            {currentQueueMinutes === 0 ? "None" : `${currentQueueMinutes}m`}
            <span className="text-[10px] text-zinc-500 font-normal"> / </span>
            <span className="text-cyan-400 font-mono">{predictedQueueMinutes}m AI</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
            Est. Arrival SoC
          </p>
          <p className={`text-xs font-semibold font-mono ${getSoCColor(arrivalSoc)}`}>
            {arrivalSoc}% SoC
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
            Distance / ETA
          </p>
          <p className="text-xs font-semibold text-white font-mono">
            {distanceMiles.toFixed(1)} mi{" "}
            <span className="text-[10px] font-normal text-zinc-500">/ {durationMinutes}m</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
            Charge Duration
          </p>
          <p className="text-xs font-semibold text-white font-mono">
            {chargingTimeMinutes} mins{" "}
            <span className="text-[9px] font-normal text-zinc-500">(to 80%)</span>
          </p>
        </div>
      </div>

      {/* Reliability Telemetry bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-mono mb-1">
          <span className="text-zinc-500 uppercase tracking-wider">Reliability Score</span>
          <span className={`font-bold ${getReliabilityColor(reliabilityScore)}`}>
            {reliabilityScore}% AI
          </span>
        </div>
        <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isRecommended ? "bg-cyan-400" : "bg-zinc-700"}`}
            style={{ width: `${reliabilityScore}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReserve();
        }}
        disabled={reservationActive && !isSelected}
        className={`w-full py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
          reservationActive && isSelected
            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 cursor-default"
            : isRecommended && !reservationActive
              ? "bg-cyan-400 text-zinc-950 hover:bg-cyan-300 font-bold active:scale-[0.98]"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-white/[0.02] disabled:opacity-30 disabled:cursor-not-allowed"
        }`}
      >
        {reservationActive && isSelected ? "Active Booking ✓" : "Reserve Charger Port"}
      </button>
    </motion.div>
  );
}
