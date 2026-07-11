"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

const verts = [
  { name: "EV Drivers", note: "Free co-pilot • Premium route optimization" },
  { name: "Fleet Operators", note: "Commercial logistics • Shift-charge scheduling" },
  { name: "Charging Operators", note: "Demand forecasting • Queue management OS" },
  { name: "Automotive OEMs", note: "Embedded SDKs • HUD integration" },
  { name: "Energy Companies", note: "Smart grid coordination • Load VPP capacity" },
  { name: "Smart Cities", note: "Infrastructure planning • Demand heatmaps" },
];

export default function Verticals() {
  return (
    <section id="customers" className="py-24 bg-white">
      <Container>
        <div className="max-w-[650px]">
          <p className="text-[12px] font-[650] tracking-widest text-ink-350 uppercase">Partners</p>
          <h2 className="text-display mt-3 text-[34px] md:text-[44px] text-navy">
            AI mobility intelligence for every sector.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-11">
          {verts.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-[20px] border border-black/[0.07] bg-shell-50 px-[22px] py-[22px] hover:bg-white hover:shadow-soft transition-all"
            >
              <div className="text-[17px] font-[630] text-navy">{v.name}</div>
              <div className="text-[13.5px] text-ink-500 mt-1">{v.note}</div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
