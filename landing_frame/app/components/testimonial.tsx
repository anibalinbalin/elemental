"use client";

import { SectionReveal } from "./section-reveal";

export function Testimonial() {
  return (
    <section style={{ backgroundColor: "#c5e847" }}>
      <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28 text-center">
        <SectionReveal>
          <blockquote className="flex flex-col items-center gap-6">
            <p className="text-xl lg:text-2xl italic leading-relaxed text-black">
              &ldquo;En anos de consulta clinica, los cambios mas sostenibles en
              digestion y piel siempre tuvieron una cosa en comun:
              consistencia. MICROCORE existe para hacer eso facil.&rdquo;
            </p>
            <footer>
              <span className="text-sm text-black">
                <strong>Laura,</strong> Fundadora y Nutricionista
              </span>
            </footer>
          </blockquote>
        </SectionReveal>
      </div>
    </section>
  );
}
