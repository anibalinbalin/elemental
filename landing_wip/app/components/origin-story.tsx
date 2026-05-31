"use client";

import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { PlaceholderImage } from "./placeholder-image";
import { SectionReveal } from "./section-reveal";

export function OriginStory() {
  const shape = useShape();

  return (
    <section id="origen" className="bg-surface-2">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <SectionReveal>
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                Nacio de una busqueda personal de bienestar
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Laura es nutricionista. En anos de consulta clinica vio como
                cambios reales en la alimentacion transformaban la digestion, la
                piel, la energia de sus pacientes. Tambien vio lo mas dificil:
                mantener esos cambios cuando la vida es caotica.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                MICROCORE nacio de esa observacion, un alimento funcional que
                hace el trabajo aunque el dia sea complicado. Sin capsulas, sin
                rutinas extra. Se mezcla con lo que ya comes.
              </p>
              <blockquote className="border-l-2 border-foreground pl-4 mt-2">
                <p className="text-sm italic leading-relaxed">
                  &ldquo;Queria algo que mis propios pacientes pudieran usar de
                  verdad todos los dias, sin esfuerzo adicional.&rdquo;
                </p>
                <footer className="mt-2">
                  <cite className="not-italic text-xs font-bold">
                    Laura,
                  </cite>{" "}
                  <span className="text-xs text-muted-foreground">
                    Fundadora y Nutricionista
                  </span>
                </footer>
              </blockquote>
              <p className="text-sm text-muted-foreground">
                Asi nacio <span className="font-bold">Elemental Bloom.</span>
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <PlaceholderImage
              className={cn("w-full", shape.container)}
              aspectRatio="4/5"
              src="/images/founder.webp"
              alt="Laura, fundadora y nutricionista de Elemental Bloom"
            />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
