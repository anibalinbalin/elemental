"use client";

import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { PouchViewer } from "../pouch-viewer";
import { SectionReveal } from "./section-reveal";
import { BuyButton } from "./buy-button";
import { PRODUCT, LAUNCH_MODE, currentUnitPrice, formatPrice } from "@/lib/product";

export function MicrocoreCard() {
  const shape = useShape();

  return (
    <section id="producto">
      <div className="bg-surface-1 text-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionReveal>
            <div
              className={cn(
                "bg-bordeaux text-bordeaux-foreground shadow-surface-4",
                "p-8 lg:p-16",
                shape.container
              )}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-bordeaux-foreground/70">
                    Microcore
                  </span>
                  <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-bordeaux-foreground">
                    MICROCORE
                  </h2>
                  <p className="text-lg text-bordeaux-foreground/80 leading-relaxed">
                    Una sola cucharada. Cinco funciones. Sin cápsulas. Frío o
                    caliente, llega activo igual.
                  </p>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        "bg-lime/15 border border-bordeaux-foreground/30 text-bordeaux-foreground px-3 py-1.5",
                        "text-xs font-mono",
                        shape.button
                      )}
                    >
                      5 en 1
                    </span>
                    <span className="text-xs text-bordeaux-foreground/70 font-mono uppercase">
                      Microcore
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        {LAUNCH_MODE && (
                          <span className="text-xl font-bold tracking-tight text-bordeaux-foreground/55 line-through">
                            {formatPrice(PRODUCT.unitPrice)}
                          </span>
                        )}
                        <span className="text-3xl font-bold tracking-tight text-bordeaux-foreground">
                          {formatPrice(currentUnitPrice())}
                        </span>
                        <span className="text-xs font-mono uppercase text-bordeaux-foreground/70">
                          / 300 g
                        </span>
                      </div>
                      {LAUNCH_MODE && (
                        <span className="text-xs font-mono uppercase text-bordeaux-foreground/70">
                          Precio de lanzamiento
                        </span>
                      )}
                    </div>
                    <BuyButton
                      className={cn(
                        "inline-flex items-center justify-center",
                        "bg-lime text-lime-foreground",
                        "px-8 py-3 text-sm font-medium",
                        "hover:bg-lime/90 transition-colors",
                        "disabled:opacity-60 disabled:cursor-wait",
                        shape.button
                      )}
                    >
                      Comprar ahora
                    </BuyButton>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-bordeaux-foreground/70">
                        {PRODUCT.deliveryEstimate}
                      </span>
                      <span className="text-xs text-bordeaux-foreground/70">
                        Pago seguro con Mercado Pago
                      </span>
                    </div>
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
