"use client";

interface EnterpriseInsightsProps {
  activeChargers: number;
  offlineChargers: number;
  avgQueueMin: number;
  networkUtilPct: number;
  predictedDemandPct: number;
}

interface StatRowProps {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
  barValue?: number; // 0-100 for an inline bar
}

function StatRow({ label, value, unit, accent, barValue }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] text-white/40">{label}</span>
      <div className="flex items-center gap-2">
        {barValue !== undefined && (
          <div className="w-14 h-1 bg-white/[0.07] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${accent ? "bg-[#FF7A00]" : "bg-white/25"}`}
              style={{ width: `${barValue}%` }}
            />
          </div>
        )}
        <span
          className={`text-[12px] font-semibold font-mono tabular-nums ${accent ? "text-[#FF7A00]" : "text-white/80"}`}
        >
          {value}
          {unit && <span className="text-white/30 font-normal"> {unit}</span>}
        </span>
      </div>
    </div>
  );
}

export default function EnterpriseInsights({
  activeChargers,
  offlineChargers,
  avgQueueMin,
  networkUtilPct,
  predictedDemandPct,
}: EnterpriseInsightsProps) {
  return (
    <div className="rounded-2xl bg-[#0A1018] border border-white/[0.07] px-4 py-4">
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
        Network Insights
      </p>
      <p className="text-[11px] text-white/20 mb-3">Real-time operator telemetry</p>

      <StatRow label="Active chargers" value={activeChargers} unit="/ 20" accent={false} />
      <StatRow label="Offline chargers" value={offlineChargers} accent={offlineChargers > 2} />
      <StatRow
        label="Avg. queue"
        value={avgQueueMin}
        unit="min"
        barValue={Math.min(100, avgQueueMin * 3)}
      />
      <StatRow
        label="Network utilization"
        value={`${networkUtilPct}%`}
        barValue={networkUtilPct}
        accent={networkUtilPct > 80}
      />
      <StatRow
        label="Predicted demand +1h"
        value={`${predictedDemandPct}%`}
        barValue={predictedDemandPct}
        accent={predictedDemandPct > 85}
      />
    </div>
  );
}
