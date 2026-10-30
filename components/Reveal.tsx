"use client";

import { useEffect, useRef } from "react";

/**
 * Fades its children up when they scroll into view. Content is fully visible in the server render and
 * without JavaScript; the hidden state is only applied in the browser, to blocks that start below the
 * fold, and never when the visitor prefers reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.add("reveal-hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.replace("reveal-hidden", "reveal-in");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ ["--d" as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}
