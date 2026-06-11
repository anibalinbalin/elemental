"use client";

// The "living" microscope layer — a few small specks that drift slowly across the
// lens so the glass looks alive, like the production loupe. Deliberately just the
// moving specks: no per-pixel random grain field. The grain re-randomized every
// frame, which strobed and read as choppy; the specks instead travel on continuous
// sine/cos paths, so they glide smoothly. Cheap too — a handful of arcs per frame,
// no ImageData. Pauses off-screen and freezes under reduced motion.
import { useEffect, useRef } from "react";

import { useLoupeStore } from "./store";

const N = 120; // internal canvas resolution (specks are drawn as smooth circles)
const SPECKS = 10;

export default function LivingNoiseCanvas({
  size,
  className,
  style,
}: {
  size: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    canvas.width = N;
    canvas.height = N;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    function draw(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, N, N);
      const scale = useLoupeStore.getState().scale;
      const zp = Math.min(1, Math.max(0, (scale - 1) / 7)); // marj zoom is 1..8
      for (let k = 0; k < SPECKS; k++) {
        const drift = time * (0.00012 + k * 0.000016);
        const dx = (Math.sin(drift + k * 1.83) * 0.4 + 0.5) * N;
        const dy = (Math.cos(drift * 1.4 + k * 2.11) * 0.4 + 0.5) * N;
        const twinkle = 0.7 + 0.3 * Math.sin(time * 0.0018 + k); // smooth, not a flicker
        const r = 0.7 + (k % 3) * 0.5;
        const a = (k % 2 === 0 ? 0.34 : 0.22) * twinkle * (0.85 + zp * 0.3);
        ctx.beginPath();
        ctx.arc(dx, dy, r, 0, Math.PI * 2);
        ctx.fillStyle =
          k % 2 === 0 ? `rgba(255,255,255,${a})` : `rgba(20,20,20,${a})`;
        ctx.fill();
      }
    }

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf) return;
      if (reduce) {
        draw(0);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    // Only animate while on screen.
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ width: size, height: size, ...style }}
    />
  );
}
