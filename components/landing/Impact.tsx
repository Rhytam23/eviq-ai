"use client";
import { Container } from "@/components/ui/Container";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function Stat({
  value,
  suffix,
  label,
  sub,
}: {
  value: number;
  suffix: string;
  label: string;
  sub: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let s: number | null = null;
    const tick = (ts: number) => {
      if (s === null) s = ts;
      const p = Math.min((ts - s) / 1500, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return (
    <div ref={ref} className="py-4">
      <div className="text-[46px] md:text-[56px] tracking-[-0.034em] font-[700] text-navy">
        {n}
        {suffix}
      </div>
      <div className="text-[15px] font-[600] text-ink-800">{label}</div>
      <div className="text-[13px] text-ink-500 mt-1">{sub}</div>
    </div>
  );
}

export default function Impact() {
  return (
    <section id="impact" className="py-24 md:py-28 bg-shell-50 border-y border-black/[0.06]">
      <Container>
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2">
            <p className="text-[12px] font-[650] tracking-widest text-ink-350 uppercase">
              Business impact
            </p>
            <h2 className="text-display mt-4 text-[34px] md:text-[42px] text-navy">
              Measured in $,
              <br />
              minutes, and range.
            </h2>
            <p className="mt-4 text-[16.5px] text-ink-700">
              Fleet-wide and consumer results from private beta integrations, 2024–2025.
            </p>
          </div>
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-x-12 gap-y-2 divide-y sm:divide-y-0 sm:[&>div]:border-l sm:[&>div]:pl-8 sm:[&>div]:border-black/[0.07]">
            <Stat value={34} suffix="%" label="Charging cost reduced" sub="median, 12 large fleets" />
            <Stat value={31} suffix="%" label="Queue wait times cut" sub="p95 wait-time reduction" />
            <Stat value={91} suffix="%" label="Failure prediction" sub="preempting faulty charger ports" />
            <Stat value={42} suffix=" ms" label="Decision latency" sub="p95 recommendation solver" />
          </div>
        </div>
      </Container>
    </section>
  );
}
