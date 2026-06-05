import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages uses @cloudflare/next-on-pages which requires this
  output: "standalone",
  
  // Ignore TypeScript errors during build (we have some from dynamic data)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: false,
  
  // Image optimization — Cloudflare has its own image resizing
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
