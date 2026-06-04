"use client";

import { Button } from "@heroui/react";
import { PouchViewer } from "./pouch-viewer";

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
              Formulas funcionales para tu microbiota, con dosis claras y
              disenadas para integrarse a tu comida diaria.
            </p>
            <div>
              <Button
                variant="primary"
                size="lg"
                onPress={() => {
                  document
                    .getElementById("producto")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Quiero empezar
              </Button>
            </div>
          </div>

          <div className="w-full" style={{ aspectRatio: "3/4" }}>
            <PouchViewer />
          </div>
        </div>
      </div>
    </section>
  );
}
