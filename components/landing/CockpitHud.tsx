"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function CockpitHud() {
  const [t, setT] = useState(0);
  const [activePod, setActivePod] = useState<"station" | "battery" | "route" | "prediction" | null>(
    null
  );
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    setRotateX((yc - y) / 16); // max tilt ~10 degrees
    setRotateY((x - xc) / 16);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const renderPodDetails = () => {
    const specs = {
      station: {
        title: "CHARGING STATION",
        stats: [
          { l: "Expected Speed", v: "350 kW" },
          { l: "Connector Slots", v: "8 / 10 active" },
          { l: "Current Price", v: "$0.32/kWh" },
          { l: "Amenities Rating", v: "9.4 / 10" },
        ],
        priority: "Recommend Electrify America Stop 2 based on short queue and 98% uptime.",
      },
      battery: {
        title: "BATTERY TELEMETRY",
        stats: [
          { l: "Current Charge", v: "68% SOC" },
          { l: "Degradation", v: "3.4% SoH" },
          { l: "Cell Temp", v: "28.4°C" },
          { l: "Avg Draw", v: "84 kW" },
        ],
        priority: "Optimize charge rate segment to protect cell health between 20% and 80%.",
      },
      route: {
        title: "ROUTE INTELLIGENCE",
        stats: [
          { l: "Arrival SOC", v: "16% Expected" },
          { l: "Target Range", v: "242 miles" },
          { l: "Consumption", v: "310 Wh/mi" },
          { l: "Traffic Delay", v: "+4 mins" },
        ],
        priority: "Schedule charging stop at mile 142 ahead of elevation increase.",
      },
      prediction: {
        title: "AI PREDICT ENGINE",
        stats: [
          { l: "Queue Duration", v: "2 mins wait" },
          { l: "Failure Risk", v: "<0.4% Prob" },
          { l: "Grid Load", v: "Nominal" },
          { l: "Confidence", v: "98.4% Acc" },
        ],
        priority: "Flagging connector port 4 as high failure risk; locking port 3 instead.",
      },
    };

    if (!activePod) return null;
    const details = specs[activePod];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute inset-0 bg-[#05070B]/95 z-30 flex flex-col justify-between p-6 rounded-[28px]"
      >
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-[12px] font-[700] tracking-widest text-orange uppercase">
              {details.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePod(null);
              }}
              className="text-ink-350 hover:text-white text-[12px] tracking-wider font-[600]"
            >
              CLOSE ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {details.stats.map((s) => (
              <div key={s.l} className="border-l border-orange/20 pl-3">
                <div className="text-[10px] text-ink-350 font-[600] uppercase tracking-wider">
                  {s.l}
                </div>
                <div className="text-[16px] font-[700] text-white mt-1 font-mono">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="text-[10.5px] text-ink-350 font-[600] uppercase tracking-wider">
            Active Control Priority
          </div>
          <p className="text-[13px] text-[#c6d2e2] mt-1.5 leading-relaxed">{details.priority}</p>
        </div>
      </motion.div>
    );
  };

  // SVG Gauge calculations
  const radius = 64;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (68 / 100) * circumference; // 68% battery SOC

  return (
    <div className="relative w-full max-w-[520px] mx-auto select-none">
      {/* ambient background glow */}
      <div className="absolute -inset-10 bg-[radial-gradient(480px_320px_at_50%_50%,rgba(255,122,0,0.06),transparent_70%)] pointer-events-none" />

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          perspective: 1000,
          rotateX,
          rotateY,
        }}
        className="relative glass rounded-[28px] shadow-lift overflow-hidden noise transition-all duration-150"
      >
        <div className="absolute inset-0 grid-faint opacity-[0.7]" />

        {/* active details panel */}
        <AnimatePresence>{renderPodDetails()}</AnimatePresence>

        {/* top status bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.08] bg-[#0A1018]/60">
          <div className="text-[11px] tracking-widest font-[600] text-ink-350 uppercase">
            EVIQ HUD • Route Sync
          </div>
          <div className="flex items-center gap-2">
            <span className="w-[7px] h-[7px] rounded-full bg-orange shadow-[0_0_10px_rgba(255,122,0,0.6)] animate-pulse" />
            <span className="text-[11px] font-[550] text-[#A0AEC0]">AI ACTIVE</span>
          </div>
        </div>

        {/* HUD Display Container */}
        <div className="relative px-6 pt-7 pb-6 select-none bg-[#05070B]/40">
          <svg
            viewBox="0 0 460 380"
            className="w-full h-auto"
            role="img"
            aria-label="EVIQ AI Charging Intelligence Engine"
          >
            <defs>
              <linearGradient id="oStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FFA640" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="g" />
                <feMerge>
                  <feMergeNode in="g" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Inner Dashboard HUD Rings */}
            <circle
              cx="230"
              cy="180"
              r="100"
              fill="none"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="1"
            />
            <circle
              cx="230"
              cy="180"
              r="120"
              fill="none"
              stroke="rgba(255,255,255,0.015)"
              strokeWidth="1"
              strokeDasharray="3 8"
            />

            {/* Orange Navigation route path */}
            <path
              d="M70 280 C 130 200, 330 320, 390 220"
              fill="none"
              stroke="rgba(255, 122, 0, 0.08)"
              strokeWidth="4"
            />
            <path
              d="M70 280 C 130 200, 330 320, 390 220"
              fill="none"
              stroke="url(#oStroke)"
              strokeWidth="2"
              strokeDasharray="4 8"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="120;0"
                dur="4.5s"
                repeatCount="indefinite"
              />
            </path>

            {/* Animated data flow dots */}
            {[0, 1, 2].map((i) => {
              const speedVal = 0.45;
              const delay = i * 0.33;
              return (
                <circle key={i} r="2.5" fill="#FF7A00" opacity="0.8" filter="url(#glow)">
                  <animateMotion
                    path="M70 280 C 130 200, 330 320, 390 220"
                    dur="3s"
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                  />
                </circle>
              );
            })}

            {/* Central Battery SoC Gauge */}
            <g transform="translate(230, 180)">
              {/* background gauge */}
              <circle
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth={strokeWidth}
              />
              {/* active gauge fill */}
              <circle
                r={radius}
                fill="none"
                stroke="url(#oStroke)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90)"
                filter="url(#glow)"
              />

              {/* Central Text */}
              <text
                textAnchor="middle"
                y="-10"
                fill="#ffffff"
                fontSize="28"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                letterSpacing="-0.03em"
              >
                68%
              </text>
              <text
                textAnchor="middle"
                y="18"
                fill="#A0AEC0"
                fontSize="9.5"
                fontFamily="Inter,system-ui"
                fontWeight="600"
                letterSpacing="0.1em"
              >
                BATTERY SOC
              </text>
              <text
                textAnchor="middle"
                y="34"
                fill="#FF7A00"
                fontSize="9"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                letterSpacing="0.05em"
              >
                {(242 + Math.sin(t) * 2).toFixed(0)} MI RANGE
              </text>
            </g>

            {/* Interactive Pods - Left 1: Charger */}
            <g cursor="pointer" onClick={() => setActivePod("station")}>
              <rect
                x="34"
                y="60"
                width="114"
                height="62"
                rx="14"
                fill="#101820"
                stroke="rgba(255,255,255,0.06)"
                className="hover:stroke-orange/40 transition-colors"
              />
              <text
                x="50"
                y="82"
                fontSize="9"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#A0AEC0"
                letterSpacing="0.08em"
              >
                CHARGER
              </text>
              <text
                x="50"
                y="103"
                fontSize="16"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#ffffff"
                letterSpacing="-0.02em"
              >
                {(312 + Math.sin(t * 1.4) * 8).toFixed(0)}{" "}
                <tspan fontSize="11" fill="#A0AEC0">
                  kW
                </tspan>
              </text>
              <circle cx="128" cy="78" r="3.5" fill="#FF7A00" filter="url(#glow)" />
            </g>

            {/* Interactive Pods - Right 1: Battery Telemetry */}
            <g cursor="pointer" onClick={() => setActivePod("battery")}>
              <rect
                x="312"
                y="60"
                width="114"
                height="62"
                rx="14"
                fill="#101820"
                stroke="rgba(255,255,255,0.06)"
                className="hover:stroke-orange/40 transition-colors"
              />
              <text
                x="328"
                y="82"
                fontSize="9"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#A0AEC0"
                letterSpacing="0.08em"
              >
                BATTERY
              </text>
              <text
                x="328"
                y="103"
                fontSize="16"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#ffffff"
                letterSpacing="-0.02em"
              >
                94.6%{" "}
                <tspan fontSize="11" fill="#A0AEC0">
                  SoH
                </tspan>
              </text>
            </g>

            {/* Interactive Pods - Left 2: Route */}
            <g cursor="pointer" onClick={() => setActivePod("route")}>
              <rect
                x="34"
                y="262"
                width="114"
                height="62"
                rx="14"
                fill="#101820"
                stroke="rgba(255,255,255,0.06)"
                className="hover:stroke-orange/40 transition-colors"
              />
              <text
                x="50"
                y="284"
                fontSize="9"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#A0AEC0"
                letterSpacing="0.08em"
              >
                ROUTE
              </text>
              <text
                x="50"
                y="305"
                fontSize="15"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#ffffff"
              >
                Optimized
              </text>
              <circle cx="128" cy="280" r="3" fill="#FF7A00" opacity="0.9" />
            </g>

            {/* Interactive Pods - Right 2: AI Predict */}
            <g cursor="pointer" onClick={() => setActivePod("prediction")}>
              <rect
                x="312"
                y="262"
                width="114"
                height="62"
                rx="14"
                fill="#101820"
                stroke="rgba(255,255,255,0.06)"
                className="hover:stroke-orange/40 transition-colors"
              />
              <text
                x="328"
                y="284"
                fontSize="9"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#A0AEC0"
                letterSpacing="0.08em"
              >
                AI PREDICT
              </text>
              <text
                x="328"
                y="305"
                fontSize="15"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#ffffff"
              >
                0m queue
              </text>
            </g>

            {/* AI Core Sensor Nodes */}
            {[
              [148, 180],
              [312, 180],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="3" fill="#FF7A00" filter="url(#glow)" />
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="none"
                  stroke="#FF7A00"
                  strokeWidth="0.8"
                  opacity="0.3"
                >
                  <animate
                    attributeName="r"
                    values="5;10;5"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.5}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.4;0;0.4"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.5}s`}
                  />
                </circle>
              </g>
            ))}
          </svg>
        </div>

        {/* top status bar */}
        <div className="px-5 pb-4 pt-2 border-t border-white/[0.08] bg-[#0A1018]/50 flex items-center justify-between text-[12px] text-[#A0AEC0]">
          <div>
            Uptime <span className="text-white font-[600]">99.2%</span>
          </div>
          <div>
            Cost savings{" "}
            <span className="text-[#FF7A00] font-[650]">
              ${(18.4 + Math.sin(t) * 1.2).toFixed(2)}/hr
            </span>
          </div>
          <div>
            Latency <span className="text-white font-[600]">42ms</span>
          </div>
        </div>
      </motion.div>

      {/* floating signals */}
      <motion.div
        className="absolute -right-3 top-14 text-[10px] font-[600] tracking-wider text-orange bg-[#101820]/90 backdrop-blur px-2.5 py-1 rounded-full shadow-soft border border-orange/20 select-none pointer-events-none"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
      >
        ROUTING ACTIVE
      </motion.div>
      <motion.div
        className="absolute -left-4 bottom-24 text-[10px] font-[600] tracking-wider text-white bg-[#101820]/90 backdrop-blur px-2.5 py-1 rounded-full shadow-soft border border-white/5 select-none pointer-events-none"
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 3.9, ease: "easeInOut", delay: 0.6 }}
      >
        CAN-BUS SYNCED
      </motion.div>
    </div>
  );
}
