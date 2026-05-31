"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * "Deporte" card in the Ciencia cotidiana grid — a three-layer Paper composite:
 *   1. the bloom photo (base)
 *   2. Dithering / simplex (file BZ-0), mixBlendMode "color" → tints it purple
 *   3. GodRays (file BW-0), mixBlendMode "screen" → glowing light beams on top
 * The GodRays export carried an opaque bg + no blend; we drop the bg and
 * screen-blend so the rays add light over the layers beneath instead of
 * covering them. Loaded client-only over the photo; pauses under
 * prefers-reduced-motion.
 */
const BG = "/images/deporte.webp";

const Dithering = dynamic(
  () =>
    import("@paper-design/shaders-react").then((m) => ({
      default: m.Dithering,
    })),
  { ssr: false },
);

const GodRays = dynamic(
  () =>
    import("@paper-design/shaders-react").then((m) => ({
      default: m.GodRays,
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
        speed={reducedMotion ? 0 : 0.1}
        shape="simplex"
        type="2x2"
        size={6}
        scale={1.41}
        frame={170553.15}
        colorBack="#00000000"
        colorFront="#27006B"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#260C6D",
          mixBlendMode: "color",
          height: "100%",
          width: "100%",
        }}
      />
      <GodRays
        offsetX={-0.83}
        offsetY={-0.9}
        intensity={0.47}
        spotty={0.23}
        midSize={0}
        midIntensity={0.56}
        density={0.04}
        bloom={0.09}
        speed={reducedMotion ? 0 : 0.31}
        scale={0.55}
        frame={508346.268}
        colorBack="#00000000"
        colors={["#148EFFA6", "#C4DFFEBE", "#232A47"]}
        colorBloom="#785A7B"
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "screen",
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}
