"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

// The microbiota "microscope" loupe (loupe-original): a WebGL glass lens with a
// real winder dial and a living shimmer. Lazy-loaded so its three.js /
// framer-motion deps and the hi-res source only fetch client-side when the
// section is reached, never on the initial homepage paint.
const MicrobiotaLoupeMarj = dynamic(() => import("./microbiota-loupe-marj"), {
  ssr: false,
});

// The EB-web-02 microbiota visual — the purple, motion-blurred microscopy circle
// straight from the Figma file. Shown true (no soft-light composite) inside the
// circular frame, with the interactive loupe magnifier resting on top.
const BG = "/images/microbiota-figma.webp";

export function MicrobiotaShader({
  className,
  loupeHidden = false,
  aspect = "5233 / 7361",
}: {
  className?: string;
  loupeHidden?: boolean;
  /** Container aspect ratio. Pass "1 / 1" for the circular microbiota frame. */
  aspect?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    // Outer box owns the layout (aspect + rounded class) but does NOT clip, so the
    // loupe can sit ON the card with its full bezel visible past the image edges.
    <div
      ref={cardRef}
      className={className}
      style={{ position: "relative", aspectRatio: aspect }}
    >
      {/* Clipped visual layer: the Figma microbiota image, rounded to the frame. */}
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
      />
      {/* Microscope loupe — rests on top of the image, never clipped by its edges. */}
      <MicrobiotaLoupeMarj src={BG} containerRef={cardRef} hidden={loupeHidden} />
    </div>
  );
}
