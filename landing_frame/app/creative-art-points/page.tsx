"use client";

import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { LivingParticleSystem } from "./living-particle-system";

const HeroSection = dynamic(
  () => import("./hero-section").then((mod) => ({ default: mod.HeroSection })),
  { ssr: false },
);

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

const LAST_STAGE = STAGES.length - 1;

type VignetteParams = {
  arc: {
    width: number;
    height: number;
    centerY: number;
    clearStop: number;
    fadeStop: number;
    edgeOpacity: number;
  };
  boost: {
    extraOpacity: number;
    rampIn: number;
  };
  text: {
    panelHeight: number;
    paddingBottom: number;
  };
};

function lerpColor(white: number[], dark: number[], t: number): string {
  const r = Math.round(white[0] + (dark[0] - white[0]) * t);
  const g = Math.round(white[1] + (dark[1] - white[1]) * t);
  const b = Math.round(white[2] + (dark[2] - white[2]) * t);
  const a = white[3] + (dark[3] - white[3]) * t;
  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}

function StageText({
  stage,
  index,
  active,
  darkT,
  paddingBottom,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  active: boolean;
  darkT: number;
  paddingBottom: number;
}) {
  const labelColor = lerpColor([255, 255, 255, 0.4], [23, 23, 23, 0.4], darkT);
  const titleColor = lerpColor([255, 255, 255, 1], [23, 23, 23, 1], darkT);
  const bodyColor = lerpColor([255, 255, 255, 0.55], [23, 23, 23, 0.55], darkT);

  return (
    <div
      className="absolute inset-0 flex flex-col justify-end px-6"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 700ms ease-out, transform 700ms ease-out",
        paddingBottom: `${paddingBottom}vh`,
      }}
    >
      <div className="mx-auto max-w-lg text-center">
        <h2
          className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.25em]"
          style={{ color: labelColor }}
        >
          {String(index + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
        </h2>
        <h3
          className="mb-4 text-2xl font-normal leading-tight md:text-3xl"
          style={{ color: titleColor }}
        >
          {stage.title}
        </h3>
        <p
          className="text-sm leading-relaxed md:text-base"
          style={{ color: bodyColor }}
        >
          {stage.body}
        </p>
      </div>
    </div>
  );
}

function FrameBadge({ progress, stage }: { progress: number; stage: number }) {
  const frame = Math.round(progress * 100);
  const label = stage >= 0 ? STAGES[stage].title.split(" ").slice(0, 3).join(" ") : "intro";
  return (
    <div
      className="pointer-events-none absolute left-4 top-4 z-50 flex items-baseline gap-1.5 rounded-full px-3 py-2 font-mono text-[11px] leading-none tracking-wide"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
    >
      <span className="font-bold text-white">{frame}</span>
      <span className="text-white/40">/</span>
      <span className="text-white/40">100</span>
      <span className="mx-1 inline-block h-2.5 w-px translate-y-[-1px] bg-white/20" />
      <span className="text-white/60">{label}</span>
    </div>
  );
}

