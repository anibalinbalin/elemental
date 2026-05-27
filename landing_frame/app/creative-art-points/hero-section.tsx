"use client";

import { Button, Card } from "@heroui/react";

export function HeroSection() {
  return (
    <section className="bg-[#fffffc] min-h-screen flex items-center">
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

          <Card className="w-full overflow-hidden">
            <Card.Content className="p-0">
              <div
                className="bg-[#E5E5E5] flex items-center justify-center w-full"
                style={{ aspectRatio: "3/4" }}
              >
                <span className="text-sm font-medium text-[#737373]">
                  Producto
                </span>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </section>
  );
}
