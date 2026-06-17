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
    </section>
  );
}
