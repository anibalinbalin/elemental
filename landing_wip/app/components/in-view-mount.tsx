"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mounts its children only while a fill-the-parent target is near the viewport,
 * and unmounts them once it scrolls well away. Used to gate WebGL shaders/canvases:
 * `@paper-design`'s ShaderMount runs its rAF loop continuously while mounted and
 * only pauses on tab-hidden (no viewport awareness), so several off-screen shaders
 * would otherwise all animate at once. Unmounting releases the GL context and stops
 * the loop; each shader sits over a CSS-background photo, so the photo is the
 * seamless static fallback while unmounted.
 *
 * The wrapper is `position: absolute; inset: 0`, so the PARENT must be positioned.
 */
export function InViewMount({
  children,
  rootMargin = "400px",
}: {
  children: ReactNode;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      {inView ? children : null}
    </div>
  );
}
