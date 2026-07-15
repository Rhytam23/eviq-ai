"use client";
import React from "react";

interface EnterpriseInsightsProps {
  activeChargers: number;
  offlineChargers: number;
  avgQueueMin: number;
  networkUtilPct: number;
  predictedDemandPct: number;
  totalChargers: number;
}

interface StatRowProps {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
  barValue?: number; // 0-100 for inline bar
}

function StatRow({ label, value, unit, accent, barValue }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] text-zinc-555 font-medium">{label}</span>
      <div className="flex items-center gap-3">
        {barValue !== undefined && (
          <div className="w-16 h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${accent ? "bg-cyan-400" : "bg-zinc-600"}`}
              style={{ width: `${barValue}%` }}
            />
          </div>
        )}
        <span
          className={`text-[12px] font-semibold font-mono tabular-nums ${accent ? "text-cyan-400" : "text-white/80"}`}
        >
          {value}
          {unit && <span className="text-zinc-650 font-normal"> {unit}</span>}
        </span>
      </div>
    </div>
  );
}

function EnterpriseInsights({
  activeChargers,
  offlineChargers,
  avgQueueMin,
  networkUtilPct,
  predictedDemandPct,
  totalChargers,
}: EnterpriseInsightsProps) {
  // Calculate a mock operator health index
  const healthIndex = Math.max(70, Math.round(100 - offlineChargers * 5 - avgQueueMin * 0.8));

  return (
    <div className="rounded-2xl bg-zinc-900 border border-white/[0.06] px-4 py-4 text-left">
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
        FLEET OPERATOR TELEMETRY
      </p>
      <p className="text-[11px] text-zinc-600 mb-4">Enterprise grid infrastructure metrics</p>

      <div className="space-y-1">
        <StatRow label="Active Chargers" value={activeChargers} unit={`/ ${totalChargers}`} />
        <StatRow label="Offline Stations" value={offlineChargers} accent={offlineChargers > 1} />
        <StatRow
          label="Corridor Avg Wait"
          value={avgQueueMin}
          unit="min"
          barValue={Math.min(100, avgQueueMin * 2.5)}
        />
        <StatRow
          label="Network Load"
          value={`${networkUtilPct}%`}
          barValue={networkUtilPct}
          accent={networkUtilPct > 80}
        />
        <StatRow
          label="Peak Demand (+1h)"
          value={`${predictedDemandPct}%`}
          barValue={predictedDemandPct}
          accent={predictedDemandPct > 85}
        />
        <StatRow
          label="Operator Health"
          value={`${healthIndex}/100`}
          barValue={healthIndex}
          accent={healthIndex > 90}
        />
      </div>

      {/* Grid Load Visualizer (simulated mini heatmap / micro charts) */}
      <div className="mt-5 border-t border-white/[0.05] pt-4">
        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
          DIAGNOSTIC TELEMETRY LOG
        </p>
        <div className="flex items-center gap-1.5 h-6 justify-between">
          {[42, 55, 68, 85, 78, 92, 88, 70, 60, 75, 84, 91].map((val, idx) => (
            <div
              key={idx}
              className="flex-1 bg-white/[0.03] h-full rounded relative group cursor-help"
            >
              <div
                className={`absolute bottom-0 inset-x-0 rounded-b ${val > 85 ? "bg-rose-500/60" : val > 75 ? "bg-amber-400/50" : "bg-cyan-400/40"}`}
                style={{ height: `${val}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[8px] font-mono text-zinc-600 mt-1">
          <span>-60m</span>
          <span>LIVE INFRASTRUCTURE LOAD CURVE</span>
          <span>NOW</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(EnterpriseInsights);
