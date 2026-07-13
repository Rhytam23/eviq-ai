"use client";
import { Container } from "@/components/ui/Container";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const nodes = [
  {
    key: "Vehicle",
    title: "VEHICLE CAN-BUS GATEWAY",
    subtitle: "High-Frequency OBD-II Streamer",
    protocols: [
      "Telemetry client reading CAN-bus profiles",
      "Cell voltages, temperatures, and odometer feeds",
      "Outbound WebSockets / MQTT telemetry connection",
      "Secure JWT device verification authentication",
    ],
    desc: "Collects real-time battery voltage, thermal rates, and speed indexes from vehicle CAN-bus at 1Hz frequency, securely pushing them to EVIQ ingest.",
  },
  {
    key: "Stream",
    title: "TELEMETRY STREAM BROKER",
    subtitle: "Kafka Cluster + Time-Series Database",
    protocols: [
      "Apache Kafka telemetry event ingestion partitioning",
      "TimescaleDB daily partitioned hyper-tables",
      "AES-256 time-series database encryption",
      "Auto-compression on historical session inputs",
    ],
    desc: "Ingests raw vehicle data streams, checks schemas, and buffers events into partitioned hyper-tables to calibrate battery models.",
  },
  {
    key: "Models",
    title: "BATTERY AI PREDICTORS",
    subtitle: "Temporal Fusion Transformer Models",
    protocols: [
      "PyTorch deep learning model runner",
      "Historical battery temperature & wear logs",
      "Topographic elevation and traffic speed variables",
      "Auto-calibration of dynamic range algorithms",
    ],
    desc: "Calculates Dynamic Remaining Range and State of Charge predictions, estimating battery cell behaviors under weather stresses.",
  },
  {
    key: "Optimizer",
    title: "MPC RECOMMENDATION SOLVER",
    subtitle: "Model Predictive Control Decision Math",
    protocols: [
      "Linear solver optimization functions",
      "Dynamic charging network pricing tariff tables",
      "Uptime metrics database for public chargers",
      "Queue forecasts at charging station hubs",
    ],
    desc: "Determines the cost-optimal stop, evaluating charge speed, reliability, wait queues, and tariffs in less than 42ms.",
  },
  {
    key: "Actuate",
    title: "SMART RESERVATION SCHEDULER",
    subtitle: "Cross-Network Reservation Gateway",
    protocols: [
      "Secure API connector blocks for EA, Tesla, EVgo",
      "Automated 15-minute slot lock scheduling",
      "Virtual queue allocation and waitlist sync",
      "Cryptographically signed session credentials",
    ],
    desc: "Locks reservation slots directly on charger network APIs and coordinates booking modifications in case of reroutes.",
  },
  {
    key: "Observe",
    title: "OBSERVER & ENTERPRISE PORTALS",
    subtitle: "Real-Time HUD & Fleet Admin Panels",
    protocols: [
      "Next.js consumer mobile and center displays",
      "Fleet SaaS scheduling management controllers",
      "Operator queue dashboards and heatmaps",
      "Automatic session reconciliation and ledger logs",
    ],
    desc: "Pushes routing syncs directly to vehicle heads-up displays, displaying active sessions, queues, and cost attributions.",
  },
];

