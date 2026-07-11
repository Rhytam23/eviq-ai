"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

const groups = [
  {
    category: "Battery & Route AI",
    tagline: "Dynamic range and stop optimization",
    items: [
      {
        title: "Dynamic Range",
        desc: "Predicts real-time battery range factoring in weather, driving behavior, and topographic elevations.",
        metric: "Range Forecast",
      },
      {
        title: "Route Optimization",
        desc: "Selects the fastest multi-stop trip routing, placing charges where queues are shortest and prices cheapest.",
        metric: "Fastest Stop",
      },
      {
        title: "Emergency Routing",
        desc: "Triggers automatically when SoC drops below 20%, mapping to the closest compatible high-reliability charger.",
        metric: "Auto-Safety",
      },
    ],
  },
  {
    category: "Infrastructure Predictors",
    tagline: "Station queue and failure estimation",
    items: [
      {
        title: "Queue Prediction",
        desc: "Forecasts wait times at specific chargers using historical occupancy and incoming fleet directions.",
        metric: "Queue Wait",
      },
      {
        title: "Failure Prediction",
        desc: "Identifies faulty charging ports before you arrive by scanning live grid loads and heat levels.",
        metric: "99.2% Uptime",
      },
      {
        title: "Pricing Intelligence",
        desc: "Calculates dynamic tariff prices across multiple operators, optimizing for the cheapest slot.",
        metric: "Cost Optimizer",
      },
    ],
  },
  {
    category: "Enterprise Layer",
    tagline: "Commercial fleet and operator platforms",
    items: [
      {
        title: "Fleet Scheduling",
        desc: "Coordinates multiple vehicles, shaping charge rates during peak hours to preserve battery life and limit costs.",
        metric: "Fleet SaaS",
      },
      {
        title: "Operator Analytics",
        desc: "Provides charging network operators with demand forecasting, grid load models, and utilization analytics.",
        metric: "Grid OS",
      },
      {
        title: "Driver Personalization",
        desc: "Refines recommendations by learning driver preferences, connector ratings, and route speeds over time.",
        metric: "Learning Engine",
      },
    ],
  },
];

export default function Features() {
  return (
    <section className="py-24 md:py-28 bg-shell-50 select-none">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-[12px] font-[650] tracking-widest text-ink-350 uppercase">
              Modular capabilities
            </p>
            <h2 className="text-display mt-3 text-[34px] md:text-[46px] text-navy font-bold leading-tight">
              An intelligent layer above the grid.
            </h2>
          </div>
          <p className="text-[15px] text-ink-600 max-w-[420px] leading-relaxed">
            We predict charger availability, queue duration, dynamic range, and battery health to eliminate charging anxiety.
            <br />
            <span className="text-[12px] text-ink-400 font-semibold block mt-1">
              *Model-based estimates verified across diverse vehicle test beds.
            </span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-12">
          {groups.map((group, gIdx) => (
            <div key={group.category} className="space-y-5">
              <div className="border-l-[2.5px] border-cyan pl-3">
                <h3 className="text-[18px] font-[750] text-navy tracking-tight">
                  {group.category}
                </h3>
                <p className="text-[12.5px] text-ink-500 font-medium">{group.tagline}</p>
              </div>

              <div className="space-y-4">
                {group.items.map((item, iIdx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: (gIdx * 3 + iIdx) * 0.035, duration: 0.45 }}
                    className="rounded-[22px] border border-black/[0.08] bg-white p-6 shadow-soft hover:shadow-lift hover:border-cyan/35 transition-all"
                  >
                    <div className="text-[10px] font-[700] tracking-wider text-cyan uppercase">
                      {item.metric}
                    </div>
                    <h4 className="mt-2 text-[16px] font-[680] text-navy tracking-tight">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 text-[13.8px] leading-relaxed text-ink-600 font-[450]">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
