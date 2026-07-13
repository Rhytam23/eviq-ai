"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

const features = [
  {
    tag: "BATTERY INTELLIGENCE",
    title: "Dynamic Battery Twin",
    desc: "Simulates cell wear and internal temperature spikes at 1Hz, automatically managing charging rates to preserve overall cell lifespan.",
    metric: "3.2x Lifespan Retained",
  },
  {
    tag: "RANGE CALCULATION",
    title: "Topographic Range Solver",
    desc: "Leverages deep learning physics engines to calculate range adjustments for wind speed, topography climbs, and HVAC draws.",
    metric: "98.4% Range Accuracy",
  },
  {
    tag: "QUEUE PREDICTIONS",
    title: "Queue Forecast Hub",
    desc: "Models occupancy rates by tracking active fleet routes, routing vehicles away from crowded station queues before they form.",
    metric: "0 Min Average Wait",
  },
  {
    tag: "HARDWARE HEALTH",
    title: "Hardware Failure Scanner",
    desc: "Analyzes live grid telemetry to identify thermal issues, hardware malfunctions, or reduced charging rates in advance.",
    metric: "99.2% Charger Uptime",
  },
  {
    tag: "AUTOMATED LOCKS",
    title: "Cross-Network Booking Lock",
    desc: "Coordinates dynamic bookings on Tesla Superchargers, EA, and EVgo, managing slot updates during reroutes.",
    metric: "<42ms Latency Lock",
  },
  {
    tag: "TELEMETRY SYNC",
    title: "Unified Cockpit HUD",
    desc: "Pushes real-time recommendation overlays directly onto vehicle instrument panels and fleet manager dashboards.",
    metric: "CAN-Bus Connected",
  },
];

export default function MeetEviq() {
  return (
    <section className="py-24 md:py-32 bg-[#05070B] border-t border-white/[0.04]">
      <Container>
        <div className="max-w-[800px] mb-16">
          <span className="text-[12px] font-bold tracking-widest text-orange uppercase bg-orange/10 px-3 py-1 rounded-full">
            MEET EVIQ AI
          </span>
          <h2 className="text-display mt-6 text-[38px] md:text-[56px] text-white font-bold leading-tight tracking-tight">
            Six engines. One cohesive intelligence layer.
          </h2>
          <p className="mt-4 text-[17px] md:text-[19px] text-[#A0AEC0] max-w-[620px] leading-relaxed">
            A modular operating system connecting vehicle CAN-bus streams, real-time grid pricing,
            and charging network APIs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-[28px] border border-white/[0.06] bg-[#0A1018] p-7 flex flex-col justify-between hover:border-orange/30 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold tracking-wider text-orange font-mono uppercase block mb-3">
                  {f.tag}
                </span>
                <h3 className="text-[20px] font-bold text-white mb-3">{f.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#A0AEC0]">{f.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.04] text-[12.5px] font-mono text-white flex justify-between items-center">
                <span>{f.metric}</span>
                <span className="text-orange">➔</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
