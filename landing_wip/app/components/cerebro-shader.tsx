"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Dithering shader (lavender dots) over a brain/neural photo, tuned in Paper
 * (file BQ-0). Fills the "Cerebro" card in the Ciencia cotidiana grid. Loaded
 * client-only over a CSS-background fallback; pauses under prefers-reduced-motion.
 */
const BG = "/images/cerebro.webp";

const Dithering = dynamic(
  () =>
    import("@paper-design/shaders-react").then((m) => ({
      default: m.Dithering,
    })),
  { ssr: false },
);

export function CerebroShader({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={className}
      style={{
        aspectRatio: "16/10",
        overflow: "hidden",
        backgroundImage: `url(${BG})`,
        backgroundSize: "cover",
        backgroundPosition: "50%",
      }}
    >
      <Dithering
        speed={reducedMotion ? 0 : 0.26}
        shape="dots"
        type="4x4"
        size={1.4}
        scale={1.14}
        colorBack="#00000000"
        colorFront="#C4B3E4"
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
