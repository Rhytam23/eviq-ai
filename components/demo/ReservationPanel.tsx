"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ReservationStatus = "NONE" | "CONFIRMED" | "ACTIVE";

interface ReservationPanelProps {
  status: ReservationStatus;
  stationName: string;
  portNumber: number;
  estimatedCost: number;
  estimatedChargeTime: number;
  timeSaved: number;
  costSaved: number;
  onReserve: () => void;
  onCancel: () => void;
  onStartSession: () => void;
}

export default function ReservationPanel({
  status,
  stationName,
  portNumber,
  estimatedCost,
  estimatedChargeTime,
  timeSaved,
  costSaved,
  onReserve,
  onCancel,
  onStartSession,
}: ReservationPanelProps) {
  const shortName = stationName.replace(/ \(Station [A-Z]\)/, "");

  // Countdown timer for the lock (15 minute window)
  const [lockSeconds, setLockSeconds] = useState(15 * 60);

  useEffect(() => {
    if (status !== "CONFIRMED") {
      setLockSeconds(15 * 60);
      return;
    }
    const interval = setInterval(() => {
      setLockSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const lockMins = Math.floor(lockSeconds / 60);
  const lockSecs = lockSeconds % 60;

  return (
    <div className="rounded-2xl bg-[#0A1018] border border-white/[0.07] overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
        <p className="text-[10px] font-mono text-white/35 uppercase tracking-widest">Reservation</p>
      </div>

      <AnimatePresence mode="wait">
        {status === "NONE" && (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 py-6 text-center"
          >
            <p className="text-[13px] text-white/50 mb-1 leading-relaxed">
              Reserve a port at <span className="text-white/75">{shortName}</span> to skip the queue.
            </p>
            <p className="text-[11px] text-white/30 mb-5">
              Your slot will be held for 15 minutes.
            </p>
            <button
              onClick={onReserve}
              aria-label="Reserve recommended port"
              className="w-full py-2.5 rounded-xl bg-[#FF7A00] text-white text-[13px] font-semibold hover:bg-[#FF8A15] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            >
              Reserve Port Now
            </button>
          </motion.div>
        )}

        {status === "CONFIRMED" && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 py-5 space-y-4"
          >
            {/* Lock status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[12px] text-emerald-400 font-semibold">Port {portNumber} Reserved</span>
              </div>
              <span className="text-[11px] font-mono text-white/40">
                Lock expires {lockMins}:{String(lockSecs).padStart(2, "0")}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">Station</p>
                <p className="text-[12px] font-semibold text-white leading-snug">{shortName}</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">Port</p>
                <p className="text-[12px] font-semibold text-white">Port {portNumber} (NACS)</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">Est. Cost</p>
                <p className="text-[12px] font-semibold text-[#FF7A00]">${estimatedCost.toFixed(2)}</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">Charge Time</p>
                <p className="text-[12px] font-semibold text-white">{estimatedChargeTime} min</p>
              </div>
            </div>

            {/* Savings summary */}
            <div className="bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl p-3 flex items-center justify-between">
              <span className="text-[12px] text-emerald-400">Savings vs alternatives</span>
              <div className="text-right">
                <span className="text-[12px] font-semibold text-emerald-400">{timeSaved} min · ${costSaved.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onCancel}
                aria-label="Cancel reservation"
                className="flex-1 py-2 rounded-xl border border-white/[0.10] text-white/50 text-[12px] font-semibold hover:bg-white/[0.05] hover:text-white/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Cancel
              </button>
              <button
                onClick={onStartSession}
                aria-label="Start charging session"
                className="flex-1 py-2 rounded-xl bg-white text-[#05070B] text-[12px] font-bold hover:bg-white/90 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Start Session
              </button>
            </div>
          </motion.div>
        )}

        {status === "ACTIVE" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 py-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
              <span className="text-[12px] text-[#FF7A00] font-semibold">Charging in Progress</span>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-4">
              <div className="flex justify-between mb-3">
                <span className="text-[11px] text-white/40 font-mono uppercase">Battery Target: 80%</span>
                <span className="text-[11px] text-white/40 font-mono">{estimatedChargeTime} min remaining</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF7A00] rounded-full" style={{ width: "68%" }} />
              </div>
              <p className="text-[11px] text-white/30 mt-2 font-mono">68% → 80% charging…</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">Running Cost</p>
                <p className="text-[12px] font-semibold text-[#FF7A00]">${(estimatedCost * 0.6).toFixed(2)}</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">Power Draw</p>
                <p className="text-[12px] font-semibold text-white">248 kW</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
