"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LivingParticleSystem } from "../living-particle-system";

gsap.registerPlugin(ScrollTrigger);

/**
 * The living particle field as a scroll-driven banner between the hero and the
 * Microbiota section. Inspired by GreenSock's "scrubbed bento gallery": as you
 * scroll past it, a contained panel opens to full screen while the camera flies
 * into the cloud.
 *
 * The canvas is rendered ONCE at full-screen size and never resized — the reveal
 * is a `clip-path` inset (a cheap compositor op), so there's no per-frame WebGL
 * canvas / render-target reallocation (that was the source of the jank). The
 * immersion comes from driving the particle camera fly-in (progressRef 0 -> ~0.85)
 * on the same scrub, not from CSS-scaling the canvas (which would blur it).
 */
export function ParticleBand() {
  const pinRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [paused, setPaused] = useState(true);

  // Pause the render loop while the band is off screen.
  useEffect(() => {
    const el = pinRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0, rootMargin: "150px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pinRef.current || !boxRef.current) return;
    const CAMERA_DRIVE = 0.85; // stop short of the end-of-storyline white fade

    // Reveal the fixed full-screen canvas by easing a clip-path inset from a
    // centred, rounded "card" rectangle to full bleed.
    const setClip = (p: number) => {
      const box = boxRef.current;
      if (!box) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(1232, vw - 48); // contained = section width (max-w-7xl)
      const h = Math.min(vh * 0.68, 600);
      const e = 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3); // easeOutCubic
      const open = Math.min(1, e * 1.25); // panel reaches full bleed before the end
      const insetX = ((vw - w) / 2) * (1 - open);
      const insetY = ((vh - h) / 2) * (1 - open);
      const radius = 24 * (1 - Math.min(1, e * 1.4));
      box.style.clipPath = `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round ${radius}px)`;
    };

    setClip(0);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: "+=100%",
        scrub: 1,
        pin: pinRef.current,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress * CAMERA_DRIVE;
          setClip(self.progress);
        },
        onRefresh: () => setClip(progressRef.current / CAMERA_DRIVE),
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-[#fffff9]">
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-[#fffff9]">
        <div
          ref={boxRef}
          className="absolute inset-0"
          style={{ clipPath: "inset(16% 2% 16% 2% round 24px)" }}
        >
          <LivingParticleSystem progressRef={progressRef} stageCount={1} paused={paused} />
        </div>
      </div>
    </section>
  );
}
