"use client";

// Faithful port of the marj loupe Dial (Loupe/Dial.tsx). Only the imports are
// rewired to local deps / the project's cn helper; logic and SVG are unchanged.
import { motion, useMotionValue, useSpring } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { remap, useIsMobile } from "./deps";

interface Props {
  size: number;
  tickCount: number;
  tickLength: number;
  tickWidth: number;
  tickColor: string;
  snapAngle?: number;
  stiffness?: number;
  damping?: number;
  onAngleChange?: (angle: number) => void;
  inscription: string;
  minAngle?: number;
  maxAngle?: number;
  className?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export default function Dial({
  size: requestedSize,
  tickCount: requestedTickCount,
  tickLength,
  tickWidth,
  tickColor,
  inscription,
  value,
  onChange,
  minAngle,
  maxAngle,
  minValue,
  maxValue,
  step,
  stiffness = 500,
  damping = 50,
  onAngleChange,
  className,
  disabled,
}: Props) {
  const isMobile = useIsMobile();

  const padding = isMobile ? 14 : 20;
  const size = requestedSize - padding * 2;

  const tickCount = Math.floor(requestedTickCount / 5) * 5 - 1;
  const snapAngle = 360 / tickCount;

  const rotation = useMotionValue(
    remap(value ?? 0, minValue ?? 1, maxValue ?? 2, minAngle ?? 0, maxAngle ?? 360),
  );
  const rotationSpring = useSpring(rotation, { stiffness, damping });
  const dialRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const lastAngle = useRef(0);
  const activePointerId = useRef<number | null>(null);
  const pointerTarget = useRef<
    (EventTarget & { releasePointerCapture?: (pointerId: number) => void }) | null
  >(null);

  const center = requestedSize / 2;
  const radius = size / 2;

  const calculateAngle = useCallback(
    (clientX: number, clientY: number) => {
      if (!dialRef.current) {
        return 0;
      }

      const rect = dialRef.current.getBoundingClientRect();
      const x = clientX - (rect.left + center);
      const y = clientY - (rect.top + center);
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = (angle + 360) % 360; // Normalize to 0-360

      // Snap to nearest multiple of snapAngle
      return Math.round(angle / snapAngle) * snapAngle;
    },
    [center, snapAngle],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation?.();

      isDragging.current = true;
      activePointerId.current = e.pointerId;
      lastAngle.current = calculateAngle(e.clientX, e.clientY);
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture?.(e.pointerId);
      pointerTarget.current = target;
    },
    [calculateAngle],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (
        !isDragging.current ||
        (activePointerId.current !== null && e.pointerId !== activePointerId.current)
      ) {
        return;
      }

      const currentAngle = calculateAngle(e.clientX, e.clientY);
      let deltaAngle = currentAngle - lastAngle.current;

      // Adjust for crossing 0/360 boundary
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      const newAngle = rotation.get() + deltaAngle;

      if (
        minAngle !== undefined &&
        maxAngle !== undefined &&
        (newAngle < minAngle || newAngle > maxAngle)
      ) {
        return;
      }

      onAngleChange?.(newAngle);

      const newValue = remap(newAngle, minAngle ?? 0, maxAngle ?? 360, minValue ?? 1, maxValue ?? 2);
      onChange?.(newValue);

      rotation.set(newAngle);
      lastAngle.current = currentAngle;
    },
    [calculateAngle, minAngle, maxAngle, onAngleChange, rotation, minValue, maxValue, onChange],
  );

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (activePointerId.current !== null && e.pointerId !== activePointerId.current) {
      return;
    }
    isDragging.current = false;
    activePointerId.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const radius2 = size / 2 + (isMobile ? 8 : 12); // Increased radius by 10

    const angleOffset = snapAngle; // One step offset
    const angle = (i / tickCount) * 360 - angleOffset;

    const radians = (angle * Math.PI) / 180;
    const isLongTick = i % 5 === 0;

    const x1 = center + (radius2 - tickLength) * Math.cos(radians);
    const y1 = center + (radius2 - tickLength) * Math.sin(radians);
    const x2 = center + (isLongTick ? radius2 + tickLength * 0.5 : radius2) * Math.cos(radians);
    const y2 = center + (isLongTick ? radius2 + tickLength * 0.5 : radius2) * Math.sin(radians);

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={i === 0 ? "transparent" : tickColor}
        strokeWidth={tickWidth}
      />
    );
  });

  const cx = center;
  const cy = center;

  useEffect(() => {
    if (value) {
      rotation.set(remap(value, minValue ?? 1, maxValue ?? 2, minAngle ?? 0, maxAngle ?? 360));
    }
  }, [value, minValue, maxValue, minAngle, maxAngle, rotation]);

  const fontSize = isMobile ? 6 : 10;
  const textRadius = isMobile ? radius - 2 : radius - 8;
  const highlightRadius = isMobile ? radius - 10 : radius - 22;
  const baseRadius = isMobile ? radius - 4 : radius - 10;
  const textOffset = isMobile ? 250 : 550;

  const handleRadius = 20; // radius of the invisible group-sizing circle

  // Zoom knob: the production loupe's external "winder" wing — a dark-metal
  // teardrop tab that juts OUT past the bezel rim. Ported from image-loupe.tsx and
  // re-authored against this dial's radius so it scales (desktop/mobile). It orbits
  // with the value (drag to zoom). P(xOffset, radialOut) maps a prod-space point
  // (relative to its 200px rim) into this dial: x from center, +radialOut = outward.
  const edgeR = requestedSize / 2; // bezel outer rim, from center
  const sc = edgeR / 200; // the prod wing was authored for a 200px-radius dial
  const P = (xo: number, ro: number) => `${cx + xo * sc} ${-ro * sc}`;
  const wingSurface = `M ${P(-10, -6)} C ${P(-13, 2)}, ${P(-8, 18)}, ${P(0, 24)} C ${P(8, 18)}, ${P(13, 2)}, ${P(10, -6)} Q ${P(4, -2)}, ${P(0, -1)} Q ${P(-4, -2)}, ${P(-10, -6)} Z`;
  const wingHighlightPath = `M ${P(-7, -4)} C ${P(-9, 2)}, ${P(-5, 14)}, ${P(0, 18)} C ${P(5, 14)}, ${P(9, 2)}, ${P(7, -4)} Q ${P(3, -2)}, ${P(0, -1)} Q ${P(-3, -2)}, ${P(-7, -4)} Z`;
  const wingLinePath = `M ${P(-8, -5)} C ${P(-10, -1)}, ${P(-6, 8)}, ${P(0, 12)} C ${P(6, 8)}, ${P(10, -1)}, ${P(8, -5)}`;
  const wingHitR = isMobile ? 16 : 24; // generous drag target over the wing

  return (
    <div className={cn("group select-none [&:has(:focus-visible)_.handle]:fill-stone-50", className)}>
      <input
        type="range"
        min={minValue}
        max={maxValue}
        step={step}
        value={value}
        aria-label="Loupe scale"
        className="sr-only"
        onChange={(e) => {
          const newValue = Number(e.target.value);
          if (!Number.isFinite(newValue)) {
            return;
          }
          onChange?.(newValue);
          const angle = remap(newValue, minValue ?? 1, maxValue ?? 2, minAngle ?? 0, maxAngle ?? 360);
          onAngleChange?.(angle);
        }}
        disabled={disabled}
      />

      <svg
        ref={dialRef}
        width={requestedSize}
        height={requestedSize}
        className="pointer-events-none select-none"
        style={{ overflow: "visible" }} // let the zoom notch protrude past the rim
        viewBox={`0 0 ${requestedSize} ${requestedSize}`}
      >
        <motion.g style={{ rotate: rotationSpring }}>{ticks}</motion.g>

        <motion.g style={{ rotate: rotationSpring, transformOrigin: "center center" }}>
          {/* invisible circle keeps the group's bbox centered so it rotates about the dial center */}
          <circle cx={center} cy={center} r={radius + padding + handleRadius} fill="none" />

          {/* external winder wing (ported from the production loupe) */}
          <g filter="url(#wing-shadow)">
            <path
              className="handle"
              d={wingSurface}
              fill="url(#wing-surface)"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={0.6}
            />
            <path d={wingHighlightPath} fill="url(#wing-highlight)" />
            <path
              d={wingLinePath}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={0.6}
            />
          </g>

          {/* drag target over the wing */}
          <circle
            className={cn("pointer-events-auto cursor-grab touch-none active:cursor-grabbing", {
              "pointer-events-none": disabled,
            })}
            onPointerDown={handlePointerDown}
            cx={cx}
            cy={-9 * sc}
            r={wingHitR}
            fill="transparent"
          />
        </motion.g>
        <circle
          cx={center}
          cy={center}
          r={radius + 2}
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1}
        />
        <circle
          cx={center}
          cy={center}
          r={baseRadius}
          fill="none"
          stroke="rgba(0,0,0,0.75)"
          filter="url(#blur-5)"
          className="base"
          strokeWidth={4}
        />

        <circle
          cx={center}
          cy={center}
          r={highlightRadius}
          fill="none"
          className="highlight"
          stroke="white"
          filter="url(#blur-2)"
          strokeWidth={2}
        />
        <path
          stroke="transparent"
          fill="transparent"
          id="path"
          d={`
      M ${cx - textRadius}, ${cy}
      a ${textRadius},${textRadius} 0 1,0 ${textRadius * 2},0
      a ${textRadius},${textRadius} 0 1,0 ${textRadius * -2},0
    `}
        />
        <text style={{ fontSize }}>
          <textPath href="#path" startOffset={0} fill="rgba(255,255,255,0.75)">
            {inscription}
          </textPath>
          <textPath href="#path" startOffset={textOffset} fill="rgba(255,255,255,0.75)">
            {inscription}
          </textPath>
        </text>

        <defs>
          <filter id="blur-2">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <filter id="blur-5">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
          <linearGradient id="wing-surface" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a4540" />
            <stop offset="40%" stopColor="#2c2926" />
            <stop offset="100%" stopColor="#1a1816" />
          </linearGradient>
          <linearGradient id="wing-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <filter id="wing-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
