"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { HeroSection } from "./hero-section";
import { LivingParticleSystem } from "./living-particle-system";

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  {
    title: "Your body is an ecosystem",
    body: "Right now, trillions of microorganisms live on and inside you. They outnumber your own cells and form a hidden world that shapes your health every day.",
  },
  {
    title: "Meet your microbiota",
    body: "Bacteria, fungi, viruses, and archaea — together they form the microbiota. Most live in your gut, but they colonize your skin, mouth, and lungs too.",
  },
  {
    title: "A living pharmacy",
    body: "Your microbiota produces vitamins, trains your immune system, breaks down fiber into energy, and even communicates with your brain through the gut-brain axis.",
  },
  {
    title: "Balance is everything",
    body: "When diversity drops — from stress, antibiotics, or poor diet — the ecosystem destabilizes. Restoring it means feeding the right organisms with the right inputs.",
  },
];

export default function CreativeArtPointsPage() {
  const progressRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const veilRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });

      stageRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            scrollTrigger: {
              trigger: el,
              start: "top 75%",
              end: "top 35%",
              scrub: 0.3,
            },
          },
        );
        gsap.to(el, {
          opacity: 0,
          y: -30,
          scrollTrigger: {
            trigger: el,
            start: "bottom 40%",
            end: "bottom 15%",
            scrub: 0.3,
          },
        });
      });

      if (veilRef.current) {
        const veilEl = veilRef.current;
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "88% top",
          end: "bottom top",
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            const eased = p * p * (3 - 2 * p);
            const blur = eased * 24;
            veilEl.style.backdropFilter = `blur(${blur}px)`;
            (veilEl.style as unknown as Record<string, string>).webkitBackdropFilter = `blur(${blur}px)`;
            veilEl.style.backgroundColor = `rgba(255,255,252,${eased})`;
          },
        });
      }

      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top 95%",
              end: "top 50%",
              scrub: 0.5,
            },
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div ref={containerRef} className="relative bg-[#050505]" style={{ height: `${(STAGES.length + 1) * 100}vh` }}>
        <div className="sticky top-0 h-screen w-screen overflow-hidden">
          <LivingParticleSystem progressRef={progressRef} stageCount={STAGES.length} />
          <div
            ref={veilRef}
            className="pointer-events-none absolute inset-0 z-10"
          />
        </div>

        {STAGES.map((stage, i) => (
          <div
            key={i}
            ref={(el) => { stageRefs.current[i] = el; }}
            className="pointer-events-none absolute left-0 flex h-screen w-full items-center"
            style={{ top: `${(i + 0.5) * 100}vh` }}
          >
            <div className="pointer-events-auto mx-auto max-w-lg px-6 text-center">
              <h2 className="mb-4 font-mono text-sm font-medium uppercase tracking-[0.2em] text-white/50">
                {String(i + 1).padStart(2, "0")}
              </h2>
              <h3 className="mb-5 text-3xl font-light leading-tight text-white md:text-4xl">
                {stage.title}
              </h3>
              <p className="text-base leading-relaxed text-white/60">
                {stage.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div ref={heroRef}>
        <HeroSection />
      </div>
    </>
  );
}
