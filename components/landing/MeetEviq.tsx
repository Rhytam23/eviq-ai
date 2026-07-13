"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

const features = [
  {
    tag: "Battery Intelligence",
    title: "Dynamic Battery Twin",
    desc: "Simulates cell wear and temperature spikes at 1Hz, adjusting charge rates to preserve cell lifespan.",
    metric: "3.2× lifespan retained",
  },
  {
    tag: "Range Calculation",
    title: "Topographic Range Solver",
    desc: "Calculates range adjustments for wind, elevation, and HVAC draw using physics-based deep learning.",
    metric: "98.4% range accuracy",
  },
  {
    tag: "Queue Predictions",
    title: "Queue Forecast Hub",
    desc: "Models occupancy by tracking live fleet routes, routing vehicles away from queues before they form.",
    metric: "0 min average wait",
  },
  {
    tag: "Hardware Health",
    title: "Hardware Failure Scanner",
    desc: "Analyzes grid telemetry to identify thermal issues, hardware faults, or reduced rates in advance.",
    metric: "99.2% charger uptime",
  },
  {
    tag: "Automated Locks",
    title: "Cross-Network Booking",
    desc: "Coordinates dynamic reservations across Tesla, EA, and EVgo — updating slots during reroutes.",
    metric: "<42ms lock latency",
  },
  {
    tag: "Telemetry Sync",
    title: "Unified Cockpit HUD",
    desc: "Pushes live recommendation overlays onto vehicle instrument panels and fleet dashboards.",
    metric: "CAN-bus connected",
  },
];

export default function MeetEviq() {
  return (
    <section id="meet" className="py-24 md:py-32 bg-[#05070B] border-t border-white/[0.04]">
      <Container>
        <div className="max-w-[700px] mb-14">
          <span className="text-[11px] font-semibold tracking-widest text-orange uppercase">
            The Platform
          </span>
          <h2 className="mt-4 text-[36px] md:text-[52px] text-white font-bold leading-tight tracking-tight">
            Six engines. One intelligence layer.
          </h2>
          <p className="mt-4 text-[17px] text-[#A0AEC0] leading-relaxed max-w-[560px]">
            A modular OS connecting vehicle CAN-bus streams, real-time grid pricing, and charging
            network APIs into a single decisive recommendation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0A1018] p-6 flex flex-col hover:border-orange/25 transition-colors"
            >
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-orange font-mono uppercase block mb-3">
                  {f.tag}
                </span>
                <h3 className="text-[17px] font-semibold text-white mb-2.5">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#A0AEC0]">{f.desc}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.04] text-[12px] font-mono text-white/60">
                {f.metric}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
