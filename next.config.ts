import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages uses @cloudflare/next-on-pages which requires standalone output
  output: "standalone",

  reactStrictMode: false,

  // Disable Next.js Image Optimization — Cloudflare Workers doesn't support it.
  // We use plain <img> tags and a custom LqipImage component instead.
  images: {
    unoptimized: true,
  },

  // Allowed dev origins for the sandbox (development only)
  ...(process.env.NODE_ENV === 'development'
    ? {
        allowedDevOrigins: ['.space-z.ai'],
      }
    : {}),
};

export default nextConfig;
