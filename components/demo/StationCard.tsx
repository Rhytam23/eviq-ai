"use client";
import { motion } from "framer-motion";

interface StationCardProps {
  id: string;
  name: string;
  speed: string;
  connector: string;
  price: string;
  pricePerKwh: number;
  queue: number;
  reliability: number;
  aiScore: number;
  arrivalSoc: number;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onReserve: () => void;
  reservationActive: boolean;
}

function ScoreBar({
  value,
  max = 100,
  color = "#FF7A00",
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-1 bg-white/[0.07] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

export default function StationCard({
  id,
  name,
  speed,
  connector,
  price,
  queue,
  reliability,
  aiScore,
  arrivalSoc,
  isRecommended,
  isSelected,
  onSelect,
  onReserve,
  reservationActive,
}: StationCardProps) {
  const shortName = name.replace(/ \(Station [A-Z]\)/, "");

  return (
    <motion.div
      layout
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      aria-pressed={isSelected}
      aria-label={`Station ${id}: ${shortName}`}
      className={`relative rounded-2xl p-5 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
        isRecommended
          ? "bg-[#0F1A10] border border-[#FF7A00]/30"
          : "bg-[#0A1018] border border-white/[0.07] hover:border-white/[0.14]"
      } ${isSelected ? "ring-1 ring-[#FF7A00]/50" : ""}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-4 right-4">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/25">
            AI Pick
          </span>
        </div>
      )}

      {/* Station ID + Name */}
      <div className="mb-4 pr-16">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-[11px] font-mono font-bold w-5 h-5 rounded flex items-center justify-center ${
              isRecommended ? "bg-[#FF7A00]/20 text-[#FF7A00]" : "bg-white/[0.06] text-white/50"
            }`}
          >
            {id}
          </span>
        </div>
        <h4 className="text-[13px] font-semibold text-white leading-snug">{shortName}</h4>
        <p className="text-[11px] text-white/40 mt-0.5 font-mono">{connector}</p>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
        <div>
          <p className="text-[10px] text-white/35 uppercase tracking-wider font-mono mb-0.5">
            Speed
          </p>
          <p className="text-[13px] font-semibold text-white">{speed}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/35 uppercase tracking-wider font-mono mb-0.5">
            Rate
          </p>
          <p
            className={`text-[13px] font-semibold ${isRecommended ? "text-[#FF7A00]" : "text-white"}`}
          >
            {price}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/35 uppercase tracking-wider font-mono mb-0.5">
            Est. Wait
          </p>
          <p className="text-[13px] font-semibold text-white">
            {queue === 0 ? <span className="text-emerald-400">No queue</span> : `${queue} min`}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/35 uppercase tracking-wider font-mono mb-0.5">
            Arrival SoC
          </p>
          <p className="text-[13px] font-semibold text-white">{arrivalSoc}%</p>
        </div>
      </div>

      {/* Reliability bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-white/35 uppercase tracking-wider font-mono">
            Reliability
          </span>
          <span className="text-[10px] font-mono text-white/60">{reliability}%</span>
        </div>
        <ScoreBar
          value={reliability}
          color={isRecommended ? "#FF7A00" : "rgba(255,255,255,0.25)"}
        />
      </div>

      {/* AI Score bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-white/35 uppercase tracking-wider font-mono">
            AI Score
          </span>
          <span
            className={`text-[10px] font-mono font-bold ${isRecommended ? "text-[#FF7A00]" : "text-white/60"}`}
          >
            {aiScore}/100
          </span>
        </div>
        <ScoreBar value={aiScore} color={isRecommended ? "#FF7A00" : "rgba(255,255,255,0.25)"} />
      </div>

      {/* Reserve CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReserve();
        }}
        disabled={reservationActive && !isSelected}
        aria-label={`Reserve port at ${shortName}`}
        className={`w-full py-2 rounded-xl text-[12px] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
          isRecommended && !reservationActive
            ? "bg-[#FF7A00] text-white hover:bg-[#FF8A15] active:scale-[0.98]"
            : reservationActive && isSelected
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-default"
              : "bg-white/[0.06] text-white/50 border border-white/[0.07] hover:bg-white/[0.10] hover:text-white/70 disabled:opacity-40 disabled:cursor-not-allowed"
        }`}
      >
        {reservationActive && isSelected ? "Port Reserved ✓" : "Reserve Port"}
      </button>
    </motion.div>
  );
}
