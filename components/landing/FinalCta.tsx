"use client";
import { Container } from "@/components/ui/Container";

export default function FinalCta() {
  return (
    <section
      id="access"
      className="relative bg-[#05070B] text-white overflow-hidden border-t border-white/[0.04]"
    >
      {/* Subtle radial ambient — no canvas animation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(800px 400px at 50% 0%, rgba(255,122,0,0.06), transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <Container>
        <div className="relative py-28 md:py-36 text-center max-w-[760px] mx-auto">
          <p className="text-orange text-[11px] tracking-widest font-semibold uppercase">EVIQ AI</p>
          <h2 className="mt-5 text-[38px] md:text-[58px] leading-[0.95] font-bold tracking-tight">
            The operating system
            <br />
            for EV mobility intelligence.
          </h2>
          <p className="mt-6 text-[17px] text-[#A0AEC0] max-w-[560px] mx-auto leading-relaxed">
            Join fleet operators and mobility leaders building the next generation of predictive,
            autonomous charging infrastructure.
          </p>

          <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/demo"
              className="px-6 py-3 rounded-full bg-orange text-white font-semibold text-[14px] hover:bg-orange/90 active:scale-[0.98] transition-all"
            >
              Try the demo
            </a>
            <a
              href="mailto:founders@eviq.ai"
              className="px-6 py-3 rounded-full border border-white/[0.12] text-white font-medium text-[14px] hover:bg-white/[0.06] active:scale-[0.98] transition-all"
            >
              Request early access
            </a>
          </div>

          <p className="mt-7 text-[12px] text-white/25 font-mono">
            Private beta · US &amp; EU deployments · Built by GridPulse
          </p>
        </div>
      </Container>
    </section>
  );
}
