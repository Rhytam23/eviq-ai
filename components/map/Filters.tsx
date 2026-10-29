"use client";

import { CONNECTOR_TYPES, type ConnectorType } from "@/types/station";

const MIN_KW_OPTIONS = [0, 7, 22, 50, 150] as const;
const FILTERABLE = CONNECTOR_TYPES.filter((t) => t !== "Other");

export interface FilterState {
  connectors: ConnectorType[];
  minKw: number;
}

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  miles: boolean;
  onMilesChange: (miles: boolean) => void;
}

export default function Filters({ filters, onChange, miles, onMilesChange }: Props) {
  const toggle = (type: ConnectorType) =>
    onChange({
      ...filters,
      connectors: filters.connectors.includes(type)
        ? filters.connectors.filter((t) => t !== type)
        : [...filters.connectors, type],
    });

  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-label="Connector type"
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
      >
        {FILTERABLE.map((type) => {
          const on = filters.connectors.includes(type);
          return (
            <button
              key={type}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(type)}
              className={`rounded-full border px-3 py-1 text-sm ${
                on
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-ink hover:border-brand"
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-1.5 text-sm">
          <span className="text-muted">Min power</span>
          <select
            value={filters.minKw}
            onChange={(e) => onChange({ ...filters, minKw: Number(e.target.value) })}
            className="rounded-md border border-line bg-white px-2 py-1"
          >
            {MIN_KW_OPTIONS.map((kw) => (
              <option key={kw} value={kw}>
                {kw === 0 ? "Any" : `${kw} kW+`}
              </option>
            ))}
          </select>
        </label>
        <div
          role="group"
          aria-label="Distance unit"
          className="inline-flex overflow-hidden rounded-md border border-line text-sm"
        >
          {[
            { label: "km", value: false },
            { label: "mi", value: true },
          ].map((u) => (
            <button
              key={u.label}
              type="button"
              aria-pressed={miles === u.value}
              onClick={() => onMilesChange(u.value)}
              className={`px-3 py-1 ${miles === u.value ? "bg-brand text-white" : "bg-white"}`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
