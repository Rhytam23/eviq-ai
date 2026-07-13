"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

export default function Problem() {
  return (
    <section className="py-24 md:py-32 bg-[#05070B] border-t border-white/[0.04]">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-[1100px] mx-auto">
          <div>
            <span className="text-[12px] font-bold tracking-widest text-orange uppercase bg-orange/10 px-3 py-1 rounded-full">
              THE HARD TRUTH
            </span>
            <h2 className="text-display mt-6 text-[38px] md:text-[56px] text-white font-bold leading-tight tracking-tight">
              EV charging is broken. EVIQ fixes it.
            </h2>
            <p className="mt-5 text-[17px] md:text-[19px] text-[#A0AEC0] leading-relaxed">
              Electric vehicles have reached mass adoption, yet the underlying charging
              infrastructure remains fragmented, offline, and unpredictable. Drivers are forced to
              plan trips using spreadsheets and guess wait times.
            </p>
            <p className="mt-4 text-[14.5px] text-[#546b85] font-mono">
              EVIQ AI operates as a unified predictive layer above existing hardware, solving the
              three core constraints of electric mobility:
            </p>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[#0A1018] border border-white/[0.06] rounded-[22px] p-6 flex gap-4"
            >
              <span className="text-3xl mt-1">⚠️</span>
              <div>
                <h4 className="text-[17px] font-bold text-white">21% Hardware Offline Rates</h4>
                <p className="text-[13.5px] text-[#A0AEC0] mt-1">
                  Public charging ports are regularly offline, damaged, or derated, causing surprise
                  routing delays.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="bg-[#0A1018] border border-white/[0.06] rounded-[22px] p-6 flex gap-4"
            >
              <span className="text-3xl mt-1">⏱️</span>
              <div>
                <h4 className="text-[17px] font-bold text-white">38-Min Average Hub Wait</h4>
                <p className="text-[13.5px] text-[#A0AEC0] mt-1">
                  High-density hubs experience massive queues, but static apps offer no queue
                  forecasting.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="bg-[#0A1018] border border-white/[0.06] rounded-[22px] p-6 flex gap-4"
            >
              <span className="text-3xl mt-1">📉</span>
              <div>
                <h4 className="text-[17px] font-bold text-white">Unpredictable Battery Range</h4>
                <p className="text-[13.5px] text-[#A0AEC0] mt-1">
                  Weather stresses, wind shear, and elevation changes cause unexpected range drops
                  and driver anxiety.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
