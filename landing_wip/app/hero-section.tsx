"use client";

import { PerlinNoise } from "@paper-design/shaders-react";
import { Button } from "@/components/ui/button";
import { InViewMount } from "./components/in-view-mount";

export function HeroSection() {
  return (
    <section className="relative bg-[#fffff9] min-h-screen flex items-center">
      <div
        className="pointer-events-none absolute inset-x-0 -top-[120px] h-[120px]"
        style={{ background: "linear-gradient(to bottom, transparent, #fffff9)" }}
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

          {/* isolate: keep the soft-light PerlinNoise blend inside this panel.
              Without it the blend participates in the page stacking context and
              the navbar's backdrop-blur snapshot goes stale in tiles (vertical
              seam in the pill that clears on hover/repaint). */}
          <div
            className="relative isolate w-full overflow-hidden rounded-3xl"
            style={{ aspectRatio: "4549 / 6361" }}
          >
            {/* Base layer: Paper key art (rotation baked into the webp) */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url(/images/hero-paper.webp)",
                backgroundPosition: "50%",
                backgroundSize: "cover",
              }}
            />
            {/* Paper PerlinNoise overlay — 70% soft light over #632AD5.
                Gated so its render loop stops once scrolled past the hero. */}
            <InViewMount>
              <PerlinNoise
                speed={0.29}
                scale={1.49}
                proportion={0.41}
                softness={0.77}
                octaveCount={2}
                lacunarity={2}
                persistence={0.01}
                colorBack="#00000000"
                colorFront="#FCCFF7"
                // Lock the noise frequency to Paper's world (4549x6361 after its
                // 90deg rotation) instead of our element's pixel size, so the
                // grain matches Paper at any panel size rather than being ~11x
                // coarser because our element is far smaller than Paper's 6361px.
                fit="cover"
                worldWidth={4549}
                worldHeight={6361}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#632AD5",
                  mixBlendMode: "soft-light",
                  opacity: 0.7,
                }}
              />
            </InViewMount>
          </div>
        </div>
      </div>
    </section>
  );
}
