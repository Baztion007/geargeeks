import type { NextConfig } from "next";

// ─── Deployment Target Detection ──────────────────────────────────────────────
const isStaticExport = process.env.STATIC_EXPORT === "true";
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

const nextConfig: NextConfig = {
  // ─── Output Mode ──────────────────────────────────────────────────────────
  ...(isStaticExport
    ? { output: "export" as const }
    : isVercel
      ? {}
      : { output: "standalone" as const }
  ),

  reactStrictMode: false,

  // Disable Next.js Image Optimization — not supported on Cloudflare Workers
  images: {
    unoptimized: true,
  },

  // ─── Server External Packages ────────────────────────────────────────────
  serverExternalPackages: ["sharp"],

  // ─── GitHub Pages base path ───────────────────────────────────────────────
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

// ─── OpenNext Cloudflare Initialization ────────────────────────────────────
if (!isStaticExport && !isVercel && process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev()).catch(() => {});
}
