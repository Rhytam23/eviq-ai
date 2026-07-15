"use client";
import React from "react";
import { motion } from "framer-motion";

interface AiRecommendationProps {
  stationName: string;
  stationId: string;
  confidence: number;
  arrivalSoc: number;
  predictedQueue: number;
  chargingSpeedKw: number;
  estimatedCost: number;
  timeSavedMinutes: number;
  reliabilityScore: number;
  weatherCondition: string;
  weatherTempC: number;
  reasons: string[];
  rejectedStations: { id: string; name: string; reason: string }[];
}

function AiRecommendation({
  stationName,
  stationId,
  confidence,
  arrivalSoc,
  predictedQueue,
  chargingSpeedKw,
  estimatedCost,
  timeSavedMinutes,
  reliabilityScore,
  weatherCondition,
  weatherTempC,
  reasons,
  rejectedStations,
}: AiRecommendationProps) {
  const shortName = stationName.split(" - ")[1] || stationName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-zinc-900 border border-white/[0.06] overflow-hidden text-left"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2 py-0.5 rounded">
            PROPRIETARY AI LAYER
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">{shortName}</h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Station ID: {stationId}</p>
          </div>
          {/* Confidence Score Visual */}
          <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                aria-label={`AI Confidence: ${confidence}%`}
              >
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="3.5"
                />
                <motion.circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#00F0FF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - confidence / 100) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  transform="rotate(-90 24 24)"
                />
              </svg>
              <span className="absolute text-xs font-mono font-bold text-cyan-400">
                {confidence}%
              </span>
            </div>
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
              CONFIDENCE
            </span>
          </div>
        </div>
      </div>

      {/* Why This Station */}
      <div className="px-5 py-4 border-b border-white/[0.05] bg-zinc-950/40">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
          OPTIMIZATION INSIGHTS
        </p>
        <ul className="space-y-2.5">
          {reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path
                    d="M1 3L3 5L7 1"
                    stroke="#00F0FF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[12px] text-zinc-300 leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Telemetry Grid */}
      <div className="px-5 py-4 grid grid-cols-2 gap-y-3 gap-x-4 border-b border-white/[0.05] bg-zinc-950/20">
        <div>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Arrival Battery SoC
          </p>
          <p className="text-xs font-semibold text-white font-mono mt-0.5">{arrivalSoc}% SoC</p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Predicted Queue
          </p>
          <p className="text-xs font-semibold text-cyan-400 font-mono mt-0.5">
            {predictedQueue === 0 ? "Immediate access" : `${predictedQueue} min queue`}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Charging Speed
          </p>
          <p className="text-xs font-semibold text-white font-mono mt-0.5">
            {chargingSpeedKw} kW max
          </p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Estimated Cost
          </p>
          <p className="text-xs font-semibold text-white font-mono mt-0.5">
            ${estimatedCost.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Reliability Score
          </p>
          <p className="text-xs font-semibold text-white font-mono mt-0.5">
            {reliabilityScore}% rating
          </p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Optimized Savings
          </p>
          <p className="text-xs font-semibold text-emerald-400 font-mono mt-0.5">
            +{timeSavedMinutes}m saved
          </p>
        </div>
        <div className="col-span-2 border-t border-white/[0.03] pt-2 mt-1">
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Weather Range Penalty
          </p>
          <p className="text-xs font-semibold text-white font-mono mt-0.5">
            {weatherCondition} ({weatherTempC}°C) ·{" "}
            <span className="text-rose-400 font-normal">
              -{weatherTempC > 30 || weatherCondition.includes("Rain") ? "8" : "3"}% range impact
            </span>
          </p>
        </div>
      </div>

      {/* Alternative rejection logs */}
      {rejectedStations.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2.5">
            BYPASSED NETWORK NODES
          </p>
          <div className="space-y-2">
            {rejectedStations.map((st) => (
              <div key={st.id} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                <span className="flex-shrink-0 w-3.5 h-3.5 rounded bg-zinc-800 border border-white/5 flex items-center justify-center text-[9px] text-zinc-400 mt-0.5 font-bold font-mono">
                  ✕
                </span>
                <div className="flex-1">
                  <span className="text-zinc-400 font-medium">
                    {st.name.split(" - ")[1] || st.name}
                  </span>
                  <p className="text-[10px] text-zinc-500 font-mono">{st.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default React.memo(AiRecommendation);
