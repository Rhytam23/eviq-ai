"use client";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

export default function Nav() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="glass border-b border-white/[0.06]">
        <Container className="h-[64px] flex items-center justify-between">
          {/* Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[#0A1018] border border-white/[0.08] flex items-center justify-center">
              <div className="w-[9px] h-[9px] rounded-[2px] bg-orange" />
            </div>
            <span className="text-[16px] tracking-[-0.02em] font-semibold text-white">EVIQ AI</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-[13.5px] text-[#A0AEC0] font-medium">
            <a href="#why" className="hover:text-white transition-colors">
              Why EVIQ
            </a>
            <a href="#platform" className="hover:text-white transition-colors">
              Platform
            </a>
            <a href="#decision-engine" className="hover:text-white transition-colors">
              AI Engine
            </a>
            <a href="#demo-preview" className="hover:text-white transition-colors">
              Preview
            </a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="/demo"
              className="text-[13px] font-semibold text-white/60 hidden sm:block hover:text-white transition-colors"
            >
              Live demo
            </a>
            <a
              href="#access"
              className="text-[13px] font-semibold px-[16px] py-[8px] rounded-full bg-orange text-white hover:bg-orange/90 transition-colors"
            >
              Early access
            </a>
          </div>
        </Container>
      </div>
    </motion.header>
  );
}
