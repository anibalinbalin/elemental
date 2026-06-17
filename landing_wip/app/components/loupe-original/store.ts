"use client";

// Verbatim from the marj loupe (Loupe/store.tsx): lens coords + scale, shared
// between Loupe (writes) and Lens (reads in useFrame).
import { create } from "zustand";

export interface LoupeStore {
  coords: { x: number; y: number };
  angle: number;
  scale: number;
  setCoords: (coords: { x: number; y: number }) => void;
  setAngle: (angle: number) => void;
  setScale: (scale: number) => void;
}

export const useLoupeStore = create<LoupeStore>((set) => ({
  coords: { x: 0, y: 0 },
  angle: 0,
  scale: 1,
  setCoords: (coords) => set({ coords }),
  setAngle: (angle) => set({ angle }),
  setScale: (scale) => set({ scale }),
}));

// Note: default scale lives in the store init above (`scale: 1`). It opens at the
// dial minimum so the user has the full 1..8× range to zoom in (see Loupe.tsx).
// Crisp deep into the range now that the loupe samples the 3000px hi-res source.
