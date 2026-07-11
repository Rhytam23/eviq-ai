"use client";
import { Container } from "@/components/ui/Container";
import { useEffect, useRef } from "react";

export default function FinalCta() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseTrailRef = useRef<{ x: number; y: number; opacity: number }[]>([]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const resize = () => {
      c.width = c.clientWidth * 2;
      c.height = 260 * 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      // Translate client mouse coordinates to canvas resolution
      const mx = (e.clientX - rect.left) * 2;
      const my = (e.clientY - rect.top) * 2;

      const trail = mouseTrailRef.current;
      trail.push({ x: mx, y: my, opacity: 1.0 });
      if (trail.length > 80) {
        trail.shift();
      }
    };

    c.addEventListener("mousemove", onMouseMove);

    const hubs = Array.from({ length: 14 }, (_, i) => ({
      x: 80 + i * 140,
      y: 200 + Math.sin(i * 1.5) * 80,
      r: 8 + (i % 3) * 4,
      phase: i * 0.45,
    }));

    const loop = (tms: number) => {
      const t = tms / 1000;
      ctx.clearRect(0, 0, c.width, c.height);

      // Draw connection links
      ctx.strokeStyle = "rgba(79, 209, 255, 0.08)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < hubs.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(hubs[i].x, hubs[i].y);
        ctx.lineTo(hubs[i + 1].x, hubs[i + 1].y);
        ctx.stroke();

        // Draw flowing dashes along the connection links
        ctx.strokeStyle = "rgba(79, 209, 255, 0.22)";
        ctx.setLineDash([4, 18]);
        ctx.lineDashOffset = -t * 42;
        ctx.beginPath();
        ctx.moveTo(hubs[i].x, hubs[i].y);
        ctx.lineTo(hubs[i + 1].x, hubs[i + 1].y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw charging hubs
      hubs.forEach((hb) => {
        const glow = 0.52 + 0.48 * Math.sin(t * 1.4 + hb.phase);

        // outer pulsing ring
        ctx.strokeStyle = `rgba(79, 209, 255, ${0.15 + glow * 0.25})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(hb.x, hb.y, hb.r * (1 + glow * 0.3), 0, Math.PI * 2);
        ctx.stroke();

        // inner filled circle
        ctx.fillStyle = `rgba(79, 209, 255, ${0.12 + glow * 0.15})`;
        ctx.beginPath();
        ctx.arc(hb.x, hb.y, hb.r, 0, Math.PI * 2);
        ctx.fill();

        // center core
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + glow * 0.5})`;
        ctx.beginPath();
        ctx.arc(hb.x, hb.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw spinning background network particles
      for (let p = 0; p < 36; p++) {
        const px =
          c.width / 2 + Math.cos(t * 0.6 + p) * (140 + p * 2.8) * Math.sin(t * 0.2 + p * 0.15);
        const py = 100 + Math.sin(t * 0.8 + p * 0.58) * 18;
        ctx.fillStyle = "rgba(79,209,255,0.6)";
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw mouse trail particles (Priority 2 visual effect)
      const trail = mouseTrailRef.current;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(79,209,255,0.8)";
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        ctx.fillStyle = `rgba(79, 209, 255, ${p.opacity * 0.72})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.opacity, 0, Math.PI * 2);
        ctx.fill();

        // fade out particles over frames
        p.opacity -= 0.015;
        if (p.opacity <= 0) {
          trail.splice(i, 1);
          i--;
          }
      }
      ctx.shadowBlur = 0; // reset

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (c) c.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <section id="access" className="relative bg-[#02060d] text-white overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-x-0 bottom-0 w-full h-[260px] opacity-[1]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 420px at 50% -10%, rgba(79,209,255,0.10), transparent 68%)",
        }}
      />
      <Container>
        <div className="relative py-24 md:py-32 text-center max-w-[820px] mx-auto">
          <p className="text-cyan text-[12px] tracking-widest font-[650] uppercase">EVIQ AI</p>
          <h2 className="text-display mt-5 text-[40px] md:text-[62px] leading-[0.95] font-bold">
            The operating system
            <br />
            for EV mobility intelligence.
          </h2>
          <p className="mt-6 text-[18px] text-[#b9c9d8] max-w-[620px] mx-auto leading-relaxed">
            Join operators and fleets at leading portfolios building the next generation of
            predictive, autonomous charging routes.
          </p>
          <div className="mt-9 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="/demo"
              className="px-[24px] py-[13px] rounded-full bg-white text-[#071425] font-[650] text-[15px] hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lift snap-cursor"
            >
              Try AI Assistant
            </a>
            <a
              href="mailto:founders@eviq.ai"
              className="px-[24px] py-[13px] rounded-full border border-white/22 text-white font-[600] text-[15px] hover:bg-white/7 hover:scale-[1.02] active:scale-[0.98] transition-all snap-cursor"
            >
              Request early access
            </a>
          </div>
          <div className="mt-7 text-[12.5px] text-[#8a9fb3]">
            Private beta • US & EU deployments
          </div>
        </div>
      </Container>
      <div className="h-[170px]" />
    </section>
  );
}
