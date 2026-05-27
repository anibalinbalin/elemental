import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    preloadEntriesOnStart: false,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
