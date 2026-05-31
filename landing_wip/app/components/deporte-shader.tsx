"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const BG = "/images/deporte-paper.webp";

const Dithering = dynamic(
  () =>
    import("@paper-design/shaders-react").then((m) => ({
      default: m.Dithering,
    })),
  { ssr: false },
);

export function DeporteShader({ className }: { className?: string }) {
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
      <Dithering
        speed={reducedMotion ? 0 : 0.32}
        shape="simplex"
        type="8x8"
        size={4.4}
        scale={1.31}
        colorBack="#00000000"
        colorFront="#D87FDE"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000000",
          mixBlendMode: "lighten",
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}
