import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignores lint errors on build (especially useful for Vercel)
  },
  // other config options can go here
};

export default nextConfig;
