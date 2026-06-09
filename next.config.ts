import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  // ─── Output Mode ──────────────────────────────────────────────────────────
  // STATIC_EXPORT=true → output: "export" (GitHub Pages, pure static HTML)
  // Default            → output: "standalone" (Cloudflare Pages via @cloudflare/next-on-pages)
  output: isStaticExport ? "export" : "standalone",

  reactStrictMode: false,

  // Disable Next.js Image Optimization — not supported on Cloudflare Workers
  // or GitHub Pages. We use plain <img> tags and a custom LqipImage component.
  images: {
    unoptimized: true,
  },

  // ─── GitHub Pages base path ───────────────────────────────────────────────
  // If your GitHub repo is at github.com/<user>/<repo>, set NEXT_PUBLIC_BASE_PATH=/<repo>
  // For example: NEXT_PUBLIC_BASE_PATH=/geargeekz
  // Leave empty for root deployment (custom domain or <user>.github.io)
  ...(isStaticExport && process.env.NEXT_PUBLIC_BASE_PATH
    ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH }
    : {}),

  // Allowed dev origins for the sandbox (development only)
  ...(process.env.NODE_ENV === 'development'
    ? {
        allowedDevOrigins: ['.space-z.ai'],
      }
    : {}),
};

export default nextConfig;
