"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Truchet grain shader composited over the bloom photo, tuned in Paper
 * (file BC-0). Replaces the static microbiota image. The shader draws to a
 * WebGL canvas, so it's loaded client-only over a CSS-background fallback
 * (the same photo) and pauses under prefers-reduced-motion.
 */
const BG = "/images/microbiota-bloom.webp";

const GrainGradient = dynamic(
  () =>
    import("@paper-design/shaders-react").then((m) => ({
      default: m.GrainGradient,
    })),
  { ssr: false },
);

export function MicrobiotaShader({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={className}
      style={{
        aspectRatio: "4/5",
        overflow: "hidden",
        backgroundImage: `url(${BG})`,
        backgroundSize: "cover",
        backgroundPosition: "50%",
      }}
    >
      <GrainGradient
        speed={reducedMotion ? 0 : 1.69}
        scale={3.12}
        rotation={0}
        offsetX={-0.52}
        offsetY={-0.81}
        softness={1}
        intensity={1}
        noise={0.19}
        shape="truchet"
        colors={["#90AF3E", "#476F2F", "#ABED73"]}
        colorBack="#00000000"
        style={{
          backgroundImage: `url(${BG})`,
          backgroundPosition: "50%",
          backgroundSize: "cover",
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}
