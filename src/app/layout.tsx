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
  title: "GearScope — Expert Reviews. Smart Recommendations.",
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
    "GearScope",
  ],
  authors: [{ name: "GearScope" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "GearScope — Expert Reviews. Smart Recommendations.",
    description:
      "Premium product reviews and buying guides to help you discover the right gear for your life.",
    siteName: "GearScope",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GearScope — Expert Reviews. Smart Recommendations.",
    description:
      "Premium product reviews and buying guides to help you discover the right gear for your life.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
