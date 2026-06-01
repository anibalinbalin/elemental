"use client";

import { SectionReveal } from "./section-reveal";

// Elemental Bloom green, used as a single deliberate accent on the key word.
const ACCENT = "#3f6f2f";

export function Testimonial() {
  return (
    <section className="bg-surface-2">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:py-28">
        <SectionReveal>
          <blockquote>
            <p className="text-3xl font-medium leading-[1.15] tracking-tight lg:text-[2.75rem]">
              En años de consulta clínica, los cambios más sostenibles en
              digestión y piel siempre tuvieron una cosa en común:{" "}
              <span style={{ color: ACCENT }}>consistencia</span>. MICROCORE
              existe para hacer eso fácil.
            </p>
            <footer className="mt-10 flex items-center gap-3">
              <span
                aria-hidden
                className="h-px w-8 shrink-0"
                style={{ backgroundColor: ACCENT }}
              />
              <cite className="font-mono text-xs uppercase not-italic tracking-[0.2em] text-muted-foreground">
                Lic. en nutrición Laura Fuentes — Fundadora
              </cite>
            </footer>
          </blockquote>
        </SectionReveal>
      </div>
    </section>
  );
}
