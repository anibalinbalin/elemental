"use client";

import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { SectionReveal } from "./section-reveal";
import { BuyButton } from "./buy-button";
import { PRODUCT, LAUNCH_MODE, currentUnitPrice, formatPrice } from "@/lib/product";

export function ClosingCta() {
  const shape = useShape();

  return (
    <section className="bg-surface-1 text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <SectionReveal>
          <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
              Empezá hoy con MICROCORE
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Una cucharada por día. En lo que ya comés.
            </p>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-baseline gap-2">
                {LAUNCH_MODE && (
                  <span className="text-xl font-bold tracking-tight text-muted-foreground/60 line-through">
                    {formatPrice(PRODUCT.unitPrice)}
                  </span>
                )}
                <span className="text-3xl font-bold tracking-tight">
                  {formatPrice(currentUnitPrice())}
                </span>
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  / 300 g
                </span>
              </div>
              {LAUNCH_MODE && (
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  Precio de lanzamiento
                </span>
              )}
            </div>
            <BuyButton
              className={cn(
                "inline-flex items-center justify-center",
                "bg-foreground text-background",
                "px-8 py-3 text-sm font-medium",
                "hover:opacity-90 transition-opacity",
                "disabled:opacity-60 disabled:cursor-wait",
                shape.button
              )}
            >
              Comprar ahora
            </BuyButton>
            <a
              href="#microbiota"
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Ver la fórmula
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
