"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed scroll-progress bar. Driven by requestAnimationFrame writing
 * transform: scaleX() straight to a ref — never React state — so it
 * stays on the compositor and can't jitter or drop frames.
 */
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5" aria-hidden>
      <div
        ref={ref}
        className="h-full origin-left bg-[var(--foreground)] will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
