import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.10.11.186", "claude-code-sec.tailf626.ts.net"],
  experimental: {
    preloadEntriesOnStart: false,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
