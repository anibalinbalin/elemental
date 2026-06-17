import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.30",
    "10.10.11.186",
    "claude-code-sec.tailf626.ts.net",
  ],
  // Serve modern formats for any next/image usage.
  images: { unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Tree-shake the big drei barrel so the 3D chunk only pulls what it uses.
    optimizePackageImports: ["@react-three/drei"],
  },
};

export default nextConfig;
