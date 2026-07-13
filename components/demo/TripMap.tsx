"use client";
import { motion } from "framer-motion";

interface Station {
  id: string;
  x: number;
  y: number;
  name: string;
  isRecommended: boolean;
  isSelected: boolean;
}

interface TripMapProps {
  corridor: "hkust" | "airport" | "central";
  trafficSeverity: "normal" | "dense" | "gridlock";
  weatherStress: "nominal" | "rain" | "heat";
  stations: Station[];
  onSelectStation: (id: string) => void;
}

// Corridor route paths in SVG coordinate space (viewBox 0 0 700 420)
const CORRIDORS = {
  hkust: {
    label: "HKUST Corridor",
    vehiclePos: { x: 90, y: 310 },
    destPos: { x: 580, y: 85 },
    routePath: "M 90 310 C 140 290 180 260 240 220 S 340 160 400 140 S 500 110 580 85",
    distance: "42 mi",
  },
  airport: {
    label: "Airport Highway",
    vehiclePos: { x: 100, y: 340 },
    destPos: { x: 620, y: 60 },
    routePath: "M 100 340 C 120 300 160 280 200 250 S 280 200 360 165 S 500 100 620 60",
    distance: "58 mi",
  },
  central: {
    label: "Central District",
    vehiclePos: { x: 80, y: 280 },
    destPos: { x: 520, y: 110 },
    routePath: "M 80 280 C 130 260 200 240 270 210 S 380 170 450 145 S 490 120 520 110",
    distance: "31 mi",
  },
};

const TRAFFIC_COLOR = {
  normal: "#FFFFFF",
  dense: "#FFA640",
  gridlock: "#EF4444",
};

// Fixed station SVG positions — independent of corridor
const STATION_POSITIONS = {
  A: { x: 190, y: 235 },
  B: { x: 370, y: 155 },
  C: { x: 510, y: 120 },
};

export default function TripMap({
  corridor,
  trafficSeverity,
  stations,
  onSelectStation,
}: TripMapProps) {
  const route = CORRIDORS[corridor];
  const routeColor = TRAFFIC_COLOR[trafficSeverity];

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#070D14] border border-white/[0.07]">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Map legend */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
          {route.label} • {route.distance}
        </span>
        <span
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            color: routeColor,
            background: `${routeColor}18`,
          }}
        >
          {trafficSeverity === "normal"
            ? "Clear"
            : trafficSeverity === "dense"
              ? "Moderate Traffic"
              : "Heavy Traffic"}
        </span>
      </div>

      <svg viewBox="0 0 700 420" className="w-full h-full" aria-label="Interactive trip map">
        {/* Road network (static background roads) */}
        <g opacity="0.12" stroke="#FFFFFF" strokeWidth="1" fill="none">
          <path d="M 0 200 Q 200 210 400 195 T 700 200" />
          <path d="M 0 280 Q 150 270 300 265 T 700 270" />
          <path d="M 100 0 Q 130 150 120 300 T 110 420" />
          <path d="M 300 0 Q 310 100 300 200 T 295 420" />
          <path d="M 500 0 Q 510 100 500 200 T 490 420" />
          <path d="M 0 120 Q 250 100 400 115 T 700 110" />
        </g>

        {/* Animated route path */}
        <motion.path
          key={corridor + trafficSeverity}
          d={route.routePath}
          fill="none"
          stroke={routeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.85}
          strokeDasharray="800"
          initial={{ strokeDashoffset: 800 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        {/* Route glow */}
        <motion.path
          key={`glow-${corridor}`}
          d={route.routePath}
          fill="none"
          stroke={routeColor}
          strokeWidth="6"
          strokeLinecap="round"
          opacity={0.12}
          strokeDasharray="800"
          initial={{ strokeDashoffset: 800 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        {/* Station markers */}
        {stations.map((st) => {
          const pos = STATION_POSITIONS[st.id as keyof typeof STATION_POSITIONS];
          if (!pos) return null;
          return (
            <g
              key={st.id}
              onClick={() => onSelectStation(st.id)}
              className="cursor-pointer"
              role="button"
              aria-label={`Select station ${st.id}: ${st.name}`}
            >
              {/* Outer ring for recommended */}
              {st.isRecommended && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={18}
                  fill="none"
                  stroke="#FF7A00"
                  strokeWidth="1.5"
                  opacity={0.4}
                  animate={{ r: [16, 22, 16], opacity: [0.4, 0.15, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              {/* Station dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={st.isSelected ? 9 : 7}
                fill={
                  st.isSelected
                    ? "#FF7A00"
                    : st.isRecommended
                      ? "rgba(255,122,0,0.4)"
                      : "rgba(255,255,255,0.15)"
                }
                stroke={st.isSelected || st.isRecommended ? "#FF7A00" : "rgba(255,255,255,0.35)"}
                strokeWidth={st.isSelected ? 2 : 1.5}
                style={{ transition: "all 0.2s ease" }}
              />
              {/* Station label */}
              <text
                x={pos.x}
                y={pos.y - 15}
                textAnchor="middle"
                fill={st.isSelected || st.isRecommended ? "#FF7A00" : "rgba(255,255,255,0.55)"}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="700"
              >
                {st.id}
              </text>
            </g>
          );
        })}

        {/* Vehicle marker */}
        <motion.g
          key={`vehicle-${corridor}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Pulsing ring */}
          <motion.circle
            cx={route.vehiclePos.x}
            cy={route.vehiclePos.y}
            r={14}
            fill="none"
            stroke="#FF7A00"
            strokeWidth="1"
            opacity={0.3}
            animate={{ r: [12, 18, 12], opacity: [0.3, 0.08, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Vehicle dot */}
          <circle cx={route.vehiclePos.x} cy={route.vehiclePos.y} r={6} fill="#FF7A00" />
          {/* "YOU" label */}
          <text
            x={route.vehiclePos.x}
            y={route.vehiclePos.y - 14}
            textAnchor="middle"
            fill="#FF7A00"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="700"
          >
            YOU
          </text>
        </motion.g>

        {/* Destination marker */}
        <g>
          <rect
            x={route.destPos.x - 10}
            y={route.destPos.y - 10}
            width={20}
            height={20}
            rx={4}
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
          />
          <text
            x={route.destPos.x}
            y={route.destPos.y + 4}
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="700"
          >
            ⬡
          </text>
          <text
            x={route.destPos.x}
            y={route.destPos.y + 22}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="9"
            fontFamily="monospace"
          >
            DEST
          </text>
        </g>
      </svg>

      {/* Station legend bottom-right */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#FF7A00]" />
          <span className="text-[9px] font-mono text-white/35 uppercase">Recommended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/20 border border-white/30" />
          <span className="text-[9px] font-mono text-white/35 uppercase">Alternative</span>
        </div>
      </div>
    </div>
  );
}
