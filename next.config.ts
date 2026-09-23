import type { NextConfig } from "next";

/**
 * Node-compatible Next.js config (Auth.js + Prisma need a server runtime).
 * Static GitHub Pages export was removed in Phase 3.
 */
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
