"use client";

import { SectionReveal } from "./section-reveal";

// Lime-green contrast block (EB-web-02 Figma): bright chartreuse, dark italic
// quote in quotation marks, with a bold citation.
const LIME = "#C8F670";
const INK = "#1c2a10";

export function Testimonial() {
  return (
    <section style={{ backgroundColor: LIME }}>
      <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
        <SectionReveal>
          <blockquote>
            <p
              className="text-2xl font-medium italic leading-[1.28] tracking-tight sm:text-3xl lg:text-[2.25rem]"
              style={{ color: INK }}
            >
              &ldquo;En años de consulta clínica, los cambios más sostenibles en
              digestión y piel siempre tuvieron una cosa en común: consistencia.
              MICROCORE existe para hacer eso fácil.&rdquo;
            </p>
            <footer className="mt-8">
              <cite className="text-base not-italic" style={{ color: INK }}>
                Laura,{" "}
                <span className="font-semibold italic">
                  Fundadora y Nutricionista
                </span>
              </cite>
            </footer>
          </blockquote>
        </SectionReveal>
      </div>
    </section>
  );
}
