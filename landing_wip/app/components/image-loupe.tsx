"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Microscope loupe confined to a single image. Reuses the loupe.css microscope
 * visual (bezel, dial, glass) but magnifies the image itself via a scaled
 * background-image — no page DOM clone. It lives inside the image container
 * (position:relative + overflow:hidden), so it's clipped to the image, scrolls
 * with it, and never floats over the rest of the page.
 *
 * Drag the lens to move it; drag the outer dial ring (the wing) to change zoom
 * (1.5–4x). A living-noise canvas keeps the lens alive; it only animates while
 * the image is on screen and freezes under prefers-reduced-motion.
 */
const MIN_ZOOM = 1.5;
const MAX_ZOOM = 4;
const DEFAULT_ZOOM = 2.5;
const LENS = 160; // must match --lens-size below
const HALF = LENS / 2;
// Limited zoom dial: rotation travels a fixed sweep and hard-clamps at both
// ends (no wrap-around), like the diagnostic-page loupe.
const DIAL_START = 90; // deg at MIN_ZOOM
const DIAL_SWEEP = 330; // deg of travel from MIN_ZOOM to MAX_ZOOM
const zoomToRotation = (z: number) =>
  DIAL_START + ((z - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * DIAL_SWEEP;

// Round so server and client render byte-identical SVG (avoids hydration drift).
const f = (v: number) => v.toFixed(2);

function DialTicks() {
  const ticks = [];
  for (let i = 0; i < 90; i++) {
    const angle = (i * 360) / 90;
    const isMajor = i % 9 === 0;
    const r1 = isMajor ? 190 : 193;
    const r2 = 197;
    const rad = (angle * Math.PI) / 180;
    ticks.push(
      <line
        key={i}
        x1={f(200 + r1 * Math.cos(rad))}
        y1={f(200 + r1 * Math.sin(rad))}
        x2={f(200 + r2 * Math.cos(rad))}
        y2={f(200 + r2 * Math.sin(rad))}
        stroke={isMajor ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.22)"}
        strokeWidth={isMajor ? 1.2 : 0.5}
      />,
    );
  }
  return <g>{ticks}</g>;
}

export function ImageLoupe({ src, hidden = false }: { src: string; hidden?: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const magRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hide the loupe while an overlay (e.g. the formula sheet) is open so it
  // doesn't float over the sheet.
  useEffect(() => {
    loupeRef.current?.classList.toggle("is-hidden", hidden);
  }, [hidden]);

  useEffect(() => {
    const container = stageRef.current?.parentElement;
    if (!container) return;
    const loupe = loupeRef.current!;
    const trigger = triggerRef.current!;
    const dial = dialRef.current!;
    const mag = magRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true });

    const s = {
      x: 0,
      y: 0,
      zoom: DEFAULT_ZOOM,
      dialRotation: zoomToRotation(DEFAULT_ZOOM),
      dragging: false,
      dialDragging: false,
      dragOffX: 0,
      dragOffY: 0,
      lastPointerAngle: 0,
    };
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const dims = () => {
      const r = container.getBoundingClientRect();
      return { w: r.width, h: r.height };
    };

    function render() {
      const { w, h } = dims();
      // Keep the whole loupe bezel inside the image: clamp the center by the
      // dial radius (responsive via --dial-size) so it can't slide off the edge.
      const R = (loupe.offsetWidth || 220) / 2;
      const rx = Math.min(R, w / 2);
      const ry = Math.min(R, h / 2);
      s.x = clamp(s.x, rx, w - rx);
      s.y = clamp(s.y, ry, h - ry);
      loupe.style.setProperty("--loupe-x", `${s.x}px`);
      loupe.style.setProperty("--loupe-y", `${s.y}px`);
      loupe.style.setProperty("--dial-rotation", `${s.dialRotation}deg`);
      mag.style.backgroundSize = `${w * s.zoom}px ${h * s.zoom}px`;
      mag.style.backgroundPosition = `${HALF - s.x * s.zoom}px ${HALF - s.y * s.zoom}px`;
    }

    const start = dims();
    s.x = start.w / 2;
    s.y = start.h / 2;
    render();

    // ---- living noise ----
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    canvas.width = 96;
    canvas.height = 96;
    let noiseRaf = 0;
    let inView = false;
    function drawNoise(time: number) {
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const px = ctx.createImageData(w, h);
      const d = px.data;
      const zp = (s.zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM);
      const density = 0.05 + zp * 0.026 + (s.dragging ? 0.024 : 0);
      const baseAlpha = 30 + zp * 24 + (s.dragging ? 14 : 0);
      const shimmerY = Math.round((Math.sin(time * 0.0014) * 0.5 + 0.5) * h);
      for (let y = 0; y < h; y++) {
        const scan = Math.max(0, 1 - Math.abs(y - shimmerY) / 18);
        for (let x = 0; x < w; x++) {
          if (Math.random() > density + scan * 0.008) continue;
          const i = (y * w + x) * 4;
          const bright = Math.random() > 0.46 ? 242 : 22;
          d[i] = d[i + 1] = d[i + 2] = bright;
          d[i + 3] = baseAlpha + Math.random() * 44 + scan * 22;
        }
      }
      ctx.clearRect(0, 0, w, h);
      ctx.putImageData(px, 0, 0);
      for (let k = 0; k < 7; k++) {
        const drift = time * (0.00012 + k * 0.000018);
        const dx = (Math.sin(drift + k * 1.83) * 0.38 + 0.5) * w;
        const dy = (Math.cos(drift * 1.4 + k * 2.11) * 0.38 + 0.5) * h;
        ctx.beginPath();
        ctx.arc(dx, dy, 0.8 + (k % 3) * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = k % 2 === 0 ? "rgba(255,255,255,0.34)" : "rgba(0,0,0,0.22)";
        ctx.fill();
      }
    }
    const loop = (t: number) => {
      drawNoise(t);
      noiseRaf = requestAnimationFrame(loop);
    };
    function startNoise() {
      if (noiseRaf || !ctx) return;
      if (reduce) {
        drawNoise(0);
        return;
      }
      noiseRaf = requestAnimationFrame(loop);
    }
    function stopNoise() {
      if (noiseRaf) cancelAnimationFrame(noiseRaf);
      noiseRaf = 0;
    }
    // only animate while the image is on screen
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) startNoise();
        else stopNoise();
      },
      { threshold: 0 },
    );
    io.observe(container);

    // ---- drag the lens ----
    const onTrigDown = (e: PointerEvent) => {
      s.dragging = true;
      trigger.dataset.dragging = "true";
      const r = container.getBoundingClientRect();
      s.dragOffX = e.clientX - r.left - s.x;
      s.dragOffY = e.clientY - r.top - s.y;
      trigger.setPointerCapture(e.pointerId);
    };
    const onTrigMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const r = container.getBoundingClientRect();
      s.x = e.clientX - r.left - s.dragOffX;
      s.y = e.clientY - r.top - s.dragOffY;
      render();
    };
    const onTrigUp = (e: PointerEvent) => {
      s.dragging = false;
      trigger.dataset.dragging = "false";
      try {
        trigger.releasePointerCapture(e.pointerId);
      } catch {}
    };

    // ---- turn the dial ring to zoom ----
    const angleFromEvent = (e: PointerEvent) => {
      const r = loupe.getBoundingClientRect();
      return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    };
    const onDialDown = (e: PointerEvent) => {
      e.preventDefault();
      s.dialDragging = true;
      s.lastPointerAngle = angleFromEvent(e);
      dial.setPointerCapture(e.pointerId);
    };
    const onDialMove = (e: PointerEvent) => {
      if (!s.dialDragging) return;
      // Accumulate the angular delta and clamp to the sweep so zoom stops hard
      // at MIN/MAX instead of wrapping around the dial.
      const cur = angleFromEvent(e);
      let delta = cur - s.lastPointerAngle;
      if (delta > 180) delta -= 360;
      else if (delta < -180) delta += 360;
      s.lastPointerAngle = cur;
      s.dialRotation = clamp(s.dialRotation + delta, DIAL_START, DIAL_START + DIAL_SWEEP);
      s.zoom = MIN_ZOOM + ((s.dialRotation - DIAL_START) / DIAL_SWEEP) * (MAX_ZOOM - MIN_ZOOM);
      render();
    };
    const onDialUp = (e: PointerEvent) => {
      s.dialDragging = false;
      try {
        dial.releasePointerCapture(e.pointerId);
      } catch {}
    };

    trigger.addEventListener("pointerdown", onTrigDown);
    trigger.addEventListener("pointermove", onTrigMove);
    trigger.addEventListener("pointerup", onTrigUp);
    dial.addEventListener("pointerdown", onDialDown);
    dial.addEventListener("pointermove", onDialMove);
    dial.addEventListener("pointerup", onDialUp);
    const ro = new ResizeObserver(() => render());
    ro.observe(container);

    return () => {
      trigger.removeEventListener("pointerdown", onTrigDown);
      trigger.removeEventListener("pointermove", onTrigMove);
      trigger.removeEventListener("pointerup", onTrigUp);
      dial.removeEventListener("pointerdown", onDialDown);
      dial.removeEventListener("pointermove", onDialMove);
      dial.removeEventListener("pointerup", onDialUp);
      ro.disconnect();
      io.disconnect();
      stopNoise();
    };
  }, [src]);

  return (
    <div
      ref={stageRef}
      style={
        {
          position: "absolute",
          inset: 0,
          zIndex: 6,
          pointerEvents: "none",
          "--lens-size": "160px",
          "--dial-size": "220px",
          "--dial": "#111111",
          "--dial-dark": "#030303",
        } as CSSProperties
      }
    >
      <div
        ref={loupeRef}
        className="loupe"
        style={{ "--loupe-x": "50%", "--loupe-y": "50%", "--dial-rotation": "222deg", pointerEvents: "auto" } as CSSProperties}
      >
        <div ref={triggerRef} className="loupe-trigger" role="region" tabIndex={0} aria-label="Microscope loupe">
          <div className="loupe-lens">
            <div
              ref={magRef}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                borderRadius: "inherit",
                backgroundImage: `url(${src})`,
                backgroundRepeat: "no-repeat",
              }}
            />
            <canvas ref={canvasRef} className="loupe-canvas" width={96} height={96} />
          </div>
        </div>
        <div ref={dialRef} className="dial-control" role="slider" tabIndex={0} aria-label="Loupe zoom" />
        <svg className="loupe-dial" viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <path id="dialTextBottom" d="M 21 214 A 180 180 0 0 0 379 214" />
            <path id="dialTextTop" d="M 379 186 A 180 180 0 0 0 21 186" />
            <linearGradient id="wing-surface" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a4540" />
              <stop offset="40%" stopColor="#2c2926" />
              <stop offset="100%" stopColor="#1a1816" />
            </linearGradient>
            <linearGradient id="wing-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="wing-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
            </filter>
          </defs>
          <g className="dial-graphics">
            <circle className="dial-outer" cx="200" cy="200" r="198" />
            <DialTicks />
            <circle className="dial-inner-shadow" cx="200" cy="200" r="152" />
            <circle className="dial-inner-line" cx="200" cy="200" r="149" />
            <g filter="url(#wing-shadow)">
              <path
                d="M 190 392 C 187 400, 192 416, 200 422 C 208 416, 213 400, 210 392 Q 204 396, 200 397 Q 196 396, 190 392 Z"
                fill="url(#wing-surface)"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="0.6"
              />
              <path
                d="M 193 394 C 191 400, 195 412, 200 416 C 205 412, 209 400, 207 394 Q 203 396, 200 397 Q 197 396, 193 394 Z"
                fill="url(#wing-highlight)"
              />
              <path
                d="M 192 393 C 190 397, 194 406, 200 410 C 206 406, 210 397, 208 393"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.6"
              />
            </g>
          </g>
          <circle cx="200" cy="200" r="198" />
          <circle cx="200" cy="200" r="170" />
          <circle cx="200" cy="200" r="158" />
          <text>
            <textPath href="#dialTextBottom" startOffset="6%">
              PEAK 2026 / 4X Measuring Loupe / ELEMENTAL
            </textPath>
            <textPath href="#dialTextTop" startOffset="4%">
              ELEMENTAL PAGE MICROSCOPE
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}
