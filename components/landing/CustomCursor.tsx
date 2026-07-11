"use client";
import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check coarse pointers (mobile/tablet touch interfaces)
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(isReduced);

    if (isMobile || isReduced) {
      return;
    }

    setVisible(true);

    const mouse = { x: 0, y: 0 };
    const ring = { x: 0, y: 0 };
    let activeSnapElement: HTMLElement | null = null;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      }
    };

    // Event delegation to capture hovers on buttons/links
    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a, button, [role='button'], .snap-cursor");
      if (target) {
        setHovered(true);
        activeSnapElement = target as HTMLElement;
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a, button, [role='button'], .snap-cursor");
      if (target) {
        setHovered(false);
        activeSnapElement = null;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    let raf = 0;
    const updateRing = () => {
      let targetX = mouse.x;
      let targetY = mouse.y;

      if (hovered && activeSnapElement) {
        const rect = activeSnapElement.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }

      // spring interpolation
      ring.x += (targetX - ring.x) * 0.16;
      ring.y += (targetY - ring.y) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) ${
          hovered ? "scale(1.8)" : "scale(1)"
        }`;
      }

      raf = requestAnimationFrame(updateRing);
    };

    updateRing();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(raf);
    };
  }, [hovered]);

  if (!visible || reducedMotion) return null;

  return (
    <>
      <style jsx global>{`
        body,
        a,
        button,
        [role="button"] {
          cursor: none !important;
        }
      `}</style>
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-cyan pointer-events-none z-[10000]"
        style={{ transform: "translate3d(-10px, -10px, 0)", transition: "width 0.2s, height 0.2s" }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-7 h-7 rounded-full border border-cyan pointer-events-none z-[9999] transition-opacity duration-300 ${
          hovered ? "opacity-80 bg-cyan/5 border-cyan" : "opacity-30 border-cyan bg-transparent"
        }`}
        style={{
          transform: "translate3d(-50px, -50px, 0) translate(-50%, -50%)",
          transition: "border-color 0.2s, background-color 0.2s",
        }}
      />
    </>
  );
}
