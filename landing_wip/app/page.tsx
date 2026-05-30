"use client";

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
    title: "Tu cuerpo es un ecosistema",
    body: "En este momento, billones de microorganismos viven sobre tu cuerpo y dentro de él. Superan en número a tus propias células y forman un mundo oculto que moldea tu salud día a día.",
  },
  {
    title: "Esta es tu microbiota",
    body: "Bacterias, hongos, virus y arqueas: juntos forman la microbiota. La mayoría habita en tu intestino, pero también colonizan tu piel, tu boca y tus pulmones.",
  },
  {
    title: "Una farmacia viva",
    body: "Tu microbiota produce vitaminas, entrena a tu sistema inmunitario, convierte la fibra en energía e incluso se comunica con tu cerebro a través del eje intestino-cerebro.",
  },
  {
    title: "El equilibrio lo es todo",
    body: "Cuando la diversidad cae —por estrés, antibióticos o una mala alimentación—, el ecosistema se desestabiliza. Recuperarlo significa alimentar a los organismos adecuados con los nutrientes adecuados.",
  },
];

// The first stages overlay the particle scene; the final stage is pulled out
// into a standalone section below it, acting as a buffer so the particle canvas
// and the 3D hero canvas are never on screen — or rendering — at the same time.
const OVERLAY_COUNT = STAGES.length - 1;
const OVERLAY_STAGES = STAGES.slice(0, OVERLAY_COUNT);
const BUFFER_STAGE = STAGES[STAGES.length - 1];
const LAST_STAGE = OVERLAY_COUNT - 1;

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


function HomeContent() {
  const progressRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(-1);
  const [darkT, setDarkT] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const SKIP_3D_HERO = false;
  const [particlePaused, setParticlePaused] = useState(false);
  const heroTriggeredRef = useRef(false);
  const preloadTriggeredRef = useRef(false);
  const dialRef = useRef<VignetteParams | null>(null);
  const peakOpacityRef = useRef(0);

  const v: VignetteParams = {
    arc: {
      width: 140,
      height: 110,
      centerY: 10,
      clearStop: 44,
      fadeStop: 74,
      edgeOpacity: 0.76,
    },
    boost: {
      extraOpacity: 0.2,
      rampIn: 0.15,
    },
    text: {
      panelHeight: 45,
      paddingBottom: 6,
    },
  };

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
          const d = dialRef.current;
          if (!d) return;

          const p = self.progress;
          const slotCount = OVERLAY_COUNT + 1;
          const slotFloat = p * slotCount;
          const slot = Math.floor(slotFloat);
          const stageIndex = slot - 1;
          const clamped = Math.max(-1, Math.min(OVERLAY_COUNT - 1, stageIndex));
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

          if (!SKIP_3D_HERO) {
            if (!preloadTriggeredRef.current && p >= 0.70) {
              preloadTriggeredRef.current = true;
              import("./test5/pouch-model").then((mod) => mod.preloadPouchModel());
            }
            if (!heroTriggeredRef.current && p >= 0.75) {
              heroTriggeredRef.current = true;
              setHeroReady(true);
            }
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [updateVignette]);

  // Keep particles animating the whole time the section is visible — including
  // at the end of the storyline. Only pause (to save GPU) once it's fully
  // scrolled off-screen into the hero below.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setParticlePaused(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
        style={{ height: `${(OVERLAY_COUNT + 1) * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-screen overflow-hidden">
          <LivingParticleSystem progressRef={progressRef} stageCount={OVERLAY_COUNT} paused={particlePaused} />

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
            {OVERLAY_STAGES.map((stage, i) => (
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

      {/* Standalone buffer section — the final stage on its own, between the
          two canvases. Matches the particle scene's end-of-scroll white fade. */}
      <section className="relative flex min-h-screen items-center justify-center bg-[#fffff8] px-6">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.25em] text-[#171717]/40">
            {String(STAGES.length).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
          </h2>
          <h3 className="mb-4 text-2xl font-normal leading-tight text-[#171717] md:text-3xl">
            {BUFFER_STAGE.title}
          </h3>
          <p className="text-sm leading-relaxed text-[#171717]/55 md:text-base">
            {BUFFER_STAGE.body}
          </p>
        </div>
      </section>

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

export default function Home() {
  return <HomeContent />;
}
