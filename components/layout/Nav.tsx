"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

export default function Nav() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="glass border-b border-black/[0.06]">
        <Container className="h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-[9px] bg-navy flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-[1px] rounded-[8px] border border-white/10" />
              <div className="w-[10px] h-[10px] rounded-[3px] bg-cyan cyan-glow" />
            </div>
            <span className="text-[17px] tracking-[-0.015em] font-[600] text-navy">EVIQ AI</span>
            <span className="text-[10.5px] font-[550] tracking-wider text-ink-350 uppercase ml-1 hidden sm:inline">
              AI MOBILITY
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-9 text-[14px] text-ink-700 font-[500]">
            <a href="#product" className="hover:text-navy transition-colors">
              Product
            </a>
            <a href="#architecture" className="hover:text-navy transition-colors">
              Architecture
            </a>
            <a href="#impact" className="hover:text-navy transition-colors">
              Impact
            </a>
            <a href="#customers" className="hover:text-navy transition-colors">
              Customers
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/demo"
              className="text-[13.5px] font-[600] text-cyan hidden sm:flex items-center gap-1.5 mr-2 hover:text-navy transition-colors snap-cursor"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              Interactive Demo
            </a>
            <a
              href="#access"
              className="text-[13.5px] font-[600] px-[16px] py-[9px] rounded-full bg-navy text-white hover:bg-[#0b1e3a] transition-colors"
            >
              Early access
            </a>
          </div>
        </Container>
      </div>
    </motion.header>
  );
}
