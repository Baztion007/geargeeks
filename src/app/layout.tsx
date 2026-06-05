import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GearGeekz — Expert Reviews. Smart Recommendations.",
    template: "%s | GearGeekz",
  },
  description:
    "Premium product reviews and buying guides to help you discover the right gear. We research, test, and compare travel gear, electronics, home office, fitness, and more.",
  keywords: [
    "product reviews",
    "travel gear reviews",
    "best travel gadgets",
    "electronics reviews",
    "headphone reviews",
    "standing desk reviews",
    "fitness tracker reviews",
    "buying guides",
    "gear recommendations",
    "GearGeekz",
    "best travel gear 2026",
    "gear comparison",
    "expert product testing",
    "unbiased reviews",
  ],
  authors: [{ name: "GearGeekz", url: "https://geargeekz.com" }],
  creator: "GearGeekz",
  publisher: "GearGeekz",
  metadataBase: new URL("https://geargeekz.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "GearGeekz — Expert Reviews. Smart Recommendations.",
    description:
      "Premium product reviews and buying guides to help you discover the right gear for your life.",
    siteName: "GearGeekz",
    type: "website",
    url: "https://geargeekz.com",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GearGeekz — Expert Reviews. Smart Recommendations.",
    description:
      "Premium product reviews and buying guides to help you discover the right gear for your life.",
    creator: "@geargeekz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Product Reviews & Buying Guides",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#eaeded] text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
