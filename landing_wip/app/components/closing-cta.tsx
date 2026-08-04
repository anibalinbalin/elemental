"use client";

import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { SectionReveal } from "./section-reveal";
import { BuyButton } from "./buy-button";
import { PRODUCT, UNIT_PRICE, PLANS, formatPrice } from "@/lib/product";

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
              Tres cucharadas al dia. En lo que ya comes.
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">
                  {formatPrice(UNIT_PRICE)}
                </span>
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  / 300 g
                </span>
              </div>
              <span className="text-sm font-medium text-lime">
                Lleva 2 y ahorra 16%, {formatPrice(PLANS["30d"].unitPrice)} c/u
              </span>
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
