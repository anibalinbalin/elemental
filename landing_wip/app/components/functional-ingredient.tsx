"use client";

import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { PlaceholderImage } from "./placeholder-image";
import { SectionReveal } from "./section-reveal";

export function FunctionalIngredient() {
  const shape = useShape();

  return (
    <section id="como-funciona" className="bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <SectionReveal>
            <PlaceholderImage
              className={cn("w-full", shape.container)}
              aspectRatio="4/3"
              label="Ingrediente"
            />
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                Ingrediente funcional termoresistente desarrollado en Uruguay.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Los probioticos comunes mueren con el calor. Por eso la mayoria
                viene en capsulas que no podes mezclar con nada caliente.
                MICROCORE esta formulado con Bacillus Coagulans esporulado,
                sobrevive al calor, al frio y al acido estomacal. Llega activo
                donde tiene que llegar.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Mezclalo en tu yogur, tu avena o tu smoothie. Frio o caliente,
                llega activo igual. No cambies tu rutina. Se adapta a ella.
              </p>
              <div className="pt-2">
                <a
                  href="#"
                  className={cn(
                    "inline-flex items-center justify-center",
                    "border border-foreground",
                    "px-8 py-3 text-sm font-medium",
                    "hover:bg-foreground hover:text-background transition-colors",
                    shape.button
                  )}
                >
                  Ver como usarlo
                </a>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
