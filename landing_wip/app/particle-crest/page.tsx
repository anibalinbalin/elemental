"use client";

import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";

import { CursorDrivenParticleImage } from "../components/cursor-driven-particle-crest";

/** Mirrors the grouped config below — DialKit returns resolved numbers. */
type CrestDials = {
  field: {
    density: number;
    particleSize: number;
    scale: number;
    alphaThreshold: number;
  };
  physics: {
    dispersion: number;
    returnSpeed: number;
    friction: number;
    radius: number;
  };
};

export default function ParticleCrestPage() {
  // [default, min, max, step]
  const v = useDialKit("Coat of Arms · Particles", {
    field: {
      density: [5, 1, 14, 1],
      particleSize: [1.5, 0.4, 5, 0.1],
      scale: [0.46, 0.3, 1, 0.02],
      alphaThreshold: [128, 1, 254, 1],
    },
    physics: {
      dispersion: [15, 0, 60, 1],
      returnSpeed: [0.08, 0.005, 0.3, 0.005],
      friction: [0.85, 0.5, 0.98, 0.01],
      radius: [75, 20, 400, 5],
    },
  }) as CrestDials;

  return (
    <main className="relative h-screen w-full overflow-hidden bg-white">
      <CursorDrivenParticleImage
        src="/coat-of-arms-uruguay.svg"
        particleDensity={v.field.density}
        particleSize={v.field.particleSize}
        scale={v.field.scale}
        alphaThreshold={v.field.alphaThreshold}
        dispersionStrength={v.physics.dispersion}
        returnSpeed={v.physics.returnSpeed}
        friction={v.physics.friction}
        interactionRadius={v.physics.radius}
      />
      <DialRoot position="bottom-right" theme="dark" productionEnabled />
    </main>
  );
}
