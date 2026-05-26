"use client";

import { Suspense, lazy } from "react";
const PouchViewer = lazy(() => import("./pouch-viewer"));

export default function Test4Page() {
  return (
    <div className="relative w-screen h-screen bg-[#F5F5F5]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
            Loading model...
          </div>
        }
      >
        <PouchViewer />
      </Suspense>
    </div>
  );
}
