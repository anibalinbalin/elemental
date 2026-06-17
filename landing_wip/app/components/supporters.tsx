"use client";

import { SectionReveal } from "./section-reveal";

const supporters = [
  { src: "/logos/ithaka.png", alt: "Ithaka UCU" },
  { src: "/logos/ande.webp", alt: "ANDE - Agencia Nacional de Desarrollo" },
];

export function Supporters() {
  return (
    <section className="bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <SectionReveal>
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Con el apoyo de
          </p>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-20">
            {supporters.map((logo) => (
              <img
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                className="h-20 w-auto object-contain sm:h-24"
              />
            ))}
          </div>
        </SectionReveal>
      </div>

      {/* Closing curve — softly "shuts" the Ingredientes funcionales + apoyos
       * block and returns the eye to the cream background below (OriginStory
       * is bg-surface-2). The fill matches surface-2 so the hand-off is
       * seamless, while a hairline traces the curve so the transition still
       * reads on the all-cream light theme (surface-1 === surface-2 there).
       * Both colors flip automatically under .dark via the CSS vars. */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        className="pointer-events-none block h-[44px] w-full sm:h-[60px]"
      >
        <path
          d="M0,8 C480,52 960,52 1440,8 L1440,56 L0,56 Z"
          fill="var(--surface-2)"
        />
        <path
          d="M0,8 C480,52 960,52 1440,8"
          fill="none"
          stroke="var(--border)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </section>
  );
}
