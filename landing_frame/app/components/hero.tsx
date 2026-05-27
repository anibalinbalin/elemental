"use client";

import { useShape } from "@/lib/shape-context";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "./placeholder-image";
import { SectionReveal } from "./section-reveal";

export function Hero() {
  const shape = useShape();

  return (
    <section className="bg-surface-1 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <SectionReveal>
            <div className="flex flex-col gap-8">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95]">
                Ciencia aplicada
                <br />
                al bienestar
                <br />
                cotidiano
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Formulas funcionales para tu microbiota, con dosis claras y
                disenadas para integrarse a tu comida diaria.
              </p>
              <div>
                <a
                  href="#producto"
                  className={cn(
                    "inline-flex items-center justify-center",
                    "bg-foreground text-background",
                    "px-8 py-3 text-sm font-medium",
                    "hover:opacity-90 transition-opacity",
                    shape.button
                  )}
                >
                  Quiero empezar
                </a>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <PlaceholderImage
              className={cn("w-full", shape.container)}
              aspectRatio="3/4"
              label="Producto"
            />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
