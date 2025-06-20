/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignores lint errors on build (especially useful for Vercel)
  },
  // other config options can go here
};

export default nextConfig; 