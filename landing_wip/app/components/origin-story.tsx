"use client";

import { SectionReveal } from "./section-reveal";

// Origin story (EB-web-02 Figma): near-white text panel on the left, founder
// photo full-bleed on the right. Heading is regular weight (not bold), dark
// near-black ink with a dark-grey body. Colors sampled from the Figma frame.
const BG = "#f9f9f9";
const INK = "#1a1a1a";
const BODY = "#3a3a3a";

export function OriginStory() {
  return (
    <section style={{ backgroundColor: BG }}>
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* Founder photo — first on mobile, right column on desktop. */}
        <SectionReveal
          delay={0.08}
          className="relative order-1 min-h-[72vw] sm:min-h-[440px] lg:order-2 lg:min-h-0"
        >
          <img
            src="/images/founder.webp"
            alt="Laura, fundadora y nutricionista de Elemental Bloom, con un batido de açaí"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </SectionReveal>

        {/* Story text — second on mobile, left column on desktop. */}
        <SectionReveal className="order-2 flex items-center lg:order-1">
          <div className="mx-auto w-full max-w-xl px-6 py-16 sm:px-10 lg:py-24 lg:pl-16 lg:pr-10">
            <h2
              className="text-[2rem] font-normal leading-[1.06] tracking-tight sm:text-[2.5rem] lg:text-[3.25rem]"
              style={{ color: INK }}
            >
              Nació de una búsqueda personal de bienestar
            </h2>

            <div
              className="mt-8 flex flex-col gap-5 text-[15px] leading-relaxed sm:text-base"
              style={{ color: BODY }}
            >
              <p>
                Laura es nutricionista. En años de consulta clínica vio cómo
                cambios reales en la alimentación transformaban la digestión, la
                piel, la energía de sus pacientes. También vio lo más difícil:
                mantener esos cambios cuando la vida es caótica.
              </p>
              <p>
                MICROCORE nació de esa observación, un alimento funcional que
                hace el trabajo aunque el día sea complicado. Sin cápsulas, sin
                rutinas extra. Se mezcla con lo que ya comés.
              </p>

              <div>
                <p className="italic">
                  &ldquo;Quería algo que mis propios pacientes pudieran usar de
                  verdad, todos los días, sin esfuerzo adicional.&rdquo;
                </p>
                <p
                  className="mt-1 font-semibold not-italic"
                  style={{ color: INK }}
                >
                  Laura, Fundadora y Nutricionista
                </p>
              </div>

              <p>
                Así nació{" "}
                <span className="font-semibold" style={{ color: INK }}>
                  Elemental Bloom.
                </span>
              </p>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
