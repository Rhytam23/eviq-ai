"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ReservationStatus = "NONE" | "SEARCHING" | "CONFIRMED" | "ACTIVE" | "COMPLETED";

interface ReservationPanelProps {
  status: ReservationStatus;
  stationName: string;
  portNumber: number;
  powerKw: number;
  arrivalSoc: number;
  estimatedCost: number;
  estimatedChargeTime: number;
  timeSaved: number;
  costSaved: number;
  onStatusChange: (status: ReservationStatus) => void;
}

function ReservationPanel({
  status,
  stationName,
  portNumber,
  powerKw,
  arrivalSoc,
  estimatedCost,
  estimatedChargeTime,
  timeSaved,
  costSaved,
  onStatusChange,
}: ReservationPanelProps) {
  const shortName = stationName.split(" - ")[1] || stationName;

  // Countdown timer for Reservation (15 mins)
  const [lockSeconds, setLockSeconds] = useState(15 * 60);

  // Live charging simulation states
  const [currentSoc, setCurrentSoc] = useState(arrivalSoc);
  const [kwhDelivered, setKwhDelivered] = useState(0);
  const [accumulatedCost, setAccumulatedCost] = useState(0);
  const [currentPower, setCurrentPower] = useState(powerKw);
  const [chargingMinutesElapsed, setChargingMinutesElapsed] = useState(0);
  const [powerHistory, setPowerHistory] = useState<number[]>([]);

  // 1. Simulate API searching transition
  useEffect(() => {
    if (status === "SEARCHING") {
      const timer = setTimeout(() => {
        onStatusChange("CONFIRMED");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, onStatusChange]);

  // 2. Countdown lock timer for CONFIRMED state
  useEffect(() => {
    if (status !== "CONFIRMED") {
      setLockSeconds(15 * 60);
      return;
    }
    const interval = setInterval(() => {
      setLockSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          onStatusChange("NONE"); // Expired
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, onStatusChange]);

  // 3. Charging simulation in ACTIVE state
  useEffect(() => {
    if (status !== "ACTIVE") {
      setCurrentSoc(arrivalSoc);
      setKwhDelivered(0);
      setAccumulatedCost(0);
      setChargingMinutesElapsed(0);
      setPowerHistory([powerKw]);
      return;
    }

    const interval = setInterval(() => {
      setCurrentSoc((prevSoc) => {
        if (prevSoc >= 80) {
          clearInterval(interval);
          onStatusChange("COMPLETED");
          return 80;
        }

        // Charging speed curve simulation (NMC/LFP chemistry style: slows down at higher SoC)
        let speedFactor = 1.0;
        if (prevSoc > 70) speedFactor = 0.4;
        else if (prevSoc > 50) speedFactor = 0.7;
        else if (prevSoc > 30) speedFactor = 0.9;

        const livePower = Math.round(powerKw * speedFactor);
        setCurrentPower(livePower);
        setPowerHistory((prev) => [...prev, livePower].slice(-15));

        // Standard 75kWh battery capacity assumption
        const batteryCapacity = 75;
        const incrementalKwh = livePower * (1.5 / 60); // Simulate rapid time increment (each tick represents 1.5 mins)

        setKwhDelivered((prevKwh) => {
          const nextKwh = prevKwh + incrementalKwh;
          // compute cost
          const rate = estimatedCost / (batteryCapacity * (0.8 - arrivalSoc / 100));
          setAccumulatedCost(nextKwh * (rate > 0 ? rate : 0.35));
          return nextKwh;
        });

        setChargingMinutesElapsed((prev) => prev + 1.5);

        return prevSoc + 1;
      });
    }, 8500);

    return () => clearInterval(interval);
  }, [status, arrivalSoc, powerKw, estimatedCost, onStatusChange]);

  const lockMins = Math.floor(lockSeconds / 60);
  const lockSecs = lockSeconds % 60;

  return (
    <div className="rounded-2xl bg-zinc-900 border border-white/[0.06] overflow-hidden text-left">
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.05] bg-zinc-950/20">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          TRANSACTION CENTER
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* NONE State */}
        {status === "NONE" && (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 py-6 text-center"
          >
            <p className="text-xs text-zinc-400 mb-2 leading-relaxed">
              Book a guaranteed port lock at{" "}
              <span className="text-white font-medium">{shortName}</span> to bypass grid congestion.
            </p>
            <p className="text-[10px] text-zinc-500 mb-5 font-mono">
              Telemetry locks hold the slot for 15 minutes.
            </p>
            <button
              onClick={() => onStatusChange("SEARCHING")}
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-zinc-950 text-xs font-bold hover:bg-cyan-300 active:scale-[0.98] transition-all"
            >
              Initialize Port Lock
            </button>
          </motion.div>
        )}

        {/* SEARCHING State */}
        {status === "SEARCHING" && (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 py-8 text-center flex flex-col items-center justify-center"
          >
            <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-xs text-white font-mono uppercase tracking-wider">
              Securing Port Lease...
            </p>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">
              Synchronizing smart contract with {shortName}
            </p>
          </motion.div>
        )}

        {/* CONFIRMED State */}
        {status === "CONFIRMED" && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 py-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span className="text-xs text-cyan-400 font-semibold font-mono">
                  Port {portNumber} Reserved
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Expires {lockMins}:{String(lockSecs).padStart(2, "0")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-white/[0.03]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Station</p>
                <p className="font-semibold text-white truncate mt-0.5">{shortName}</p>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-white/[0.03]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Connector Type</p>
                <p className="font-semibold text-white mt-0.5">NACS (Port {portNumber})</p>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-white/[0.03]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Est. Invoice</p>
                <p className="font-semibold text-cyan-400 mt-0.5">${estimatedCost.toFixed(2)}</p>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-white/[0.03]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Charging Est.</p>
                <p className="font-semibold text-white mt-0.5">{estimatedChargeTime} mins</p>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-3 flex justify-between items-center text-xs">
              <span className="text-emerald-400/80 font-mono">Estimated Savings</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {timeSaved} min · ${costSaved.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => onStatusChange("NONE")}
                className="flex-1 py-2 rounded-xl border border-white/10 text-zinc-400 text-xs font-semibold hover:bg-white/[0.03] transition-all"
              >
                Cancel Booking
              </button>
              <button
                onClick={() => onStatusChange("ACTIVE")}
                className="flex-1 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-150 active:scale-[0.98] transition-all"
              >
                Start Charging
              </button>
            </div>
          </motion.div>
        )}

        {/* ACTIVE (Charging) State */}
        {status === "ACTIVE" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 py-5 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
              <span className="text-xs text-cyan-400 font-bold font-mono">
                CHARGE SESSION ACTIVE
              </span>
            </div>

            {/* Charge telemetry card */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-white/[0.03]">
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-2">
                <span>Target: 80% SoC</span>
                <span className="text-white">{currentSoc}% SoC</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSoc - arrivalSoc) / (80 - arrivalSoc)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>Speed: {currentPower} kW</span>
                <span>
                  Remaining: {Math.max(0, Math.round(estimatedChargeTime - chargingMinutesElapsed))}
                  m
                </span>
              </div>
            </div>

            {/* Live Counter details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-950/40 p-3 rounded-xl border border-white/[0.02]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Energy Delivered</p>
                <p className="font-semibold text-white font-mono mt-0.5">
                  {kwhDelivered.toFixed(2)} kWh
                </p>
              </div>
              <div className="bg-zinc-950/40 p-3 rounded-xl border border-white/[0.02]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Accrued Invoice</p>
                <p className="font-semibold text-cyan-400 font-mono mt-0.5">
                  ${accumulatedCost.toFixed(2)}
                </p>
              </div>
            </div>

            {/* SVG Telemetry Sparkline */}
            <div className="bg-zinc-950/80 p-3 rounded-xl border border-white/[0.02]">
              <p className="text-[9px] font-mono text-zinc-500 uppercase mb-2">
                LIVE CHARGE POWER CURVE (kW)
              </p>
              <div className="h-16 w-full relative">
                {powerHistory.length > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="cyan-glow-panel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Glow Fill */}
                    <path
                      d={`M 0 40 ${powerHistory
                        .map((val, idx) => {
                          const x =
                            powerHistory.length > 1 ? (idx / (powerHistory.length - 1)) * 100 : 0;
                          const y = 40 - (val / 350) * 35;
                          return `L ${x} ${y}`;
                        })
                        .join(" ")} L 100 40 Z`}
                      fill="url(#cyan-glow-panel)"
                    />
                    {/* Line path */}
                    <path
                      d={powerHistory
                        .map((val, idx) => {
                          const x =
                            powerHistory.length > 1 ? (idx / (powerHistory.length - 1)) * 100 : 0;
                          const y = 40 - (val / 350) * 35;
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="1.5"
                    />
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-[9px] font-mono text-zinc-650">
                    CALIBRATING CELL TELEMETRY...
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[8px] font-mono text-zinc-650 mt-1">
                <span>0m</span>
                <span>PEAK RATE: {Math.max(...powerHistory, 0)} kW</span>
                <span>LIVE</span>
              </div>
            </div>

            <button
              onClick={() => onStatusChange("COMPLETED")}
              className="w-full py-2 rounded-xl bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 active:scale-[0.98] transition-all"
            >
              Simulate Session Complete
            </button>
          </motion.div>
        )}

        {/* COMPLETED State */}
        {status === "COMPLETED" && (
          <motion.div
            key="completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 py-5 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-emerald-400 font-bold font-mono">SESSION COMPLETE</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Vehicle successfully charged from{" "}
              <span className="text-white font-mono font-medium">{arrivalSoc}%</span> to{" "}
              <span className="text-white font-mono font-medium">80%</span> at{" "}
              <span className="text-white font-medium">{shortName}</span>.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-white/[0.02]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Total Invoice</p>
                <p className="font-semibold text-white font-mono mt-0.5">
                  ${estimatedCost.toFixed(2)}
                </p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-white/[0.02]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Energy Delivered</p>
                <p className="font-semibold text-white font-mono mt-0.5">
                  {(estimatedCost / 0.35).toFixed(1)} kWh
                </p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-white/[0.02]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Time Elapsed</p>
                <p className="font-semibold text-white font-mono mt-0.5">
                  {estimatedChargeTime} min
                </p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-white/[0.02]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Carbon Offset</p>
                <p className="font-semibold text-emerald-400 font-mono mt-0.5">
                  -{((estimatedCost / 0.35) * 0.43).toFixed(1)} kg CO₂
                </p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-white/[0.02]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Financial Savings</p>
                <p className="font-semibold text-emerald-400 font-mono mt-0.5">
                  ${costSaved.toFixed(2)}
                </p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-white/[0.02]">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Efficiency Score</p>
                <p className="font-semibold text-cyan-400 font-mono mt-0.5">9.8 / 10</p>
              </div>
            </div>

            <button
              onClick={() => onStatusChange("NONE")}
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-zinc-950 text-xs font-bold hover:bg-cyan-300 active:scale-[0.98] transition-all"
            >
              Start Next Journey
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(ReservationPanel);
