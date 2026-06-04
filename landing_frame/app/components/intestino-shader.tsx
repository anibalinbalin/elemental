"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const BG = "/images/intestino.webp";

const SmokeRing = dynamic(
  () =>
    import("@paper-design/shaders-react").then((m) => ({
      default: m.SmokeRing,
    })),
  { ssr: false },
);

const GrainGradient = dynamic(
  () =>
    import("@paper-design/shaders-react").then((m) => ({
      default: m.GrainGradient,
    })),
  { ssr: false },
);

export function IntestinoShader({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={className}
      style={{
        position: "relative",
        aspectRatio: "16/10",
        overflow: "hidden",
        backgroundImage: `url(${BG})`,
        backgroundSize: "cover",
        backgroundPosition: "50%",
      }}
    >
      <SmokeRing
        speed={reducedMotion ? 0 : 0.29}
        scale={1.06}
        thickness={0.65}
        radius={0.67}
        innerShape={1.07}
        noiseScale={3.78}
        noiseIterations={3}
        offsetX={0}
        offsetY={0}
        colors={["#D296E2"]}
        colorBack="#00000000"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${BG})`,
          backgroundPosition: "50%",
          backgroundSize: "cover",
          height: "100%",
          width: "100%",
        }}
      />
      <GrainGradient
        speed={reducedMotion ? 0 : 1}
        scale={0.76}
        rotation={0}
        offsetX={0}
        offsetY={0}
        softness={1}
        intensity={1}
        noise={1}
        shape="corners"
        colors={["#7300FF", "#EBA8FF", "#00BFFF", "#2A00FF"]}
        colorBack="#00000000"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000000",
          mixBlendMode: "screen",
          opacity: 0.4,
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}
