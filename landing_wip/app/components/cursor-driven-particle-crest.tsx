"use client";

/**
 * CursorDrivenParticleImage
 *
 * Adapted from Componentry's `cursor-driven-particle-typography`
 * (https://componentry.fun) — instead of rasterizing TEXT, it rasterizes an
 * image (or SVG) and builds the particle field from its pixels, keeping each
 * particle's *source colour* so the artwork reassembles in full colour. The
 * cursor pushes particles away; spring physics pulls them home.
 *
 * Physics props (dispersion / returnSpeed / friction / interactionRadius) are
 * applied live via a ref, so dragging those dials never rebuilds the field.
 * Structural props (src / density / size / scale / alphaThreshold / colour)
 * re-sample the image when they change.
 */

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export interface CursorDrivenParticleImageProps {
  /** Additional CSS classes for the wrapper. */
  className?: string;
  /** Image / SVG URL to rasterize into particles. */
  src: string;

  // ── Structural (rebuilds the particle field when changed) ──
  /** Radius of each particle in CSS px. */
  particleSize?: number;
  /** Sampling step in source pixels. Lower = denser = more particles (min 1). */
  particleDensity?: number;
  /** Fraction (0–1) of the container the image is scaled to fit within. */
  scale?: number;
  /** Alpha cutoff (0–255) for a source pixel to spawn a particle. */
  alphaThreshold?: number;
  /** Override every particle's colour. If null, each keeps its source pixel colour. */
  color?: string | null;

  // ── Physics (applied live, no rebuild) ──
  /** How strongly the cursor pushes particles away. */
  dispersionStrength?: number;
  /** Spring strength pulling particles back to their origin. */
  returnSpeed?: number;
  /** Per-frame velocity damping (0–1). */
  friction?: number;
  /** Cursor influence radius in CSS px. */
  interactionRadius?: number;
}

interface Physics {
  dispersionStrength: number;
  returnSpeed: number;
  friction: number;
  interactionRadius: number;
}

class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;

  constructor(x: number, y: number, size: number, color: string) {
    this.x = x + (Math.random() - 0.5) * 10; // slight initial scatter
    this.y = y + (Math.random() - 0.5) * 10;
    this.originX = x;
    this.originY = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
    this.size = size;
    this.color = color;
  }

  update(mouseX: number, mouseY: number, p: Physics) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.hypot(dx, dy);

    if (
      distance > 0 &&
      distance < p.interactionRadius &&
      mouseX !== -1000 &&
      mouseY !== -1000
    ) {
      const dirX = dx / distance;
      const dirY = dy / distance;
      const force = (p.interactionRadius - distance) / p.interactionRadius;
      this.vx -= dirX * force * p.dispersionStrength;
      this.vy -= dirY * force * p.dispersionStrength;
    }

    // Spring back to origin
    this.vx += (this.originX - this.x) * p.returnSpeed;
    this.vy += (this.originY - this.y) * p.returnSpeed;

    // Friction
    this.vx *= p.friction;
    this.vy *= p.friction;

    // Subtle jitter once settled
    if (
      Math.abs(this.x - this.originX) < 1 &&
      Math.abs(this.y - this.originY) < 1 &&
      Math.random() > 0.95
    ) {
      this.vx += (Math.random() - 0.5) * 0.2;
      this.vy += (Math.random() - 0.5) * 0.2;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function CursorDrivenParticleImage({
  className,
  src,
  particleSize = 1.5,
  particleDensity = 5,
  scale = 0.8,
  alphaThreshold = 128,
  color = null,
  dispersionStrength = 15,
  returnSpeed = 0.08,
  friction = 0.85,
  interactionRadius = 120,
}: CursorDrivenParticleImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live physics — read inside the animation loop, never triggers a rebuild.
  const physicsRef = useRef<Physics>({
    dispersionStrength,
    returnSpeed,
    friction,
    interactionRadius,
  });
  useEffect(() => {
    physicsRef.current = {
      dispersionStrength,
      returnSpeed,
      friction,
      interactionRadius,
    };
  }, [dispersionStrength, returnSpeed, friction, interactionRadius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let rafId = 0;
    let particles: Particle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let w = 0;
    let h = 0;
    let disposed = false;

    const img = new Image();

    const sample = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      if (w === 0 || h === 0 || !img.width || !img.height) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // contain-fit the image into `scale` × container
      const ratio = Math.min((w * scale) / img.width, (h * scale) / img.height);
      const drawW = img.width * ratio;
      const drawH = img.height * ratio;
      const offX = (w - drawW) / 2;
      const offY = (h - drawH) / 2;
      ctx.drawImage(img, offX, offY, drawW, drawH);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      ctx.clearRect(0, 0, w, h);

      particles = [];
      const step = Math.max(1, Math.floor(particleDensity * dpr));
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const i = (y * canvas.width + x) * 4;
          const a = data[i + 3] ?? 0;
          if (a > alphaThreshold) {
            const fill = color ?? `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
            particles.push(new Particle(x / dpr, y / dpr, particleSize, fill));
          }
        }
      }
    };

    const animate = () => {
      if (disposed) return;
      ctx.clearRect(0, 0, w, h);
      const p = physicsRef.current;
      for (const particle of particles) {
        particle.update(mouseX, mouseY, p);
        particle.draw(ctx);
      }
      rafId = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = t.clientX - rect.left;
      mouseY = t.clientY - rect.top;
    };

    const ro = new ResizeObserver(() => sample());

    img.onload = () => {
      if (disposed) return;
      sample();
      ro.observe(container);
      cancelAnimationFrame(rafId);
      animate();
    };
    img.src = src;

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("touchstart", onTouch, { passive: true });
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    canvas.addEventListener("touchend", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("touchend", onLeave);
    };
  }, [src, particleSize, particleDensity, scale, alphaThreshold, color]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full min-h-[400px] touch-none", className)}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
