"use client";

// A/B adapter: drops the new loupe-original (marj) loupe onto the homepage
// microbiota card in place of the production ImageLoupe, so the two can be
// compared on a real GPU in the live page. Reached via ?loupe=marj — lazy
// imported so it never loads three/framer for the default (prod) page.
//
// The marj Loupe expects a "stamp" image element + an isZoomed store + a
// dragConstraints container. We feed it the card itself and the real microbiota
// image in `cover` mode so the lens content registers 1:1 with the card behind.
import { useEffect } from "react";

import Loupe from "./loupe-original/Loupe";
import { useStampStore, type Stamp } from "./loupe-original/deps";

export default function MicrobiotaLoupeMarj({
  src,
  containerRef,
  hidden = false,
}: {
  src: string;
  containerRef: React.RefObject<HTMLElement | null>;
  hidden?: boolean;
}) {
  const setZoomed = useStampStore((s) => s.setZoomed);

  // The marj loupe is gated on isZoomed (it fades/blurs in). Keep it on while the
  // card is visible; drop it when an overlay (formula sheet) asks the loupe to hide.
  useEffect(() => {
    setZoomed(!hidden);
  }, [hidden, setZoomed]);
  useEffect(() => () => setZoomed(false), [setZoomed]);

  const stamp: Stamp = { id: "microbiota", src, srcLg: src };

  return (
    <>
      {/* Invisible source element the loupe queries to confirm a stamp exists.
          In cover mode its size is unused (the draw reads the image's natural
          dimensions), so opacity:0 is enough. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-slot="stamp-image"
        src={src}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      <Loupe
        selectedStamp={stamp}
        dragConstraints={containerRef}
        activeStampContainerRef={containerRef}
        baseScale={1}
        gridCellSize={40}
        sourceFit="cover"
        livingNoise
      />
    </>
  );
}
