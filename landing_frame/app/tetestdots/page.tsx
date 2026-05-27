"use client";

import { Suspense, lazy } from "react";

const TextureParticles = lazy(() => import("./texture-particles"));

export default function TetestdotsPage() {
  return (
    <div className="relative h-screen w-screen bg-[#0a0a0c]">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            Loading particles...
          </div>
        }
      >
        <TextureParticles />
      </Suspense>
    </div>
  );
}
