"use client";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-[#fffff8] min-h-screen flex items-center">
      <div
        className="pointer-events-none absolute inset-x-0 -top-[120px] h-[120px]"
        style={{ background: "linear-gradient(to bottom, transparent, #fffff8)" }}
      />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-8">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] text-[#171717]">
              Ciencia aplicada
              <br />
              al bienestar
              <br />
              cotidiano
            </h1>
            <p className="text-lg leading-relaxed max-w-md text-[#737373]">
              Fórmulas funcionales para tu microbiota, con dosis claras y
              diseñadas para integrarse a tu comida diaria.
            </p>
            <div>
              <Button
                size="lg"
                onClick={() => {
                  document
                    .getElementById("producto")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Quiero empezar
              </Button>
            </div>
          </div>

          <div
            className="w-full flex items-center justify-center rounded-3xl border border-dashed border-[#d8d2c4] bg-[#f4f1e9] text-[#a59f8f] text-xs font-mono uppercase tracking-[0.2em]"
            style={{ aspectRatio: "3/4" }}
          >
            Placeholder
          </div>
        </div>
      </div>
    </section>
  );
}
