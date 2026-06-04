"use client";

import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { PouchViewer } from "./pouch-viewer";
import { SectionReveal } from "./section-reveal";
import { BuyButton } from "./buy-button";
import { PRODUCT, formatPrice } from "@/lib/product";

export function MicrocoreBuyCard() {
  const shape = useShape();

  return (
    <section id="comprar">
      <div className="bg-surface-1 text-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionReveal>
            <div
              className={cn(
                "bg-surface-3 shadow-surface-4",
                "p-8 lg:p-16",
                shape.container
              )}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Microcore
                  </span>
                  <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                    MICROCORE
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Una sola cucharada. Cinco funciones. Sin cápsulas. Frío o
                    caliente, llega activo igual.
                  </p>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        "bg-neutral-200 px-3 py-1.5",
                        "text-xs font-mono",
                        shape.button
                      )}
                    >
                      5 en 1
                    </span>
                    <span className="text-xs text-muted-foreground font-mono uppercase">
                      Microcore
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight">
                        {formatPrice(PRODUCT.unitPrice)}
                      </span>
                      <span className="text-xs font-mono uppercase text-muted-foreground">
                        / 300 g
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
                  </div>
                </div>

                <div
                  className={cn("w-full overflow-hidden", shape.container)}
                  style={{ aspectRatio: "3/4" }}
                >
                  <PouchViewer />
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
