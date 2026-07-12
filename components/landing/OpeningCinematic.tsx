"use client";
import { useEffect, useRef, useState } from "react";

export default function OpeningCinematic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      c.width = window.innerWidth * 2;
      c.height = window.innerHeight * 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const duration = 1200; // 1.2 seconds total

    const hexCodes = [
      "VEHICLE_SOC_16%",
      "CHARGER_READY_350KW",
      "ROUTE_OPTIMIZED",
      "QUEUE_WAIT_2M",
      "EVIQ_DECISION_OK",
      "BATTERY_TEMP_NOMINAL",
      "RESERVATION_LOCKED",
    ];
    const activeHex: { text: string; y: number; opacity: number }[] = [];

    // particles
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      s: 1.5 + Math.random() * 2,
      vy: 0.8 + Math.random() * 1.2,
    }));

    const drawGrid = (opacityVal: number) => {
      const w = c.width;
      const h = c.height;
      ctx.strokeStyle = `rgba(255, 122, 0, ${opacityVal * 0.08})`;
      ctx.lineWidth = 1;
      const step = 96;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1); // 0 to 1

      const w = c.width;
      const h = c.height;
      ctx.clearRect(0, 0, w, h);

      // Draw faint grid
      drawGrid(1 - t * 0.2);

      // Draw ambient particles
      ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * (1 - t)})`;
      particles.forEach((p) => {
        p.y += p.vy;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fill();
      });

      const cx = w / 2;
      const cy = h / 2 + 100;

      if (t < 0.35) {
        // Phase 1: Center dot pulsing
        const p1 = t / 0.35;
        const pulse = 1 + 0.3 * Math.sin(p1 * Math.PI * 4);
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(255, 122, 0, 0.8)";
        ctx.fillStyle = "#FF7A00";
        ctx.beginPath();
        ctx.arc(cx, cy, 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (t < 0.75) {
        // Phase 2: Core Ignition & Battery Segment Drawing + telemetry scroll
        const p2 = (t - 0.35) / 0.4; // 0 to 1
        const batteryH = 200;
        const batteryW = 90;
        const bx = cx - batteryW / 2;
        const by = cy - batteryH - 40;

        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(255, 122, 0, 0.5)";
        ctx.strokeStyle = "#FF7A00";
        ctx.lineWidth = 3;

        // Draw battery outline
        ctx.strokeRect(bx, by, batteryW, batteryH);

        // Draw top terminal cap
        ctx.fillStyle = "#FF7A00";
        ctx.fillRect(cx - 15, by - 12, 30, 12);

        // Fill inner charging segments
        const maxSegments = 5;
        const currentSegments = Math.floor(p2 * maxSegments);
        const segH = (batteryH - 24) / maxSegments;
        for (let i = 0; i < currentSegments; i++) {
          ctx.fillRect(bx + 12, by + batteryH - 12 - (i + 1) * segH + 4, batteryW - 24, segH - 8);
        }
        ctx.shadowBlur = 0;

        // Scrolling hex details on the side
        if (Math.random() < 0.16 && activeHex.length < 5) {
          activeHex.push({
            text: hexCodes[Math.floor(Math.random() * hexCodes.length)],
            y: cy - Math.random() * 200,
            opacity: 1,
          });
        }

        ctx.fillStyle = "rgba(255, 122, 0, 0.7)";
        ctx.font = "20px monospace";
        activeHex.forEach((h, idx) => {
          ctx.fillText(h.text, cx + 90, h.y);
          h.y -= 1.2;
          h.opacity -= 0.02;
          if (h.opacity <= 0) activeHex.splice(idx, 1);
        });
      } else {
        // Phase 3 & 4: Zoom out/expand camera into the layout
        const p3 = (t - 0.75) / 0.25; // 0 to 1
        const zoom = 1 + p3 * 0.18;
        const fade = 1 - p3;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(zoom, zoom);
        ctx.translate(-cx, -cy);

        // Draw final glowing battery state
        ctx.shadowBlur = 20 * fade;
        ctx.shadowColor = "rgba(255, 122, 0, 0.7)";
        ctx.strokeStyle = `rgba(255, 122, 0, ${fade})`;
        ctx.lineWidth = 2.5;

        const batteryH = 200;
        const batteryW = 90;
        const bx = cx - batteryW / 2;
        const by = cy - batteryH - 40;
        ctx.strokeRect(bx, by, batteryW, batteryH);

        ctx.fillStyle = `rgba(255, 122, 0, ${fade})`;
        ctx.fillRect(cx - 15, by - 12, 30, 12);
        ctx.fillRect(bx + 12, by + 12, batteryW - 24, batteryH - 24);

        ctx.restore();
      }

      if (t < 1) {
        raf = requestAnimationFrame(loop);
      } else {
        setOpacity(0);
        setTimeout(() => setVisible(false), 700);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#05070B] flex items-center justify-center overflow-hidden transition-opacity duration-700"
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
