"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function BuildingVisual() {
  const [t, setT] = useState(0);
  const [activePod, setActivePod] = useState<"station" | "battery" | "route" | "prediction" | null>(null);
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
        className="absolute inset-0 bg-[#02050A]/95 z-30 flex flex-col justify-between p-6"
      >
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-[12px] font-[700] tracking-widest text-cyan uppercase">
              {details.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePod(null);
              }}
              className="text-ink-350 hover:text-white text-[12px] tracking-wider font-[600] snap-cursor"
            >
              CLOSE ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {details.stats.map((s) => (
              <div key={s.l} className="border-l border-cyan/20 pl-3">
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

  return (
    <div className="relative w-full max-w-[520px] mx-auto">
      {/* ambient background glow */}
      <div className="absolute -inset-10 bg-[radial-gradient(480px_320px_at_60%_40%,rgba(79,209,255,0.09),transparent_70%)] pointer-events-none" />

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
        <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-3 border-b border-black/[0.07]">
          <div className="text-[11px] tracking-widest font-[600] text-ink-350 uppercase">
            Live Ops • EV Session
          </div>
          <div className="flex items-center gap-2">
            <span className="w-[7px] h-[7px] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
            <span className="text-[11px] font-[550] text-ink-700">AI Active</span>
          </div>
        </div>

        {/* charging hub canvas */}
        <div className="relative px-6 pt-7 pb-6 select-none">
          <svg
            viewBox="0 0 460 380"
            className="w-full h-auto"
            role="img"
            aria-label="EVIQ AI Charging Intelligence Engine"
          >
            <defs>
              <linearGradient id="bStroke" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4FD1FF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#1e7ca3" stopOpacity="0.35" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.4" result="g" />
                <feMerge>
                  <feMergeNode in="g" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="floorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4FD1FF" stopOpacity="0" />
                <stop offset="50%" stopColor="#4FD1FF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#4FD1FF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* connection spine */}
            <g opacity="0.95">
              <path
                d="M115 72 C165 88 295 88 345 72"
                fill="none"
                stroke="url(#bStroke)"
                strokeWidth="1.2"
                strokeDasharray="4 7"
              />
            </g>

            {/* Central Display Hub */}
            <g>
              <ellipse cx="230" cy="326" rx="96" ry="10" fill="#061224" opacity="0.07" />
              <rect
                x="178"
                y="96"
                width="104"
                height="220"
                rx="10"
                fill="#ffffff"
                stroke="#d7dde6"
              />
              <rect
                x="178"
                y="96"
                width="104"
                height="220"
                rx="10"
                fill="none"
                stroke="url(#bStroke)"
                strokeWidth="1.25"
                opacity=".9"
                filter="url(#glow)"
              />

              {/* windows 7x4 */}
              {Array.from({ length: 7 }).map((_, r) =>
                Array.from({ length: 4 }).map((__, c) => {
                  const x = 192 + c * 22;
                  const y = 113 + r * 28;
                  const pulse = Math.sin(t * 1.8 + r * 0.7 + c * 0.4) > 0.55;
                  return (
                    <rect
                      key={r + "-" + c}
                      x={x}
                      y={y}
                      width="14"
                      height="16"
                      rx="3"
                      fill={pulse ? "#4FD1FF" : "#e8eef5"}
                      opacity={pulse ? 0.98 : 0.95}
                      style={{ transition: "fill .28s ease" }}
                    />
                  );
                })
              )}

              {/* active floor sweep */}
              <rect
                x="179"
                y={118 + (Math.floor(t * 0.9) % 7) * 28}
                width="102"
                height="20"
                rx="6"
                fill="url(#floorGlow)"
                opacity="0.22"
              />

              {/* roof systems */}
              <rect x="196" y="76" width="68" height="20" rx="5" fill="#f3f6fa" stroke="#d3dbe6" />
              {[0, 1, 2].map((i) => (
                <rect
                  key={i}
                  x={202 + i * 22}
                  y="81"
                  width="16"
                  height="10"
                  rx="2"
                  fill={Math.sin(t * 2 + i) > -0.3 ? "#bff1ff" : "#cfe8f7"}
                  opacity="0.98"
                />
              ))}
            </g>

            {/* telemetry flowing */}
            {[0, 1, 2].map((i) => {
              const prog = (t * 0.55 + i * 0.34) % 1;
              const x = 118 + prog * 224;
              const y = 72 + Math.sin(prog * Math.PI) * 14 - 6;
              return (
                <circle key={i} cx={x} cy={y} r="2.5" fill="#4FD1FF" opacity="0.95">
                  <animate
                    attributeName="r"
                    values="2.2;3.1;2.2"
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}

            {/* left pod: Charger */}
            <g cursor="pointer" onClick={() => setActivePod("station")} className="snap-cursor">
              <rect
                x="44"
                y="166"
                width="102"
                height="74"
                rx="14"
                fill="#ffffff"
                stroke="#e2e8f0"
                className="hover:stroke-cyan transition-colors"
              />
              <text
                x="62"
                y="193"
                fontSize="10"
                fontFamily="Inter,system-ui"
                fontWeight="600"
                fill="#8893a5"
                letterSpacing="0.08em"
              >
                CHARGER
              </text>
              <text
                x="62"
                y="217"
                fontSize="20"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#061224"
                letterSpacing="-0.02em"
              >
                {(312 + Math.sin(t * 1.4) * 8).toFixed(0)}
                <tspan fontSize="12" fill="#6b7687">
                  {" "}
                  kW
                </tspan>
              </text>
              <circle cx="122" cy="188" r="4" fill="#22c55e">
                <animate
                  attributeName="opacity"
                  values="1;0.45;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>

            {/* right pod: Battery */}
            <g cursor="pointer" onClick={() => setActivePod("battery")} className="snap-cursor">
              <rect
                x="314"
                y="166"
                width="102"
                height="74"
                rx="14"
                fill="#ffffff"
                stroke="#e2e8f0"
                className="hover:stroke-cyan transition-colors"
              />
              <text
                x="332"
                y="193"
                fontSize="10"
                fontFamily="Inter,system-ui"
                fontWeight="600"
                fill="#8893a5"
                letterSpacing="0.08em"
              >
                BATTERY
              </text>
              <text
                x="332"
                y="217"
                fontSize="20"
                fontFamily="Inter,system-ui"
                fontWeight="700"
                fill="#061224"
                letterSpacing="-0.02em"
              >
                {68 + Math.round(Math.sin(t) * 2)}
                <tspan fontSize="12" fill="#6b7687">
                  %
                </tspan>
              </text>
              <rect x="332" y="222" width="66" height="6" rx="3" fill="#e6edf5" />
              <rect
                x="332"
                y="222"
                width={Math.max(10, 44 + Math.sin(t) * 4)}
                height="6"
                rx="3"
                fill="#4FD1FF"
              />
            </g>

            {/* Route bottom left */}
            <g cursor="pointer" onClick={() => setActivePod("route")} className="snap-cursor">
              <rect
                x="44"
                y="252"
                width="102"
                height="58"
                rx="13"
                fill="#fbfcfe"
                stroke="#e7ecf3"
                className="hover:stroke-cyan transition-colors"
              />
              <text
                x="60"
                y="275"
                fontSize="10"
                fontFamily="Inter,system-ui"
                fontWeight="600"
                fill="#8893a5"
                letterSpacing="0.06em"
              >
                ROUTE
              </text>
              <text
                x="60"
                y="296"
                fontSize="15"
                fontFamily="Inter,system-ui"
                fontWeight="650"
                fill="#061224"
              >
                Optimized
              </text>
              <circle cx="122" cy="272" r="3" fill="#4FD1FF" opacity="0.9">
                <animate
                  attributeName="r"
                  values="2.6;3.8;2.6"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>

            {/* AI bottom right */}
            <g cursor="pointer" onClick={() => setActivePod("prediction")} className="snap-cursor">
              <rect
                x="314"
                y="252"
                width="102"
                height="58"
                rx="13"
                fill="#fbfcfe"
                stroke="#e7ecf3"
                className="hover:stroke-cyan transition-colors"
              />
              <text
                x="330"
                y="275"
                fontSize="10"
                fontFamily="Inter,system-ui"
                fontWeight="600"
                fill="#8893a5"
                letterSpacing="0.06em"
              >
                AI PREDICT
              </text>
              <text
                x="330"
                y="296"
                fontSize="15"
                fontFamily="Inter,system-ui"
                fontWeight="650"
                fill="#061224"
              >
                2m queue
              </text>
            </g>

            {/* edge sensors */}
            {[
              [158, 210],
              [302, 210],
              [158, 264],
              [302, 264],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="3.4" fill="#4FD1FF" opacity=".95" />
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="none"
                  stroke="#4FD1FF"
                  strokeWidth="1"
                  opacity=".28"
                >
                  <animate
                    attributeName="r"
                    values="6;11;6"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin={`${i * 0.35}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.32;0;0.32"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin={`${i * 0.35}s`}
                  />
                </circle>
              </g>
            ))}

            {/* AI core */}
            <g>
              <circle cx="230" cy="60" r="15" fill="#061224" />
              <circle
                cx="230"
                cy="60"
                r="15"
                fill="none"
                stroke="#4FD1FF"
                strokeWidth="1.4"
                opacity=".9"
              />
              <circle cx="230" cy="60" r="4.8" fill="#4FD1FF">
                <animate
                  attributeName="opacity"
                  values="1;0.46;1"
                  dur="1.55s"
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x="230"
                y="36"
                textAnchor="middle"
                fontSize="9.5"
                fontFamily="Inter,system-ui"
                letterSpacing="0.16em"
                fill="#6b7687"
                fontWeight="600"
              >
                AI CORE
              </text>
            </g>
          </svg>
        </div>

        {/* bottom data ticker */}
        <div className="px-5 pb-4 pt-2 border-t border-black/[0.06] flex items-center justify-between text-[12px]">
          <div className="text-ink-500">
            Reliability <span className="text-navy font-[600]">99.2%</span>
          </div>
          <div className="text-ink-500">
            Cost savings{" "}
            <span className="text-emerald-600 font-[650]">
              ${(18.4 + Math.sin(t) * 1.2).toFixed(2)}/hr
            </span>
          </div>
          <div className="text-ink-500">
            Latency <span className="text-navy font-[600]">42ms</span>
          </div>
        </div>
      </motion.div>

      {/* floating signals */}
      <motion.div
        className="absolute -right-3 top-14 text-[10px] font-[600] tracking-wider text-cyan bg-white/85 backdrop-blur px-2.5 py-1 rounded-full shadow-soft border border-cyan/20 select-none pointer-events-none"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
      >
        ROUTING
      </motion.div>
      <motion.div
        className="absolute -left-4 bottom-24 text-[10px] font-[600] tracking-wider text-navy bg-white/90 backdrop-blur px-2.5 py-1 rounded-full shadow-soft border border-black/5 select-none pointer-events-none"
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 3.9, ease: "easeInOut", delay: 0.6 }}
      >
        AI ASSISTANT ACTIVE
      </motion.div>
    </div>
  );
}
