"use client";
import { Container } from "@/components/ui/Container";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const d = 1600;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / d, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(eased * to);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Problem() {
  return (
    <section className="py-24 md:py-32 bg-shell-50">
      <Container>
        <div className="max-w-[760px]">
          <p className="text-[12px] font-[650] tracking-widest text-ink-350 uppercase">
            The problem
          </p>
          <h2 className="text-display mt-4 text-[36px] md:text-[52px] text-navy">
            EV charging is complex,
            <br />
            unreliable, and fragmented.
          </h2>
          <p className="mt-5 text-[18px] leading-relaxed text-ink-700 max-w-[620px]">
            Broken chargers, unexpected queues, and unoptimized battery routing create constant delays and vehicle downtime. Drivers and fleet managers are operating in the dark.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-14">
          {[
            {
              n: 21,
              pre: "",
              suf: "%",
              dec: 0,
              t: "Public chargers are faulty or offline",
              c: "Constant routing disruptions",
            },
            {
              n: 38,
              pre: "",
              suf: " min",
              dec: 0,
              t: "Average queue wait at high-density hubs",
              c: "Wasted commercial fleet hours",
            },
            {
              n: 14,
              pre: "",
              suf: "%",
              dec: 0,
              t: "Battery degradation from bad habits",
              c: "Accelerated capacity decay",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.6 }}
              className="rounded-[22px] bg-white border border-black/[0.07] p-7 shadow-soft"
            >
              <div className="text-[44px] tracking-[-0.03em] font-[700] text-navy">
                <Counter to={s.n} prefix={s.pre} suffix={s.suf} decimals={s.dec} />
              </div>
              <div className="mt-2 text-[15.5px] text-ink-700 font-[500]">{s.t}</div>
              <div className="mt-2 text-[13px] text-ink-500">{s.c}</div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