export default function Architecture() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const activeKey = hoveredNode || selectedNode;
  const activeDetails = nodes.find((n) => n.key === activeKey);

  return (
    <section id="architecture" className="py-24 md:py-30 bg-[#05070B] select-none">
      <Container>
        <div className="max-w-[700px] mx-auto text-center">
          <p className="text-[12px] font-[650] tracking-widest text-orange uppercase">
            Architecture
          </p>
          <h2 className="text-display mt-4 text-[34px] md:text-[46px] text-white font-bold leading-tight">
            Enterprise-grade EV intelligence.
          </h2>
          <p className="mt-4 text-[17px] text-[#A0AEC0]">
            Vehicle CAN-bus Ingestion, Time-Series Lake, Predictive Modeling, Smart Reservations.
          </p>
        </div>

        <div className="mt-14 rounded-[28px] border border-white/[0.08] bg-[#0A1018] p-6 md:p-10 shadow-soft relative overflow-hidden">
          <div className="text-center text-[12.5px] text-ink-500 mb-6 lg:hidden">
            Tap nodes below to view security protocols and latency metrics.
          </div>

          <svg
            viewBox="0 0 1040 320"
            className="w-full min-w-[880px] relative z-10"
            aria-label="EVIQ AI architecture"
          >
            <defs>
              <linearGradient id="ag" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#FF7A00" />
                <stop offset="100%" stopColor="#FFA640" />
              </linearGradient>
              <filter id="aglow">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* background connection line */}
            <path
              d="M60 162 H980"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="2"
              opacity={activeKey ? 0.35 : 1}
              className="transition-opacity duration-300"
            />
            <path
              d="M60 162 H980"
              fill="none"
              stroke="url(#ag)"
              strokeWidth="2"
              strokeDasharray="6 10"
              opacity={activeKey ? 0.35 : 1}
              className="transition-opacity duration-300"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="120"
                to="0"
                dur="3.6s"
                repeatCount="indefinite"
              />
            </path>

            {/* nodes */}
            {[
              { key: "Vehicle", x: 110, t1: "Vehicle", t2: "CAN-bus • BMS", sub: "1Hz stream" },
              { key: "Stream", x: 290, t1: "Stream", t2: "Kafka • TSDB", sub: "Kafka Buffer" },
              { key: "Models", x: 470, t1: "Models", t2: "Battery AI", sub: "TFT range" },
              { key: "Optimizer", x: 650, t1: "Optimizer", t2: "Decision MPC", sub: "<42ms" },
              { key: "Actuate", x: 830, t1: "Reserve", t2: "API Booking", sub: "Slot Lock" },
              { key: "Observe", x: 970, t1: "Observe", t2: "HUD • Fleet", sub: "Real-time" },
            ].map((n) => {
              const isCurrent = activeKey === n.key;
              const isDimmed = activeKey !== null && activeKey !== n.key;

              return (
                <g
                  key={n.x}
                  cursor="pointer"
                  className="transition-opacity duration-300 snap-cursor"
                  opacity={isDimmed ? 0.35 : 1}
                  onMouseEnter={() => setHoveredNode(n.key)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(n.key === selectedNode ? null : n.key)}
                >
                  <circle
                    cx={n.x}
                    cy="162"
                    r="24"
                    fill="#05070B"
                    stroke={isCurrent ? "#FF7A00" : "rgba(255, 255, 255, 0.08)"}
                    strokeWidth={isCurrent ? 2 : 1}
                  />
                  <circle cx={n.x} cy="162" r="7" fill="#FF7A00" filter="url(#aglow)" />
                  <text
                    x={n.x}
                    y="115"
                    textAnchor="middle"
                    fontSize="11"
                    fill={isCurrent ? "#FF7A00" : "#A0AEC0"}
                    fontWeight="600"
                    fontFamily="Inter,system-ui"
                    style={{ letterSpacing: "0.08em" }}
                  >
                    {n.t1.toUpperCase()}
                  </text>
                  <text
                    x={n.x}
                    y="210"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#ffffff"
                    fontWeight="650"
                    fontFamily="Inter,system-ui"
                  >
                    {n.t2}
                  </text>
                  <text
                    x={n.x}
                    y="230"
                    textAnchor="middle"
                    fontSize="11.5"
                    fill="#A0AEC0"
                    fontFamily="Inter,system-ui"
                  >
                    {n.sub}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Collapsible drawer */}
          <AnimatePresence>
            {activeDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="mt-8 border-t border-white/[0.08] pt-6 overflow-hidden"
              >
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="md:col-span-1">
                    <span className="text-[10px] font-[750] tracking-widest text-orange uppercase bg-slate-900 px-2.5 py-1 rounded-full">
                      {activeDetails.key} SECURITY
                    </span>
                    <h3 className="font-[650] text-[19px] text-white mt-4">
                      {activeDetails.title}
                    </h3>
                    <p className="text-[12px] text-ink-500 font-semibold mt-1 uppercase tracking-wider">
                      {activeDetails.subtitle}
                    </p>
                    <p className="text-[14px] text-[#A0AEC0] mt-3 leading-relaxed">
                      {activeDetails.desc}
                    </p>
                  </div>

                  <div className="md:col-span-2 bg-[#101820] rounded-[18px] p-6 border border-white/[0.08]">
                    <div className="text-[11.5px] font-[700] text-white uppercase tracking-wider mb-3">
                      Verified Integration & Security Protocols
                    </div>
                    <ul className="space-y-2">
                      {activeDetails.protocols.map((p, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-[13.5px] text-[#A0AEC0]"
                        >
                          <span className="text-orange font-bold mt-[1px]">✓</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 border-t border-white/[0.08] pt-6 grid sm:grid-cols-3 gap-4 text-[13px] text-[#A0AEC0] text-left">
            <div>• Secured vehicle keys • TLS 1.3 encryption • RBAC</div>
            <div>• Physics-informed range twin calibration</div>
            <div>• Virtual queue slot scheduling • Explainable AI</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
