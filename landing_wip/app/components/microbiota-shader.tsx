"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { InViewMount } from "./in-view-mount";
import { ImageLoupe } from "./image-loupe";

/**
 * Paper composite for the "Todo empieza en la microbiota" section (files IG-0 /
 * IH-0): the EB thistle photo with a PerlinNoise soft-light overlay over #632AD5.
 * Same treatment as the hero — container at Paper's node aspect (5233/7361), and
 * the noise is world-locked to that node so the grain stays fine (not tied to our
 * smaller element). Loaded client-only over the photo; pauses under reduced motion;
 * the shader only mounts while the panel is near the viewport.
 */
const BG = "/images/microbiota-paper.webp";

const PerlinNoise = dynamic(
  () =>
    import("@paper-design/shaders-react").then((m) => ({
      default: m.PerlinNoise,
    })),
  { ssr: false },
);

export function MicrobiotaShader({
  className,
  loupeHidden = false,
}: {
  className?: string;
  loupeHidden?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  return (
    // Outer box owns the layout (aspect + rounded class) but does NOT clip, so the
    // loupe can sit ON the card with its full bezel visible past the image edges.
    <div
      className={className}
      style={{ position: "relative", aspectRatio: "5233 / 7361" }}
    >
      {/* Clipped visual layer: Paper photo + soft-light noise, rounded to the card. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: "inherit",
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
        }}
      >
        <InViewMount>
          <PerlinNoise
            speed={reducedMotion ? 0 : 0.5}
            scale={1}
            proportion={0.35}
            softness={0.11}
            octaveCount={1}
            lacunarity={1.5}
            persistence={1}
            colorBack="#00000000"
            colorFront="#FCCFF7"
            // Lock the noise to Paper's 5233x7361 world so the grain matches Paper
            // instead of being coarsened by our smaller element (same fix as hero).
            fit="cover"
            worldWidth={5233}
            worldHeight={7361}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "#632AD5",
              mixBlendMode: "soft-light",
            }}
          />
        </InViewMount>
      </div>
      {/* Microscope loupe — rests on top of the card, never clipped by its edges. */}
      <ImageLoupe src={BG} hidden={loupeHidden} />
    </div>
  );
}
