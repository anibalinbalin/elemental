"use client";

import { SectionReveal } from "./section-reveal";

export function Testimonial() {
  return (
    <section className="bg-surface-2">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28 text-center">
        <SectionReveal>
          <blockquote className="flex flex-col items-center gap-8">
            <span className="text-6xl text-neutral-300 leading-none select-none">
              &ldquo;
            </span>
            <p className="text-xl lg:text-2xl italic leading-relaxed">
              En anos de consulta clinica, los cambios mas sostenibles en
              digestion y piel siempre tuvieron una cosa en comun: consistencia.
              MICROCORE existe para hacer eso facil.
            </p>
            <footer className="flex flex-col gap-1">
              <cite className="not-italic text-sm font-bold">Laura,</cite>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Fundadora y Nutricionista
              </span>
            </footer>
          </blockquote>
        </SectionReveal>
      </div>
    </section>
  );
}
