"use client";

/**
 * Small adapters so the vendored marj "stamps" Loupe runs unmodified inside
 * landing_wip. Everything here stands in for a `~/src/...` import in the
 * original project: math helpers, the mobile media hook, the grid-canvas
 * drawing utils, a local isZoomed store, and a no-op for the sound hook (the
 * original pulls in a whole audio engine we don't want here).
 */

import { useEffect, useState } from "react";
import { create } from "zustand";

// --- math (src/math.ts) ---
export function clamp(min: number, max: number, value: number) {
  return Math.min(Math.max(value, min), max);
}
export function remap(value: number, from1: number, to1: number, from2: number, to2: number) {
  return ((value - from1) / (to1 - from1)) * (to2 - from2) + from2;
}

// --- useIsMobile (src/hooks/useMatchMedia + Stamps/util) ---
export function useIsMobile(defaultState?: boolean) {
  const [state, setState] = useState(() => {
    if (defaultState !== undefined) return defaultState;
    if (typeof window !== "undefined") return window.matchMedia("(max-width: 1023px)").matches;
    return false;
  });
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setState(media.matches);
    setState(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return state;
}

// --- grid canvas helpers (CanvasGrid/util.ts) ---
export function setupHiDPICtx(canvas: HTMLCanvasElement, width: number, height: number, dpr = 1) {
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, dpr };
}

export type GridAlign = "top" | "center";
export type GridOptions = {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  lineWidth: number;
  background: string;
  foreground: string;
  align: GridAlign;
};

export function drawGrid(ctx: CanvasRenderingContext2D, opts: GridOptions) {
  const { width, height, cellWidth, cellHeight, lineWidth, background, foreground, align } = opts;
  const offsetX = (width % cellWidth) / 2;
  const offsetY = align === "center" ? (height % cellHeight) / 2 : 0;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  const half = lineWidth % 2 ? 0.5 : 0;
  for (let x = offsetX + cellWidth; x < width - offsetX; x += cellWidth) {
    const ax = x + half;
    ctx.moveTo(ax, half);
    ctx.lineTo(ax, height - half);
  }
  for (let y = offsetY + cellHeight; y < height - offsetY; y += cellHeight) {
    const ay = y + half;
    ctx.moveTo(half, ay);
    ctx.lineTo(width - half, ay);
  }
  ctx.strokeStyle = foreground;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  return ctx;
}

// --- sound (stubbed — original uses a custom audio engine) ---
export function usePlayLoupeZoomClick() {
  return () => {};
}

// --- isZoomed store (stands in for the stamps useStampStore) ---
interface ZoomStore {
  isZoomed: boolean;
  setZoomed: (v: boolean) => void;
}
export const useStampStore = create<ZoomStore>((set) => ({
  isZoomed: false,
  setZoomed: (v) => set({ isZoomed: v }),
}));

// --- minimal Stamp model (only the fields Loupe reads) ---
export interface Stamp {
  id: string;
  src: string;
  srcLg: string;
}
