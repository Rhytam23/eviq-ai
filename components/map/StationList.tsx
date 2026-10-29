import StatusBadge from "@/components/StatusBadge";
import { formatDistance } from "@/lib/format";
import { statusHeadline } from "@/lib/statusMeta";
import type { Station } from "@/types/station";

interface Props {
  stations: Station[];
  selectedId: string | null;
  miles: boolean;
  onSelect: (id: string) => void;
}

function connectorSummary(station: Station): string {
  const types = [...new Set(station.connectors.map((c) => c.type))];
  const power = station.maxKw ? `up to ${Math.round(station.maxKw)} kW` : "power unknown";
  return `${types.length ? types.join(", ") : "Connectors unknown"} · ${power}`;
}

export default function StationList({ stations, selectedId, miles, onSelect }: Props) {
  return (
    <ul className="divide-y divide-line">
      {stations.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => onSelect(s.id)}
            aria-current={s.id === selectedId}
            className={`block w-full px-4 py-3 text-left hover:bg-paper focus-visible:bg-paper ${
              s.id === selectedId ? "bg-paper" : ""
            }`}
          >
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0 font-medium leading-snug">{s.name}</span>
              <span className="shrink-0 text-sm tabular-nums text-muted">
                {formatDistance(s.distanceKm, miles)}
              </span>
            </span>
            <span className="mt-0.5 block truncate text-sm text-muted">{connectorSummary(s)}</span>
            <span className="mt-2 block">
              <StatusBadge status={s.reliability} text={statusHeadline(s)} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
