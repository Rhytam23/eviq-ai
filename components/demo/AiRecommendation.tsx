"use client";
import { motion } from "framer-motion";

interface AiRecommendationProps {
  stationName: string;
  stationId: string;
  confidence: number;
  reasons: string[];
  rejectedStations: { id: string; name: string; reason: string }[];
  estimatedChargeTime: number; // minutes
  estimatedCost: number; // USD
  timeSavedVsWorst: number; // minutes
}

export default function AiRecommendation({
  stationName,
  stationId,
  confidence,
  reasons,
  rejectedStations,
  estimatedChargeTime,
  estimatedCost,
  timeSavedVsWorst,
}: AiRecommendationProps) {
  const shortName = stationName.replace(/ \(Station [A-Z]\)/, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-[#0A1018] border border-white/[0.07] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
        <p className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-1">
          AI Recommendation
        </p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-white leading-snug">{shortName}</h3>
            <p className="text-[11px] text-white/40 font-mono mt-0.5">Station {stationId}</p>
          </div>
          {/* Confidence ring */}
          <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              aria-label={`Confidence: ${confidence}%`}
            >
              <circle
                cx="24"
                cy="24"
                r="19"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="3"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="19"
                fill="none"
                stroke="#FF7A00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 19}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 19 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 19 * (1 - confidence / 100),
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                transform="rotate(-90 24 24)"
              />
              <text
                x="24"
                y="28"
                textAnchor="middle"
                fill="#FF7A00"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="700"
              >
                {confidence}%
              </text>
            </svg>
            <span className="text-[9px] font-mono text-white/30 uppercase">Confidence</span>
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div className="px-5 py-4 border-b border-white/[0.05]">
        <p className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-2.5">
          Why This Station
        </p>
        <ul className="space-y-2">
          {reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 flex items-center justify-center">
                <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                  <path
                    d="M1 3L2.8 5L6 1"
                    stroke="#FF7A00"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[12px] text-white/70 leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Trip KPIs */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3 border-b border-white/[0.05]">
        <div>
          <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">
            Charge Time
          </p>
          <p className="text-[15px] font-semibold text-white">{estimatedChargeTime} min</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">
            Est. Cost
          </p>
          <p className="text-[15px] font-semibold text-[#FF7A00]">${estimatedCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">
            Time Saved
          </p>
          <p className="text-[15px] font-semibold text-emerald-400">{timeSavedVsWorst} min</p>
        </div>
      </div>

      {/* Rejected stations */}
      {rejectedStations.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">
            Alternatives Rejected
          </p>
          <div className="space-y-1.5">
            {rejectedStations.map((st) => (
              <div key={st.id} className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                    <path
                      d="M1 1L5 5M5 1L1 5"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="text-[11px] text-white/30 font-mono">{st.id}</span>
                <span className="text-[11px] text-white/30 truncate">{st.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