function CreativeArtPointsInner() {
  const progressRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(-1);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [darkT, setDarkT] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const [particlePaused, setParticlePaused] = useState(false);
  const heroTriggeredRef = useRef(false);
  const preloadTriggeredRef = useRef(false);
  const dialRef = useRef<VignetteParams | null>(null);
  const peakOpacityRef = useRef(0);

  const v = useDialKit("Bottom Vignette", {
    arc: {
      width: [140, 60, 400],
      height: [110, 20, 200],
      centerY: [10, -50, 80],
      clearStop: [44, 0, 90],
      fadeStop: [74, 20, 100],
      edgeOpacity: [0.76, 0, 1],
    },
    boost: {
      extraOpacity: [0.2, 0, 0.5],
      rampIn: [0.15, 0, 0.4],
    },
    text: {
      panelHeight: [45, 10, 80],
      paddingBottom: [6, 0, 20],
    },
  }) as VignetteParams;

  dialRef.current = v;

  const updateVignette = useCallback((opacity: number) => {
    const el = vignetteRef.current;
    const d = dialRef.current;
    if (!el || !d) return;
    el.style.background = `radial-gradient(ellipse ${d.arc.width}% ${d.arc.height}% at 50% ${d.arc.centerY}%, transparent ${d.arc.clearStop}%, rgba(5,5,5,${opacity}) ${d.arc.fadeStop}%)`;
  }, []);

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
          setDisplayProgress(self.progress);
          const d = dialRef.current;
          if (!d) return;

          const p = self.progress;
          const slotCount = STAGES.length + 1;
          const slotFloat = p * slotCount;
          const slot = Math.floor(slotFloat);
          const stageIndex = slot - 1;
          const clamped = Math.max(-1, Math.min(STAGES.length - 1, stageIndex));
          setActiveStage(clamped);

          const dt = Math.max(0, Math.min(1, (p - 0.90) / 0.10));
          setDarkT(dt * dt * (3 - 2 * dt));

          const isLast = clamped === LAST_STAGE;

          if (isLast) {
            const vigEl = vignetteRef.current;
            if (vigEl) vigEl.style.opacity = "0";
            peakOpacityRef.current = 0;
          } else {
            const vigEl = vignetteRef.current;
            if (vigEl) vigEl.style.opacity = "1";

            let intensity = 0;
            if (clamped >= 0) {
              const frac = slotFloat - slot;
              const rampIn = d.boost.rampIn;
              if (frac < rampIn) {
                intensity = frac / rampIn;
              } else {
                intensity = 1;
              }
            }

            const target = d.arc.edgeOpacity + intensity * d.boost.extraOpacity;
            peakOpacityRef.current = Math.max(peakOpacityRef.current, target);
            updateVignette(Math.min(1, peakOpacityRef.current));
          }

          if (!preloadTriggeredRef.current && p >= 0.70) {
            preloadTriggeredRef.current = true;
            import("../test5/pouch-model").then((mod) => mod.preloadPouchModel());
          }
          if (!heroTriggeredRef.current && p >= 0.75) {
            heroTriggeredRef.current = true;
            setHeroReady(true);
          }
          setParticlePaused(p >= 0.98);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [updateVignette]);

  useEffect(() => {
    if (!heroReady || !heroRef.current) return;
    const ctx = gsap.context(() => {
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
    });
    return () => ctx.revert();
  }, [heroReady]);

  const arcBg = `radial-gradient(ellipse ${v.arc.width}% ${v.arc.height}% at 50% ${v.arc.centerY}%, transparent ${v.arc.clearStop}%, rgba(5,5,5,${v.arc.edgeOpacity}) ${v.arc.fadeStop}%)`;

  return (
    <>
      <div
        ref={containerRef}
        className="relative bg-[#050505]"
        style={{ height: `${(STAGES.length + 1) * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-screen overflow-hidden">
          <LivingParticleSystem progressRef={progressRef} stageCount={STAGES.length} paused={particlePaused} />
          <FrameBadge progress={displayProgress} stage={activeStage} />

          <div
            ref={vignetteRef}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-full"
            style={{
              background: arcBg,
              transition: "opacity 600ms ease-out",
            }}
          />

          <div
            ref={textPanelRef}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
            style={{ height: `${v.text.panelHeight}vh` }}
          >
            {STAGES.map((stage, i) => (
              <StageText
                key={i}
                stage={stage}
                index={i}
                active={activeStage === i}
                darkT={darkT}
                paddingBottom={v.text.paddingBottom}
              />
            ))}
          </div>
        </div>
      </div>

      <div ref={heroRef}>
        {heroReady ? (
          <Suspense fallback={<section className="relative bg-[#fffff8] min-h-screen" />}>
            <HeroSection />
          </Suspense>
        ) : (
          <section className="relative bg-[#fffff8] min-h-screen" />
        )}
      </div>
    </>
  );
}

export default function CreativeArtPointsPage() {
  return (
    <>
      <CreativeArtPointsInner />
      <DialRoot position="top-right" productionEnabled />
    </>
  );
}
