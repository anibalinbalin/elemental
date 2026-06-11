"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Loupe from "@/app/components/loupe-original/Loupe";
import { useStampStore, type Stamp } from "@/app/components/loupe-original/deps";

/**
 * Standalone demo of the UNMODIFIED marj "stamps" loupe (Loupe + Lens + Dial +
 * store), vendored under app/components/loupe-original/ and fed the microbiota
 * image as its "stamp". Presented the way the original does it — the image on a
 * grid, the full ticked dial as the zoom control. This is purely for A/B
 * comparison against the grafted loupe on the homepage; it is not wired into the
 * landing page.
 *
 * Drag the lens to pan; drag the small handle on the dial ring to zoom (1–3×);
 * arrow keys pan when the lens is focused.
 */
const IMG = "/images/microbiota-paper.webp";
const stamp: Stamp = { id: "microbiota", src: IMG, srcLg: IMG };

export default function LoupeOriginalPage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const setZoomed = useStampStore((s) => s.setZoomed);

  // The original gets isZoomed from the stamps store; switch it on for the demo.
  useEffect(() => {
    setZoomed(true);
    return () => setZoomed(false);
  }, [setZoomed]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 40,
        background: "#fffff9",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 640 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
          Original marj loupe (unmodified)
        </h1>
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          Drag the lens to pan · drag the small handle on the outer ring to zoom · arrow keys pan.
          Compare against the homepage graft at{" "}
          <code>/?loupe=glass#microbiota</code>.
        </p>
      </div>

      {/* Stage = the loupe's dragConstraints. Grid background mirrors the grid the
          loupe draws into its own sampled canvas, so page and lens agree. */}
      <div
        ref={stageRef}
        style={
          {
            position: "relative",
            width: 660,
            height: 780,
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "#f5f5f4",
            backgroundImage:
              "linear-gradient(#d6d3d1 1px, transparent 1px), linear-gradient(90deg, #d6d3d1 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            boxShadow: "0 1px 0 rgba(255,255,255,0.6), 0 18px 40px rgba(26,24,22,0.14)",
          } as CSSProperties
        }
      >
        {/* The "stamp": data-slot is how the loupe finds it to size + draw it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-slot="stamp-image"
          src={IMG}
          alt="Microbiota"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 380,
            height: "auto",
            filter: "drop-shadow(0 0 20px rgba(0,0,0,0.25))",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        <Loupe
          selectedStamp={stamp}
          dragConstraints={stageRef}
          activeStampContainerRef={stageRef}
          baseScale={1}
          gridCellSize={40}
        />
      </div>
    </main>
  );
}
