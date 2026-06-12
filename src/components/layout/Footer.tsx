'use client';

import React from 'react';
import { useRouterStore } from '@/lib/router';
import { Twitter, Github, Youtube, Rss } from 'lucide-react';
import { assetUrl } from '@/lib/utils';

export function Footer() {
  const goHome = useRouterStore((s) => s.goHome);
  const goToPage = useRouterStore((s) => s.goToPage);
  const goToWishlist = useRouterStore((s) => s.goToWishlist);
  const goToBestSellers = useRouterStore((s) => s.goToBestSellers);
  const goToDeals = useRouterStore((s) => s.goToDeals);
  const navigate = useRouterStore((s) => s.navigate);

  const footerLinks = {
    'Get to Know Us': [
      { label: 'About GearGeekz', action: () => goToPage('about') },
      { label: 'Wishlist', action: () => goToWishlist() },
      { label: 'Editorial Policy', action: () => goToPage('editorial-policy') },
      { label: 'How We Test', action: () => goToPage('how-we-test') },
      { label: 'Contact Us', action: () => goToPage('contact') },
    ],
    'Shop': [
      { label: 'Best Sellers', action: () => goToBestSellers() },
      { label: 'Deals', action: () => goToDeals() },
      { label: 'Trending', action: () => goToPage('trending') },
      { label: 'Roundups', action: () => goToPage('roundups') },
      { label: 'Buying Guides', action: () => goToPage('guides') },
    ],
    'Categories': [
      { label: 'Travel Gear', action: () => navigate({ page: 'category', slug: 'travel-gear' }) },
      { label: 'Travel Gadgets', action: () => navigate({ page: 'category', slug: 'travel-gadgets' }) },
      { label: 'Electronics', action: () => navigate({ page: 'category', slug: 'electronics' }) },
      { label: 'Home & Office', action: () => navigate({ page: 'category', slug: 'home-office' }) },
      { label: 'Fitness', action: () => navigate({ page: 'category', slug: 'fitness' }) },
    ],
    'Legal': [
      { label: 'Privacy Policy', action: () => goToPage('privacy') },
      { label: 'Terms of Service', action: () => goToPage('terms') },
      { label: 'Affiliate Disclosure', action: () => goToPage('about') },
    ],
  };

  return (
    <footer className="bg-[#232f3e] text-gray-300 relative wave-separator">
      {/* Top gradient border — warm amber accent gradient */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-[#37475a] hover:bg-[#485769] text-white text-sm py-3.5 transition-all duration-200 hover:shadow-inner"
      >
        Back to top
      </button>

      {/* Footer links — centered */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center justify-items-center">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col items-center">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">{title}</h3>
              <div className="h-0.5 w-10 bg-gradient-to-r from-[#febd69] to-transparent mb-3 rounded-full" />
              <ul className="space-y-2 flex flex-col items-center">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="text-gray-400 hover:text-[#febd69] text-sm transition-colors duration-200 amazon-link py-0.5 footer-link-hover whitespace-nowrap"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent" />

      {/* Newsletter section with premium animated background */}
      <div className="newsletter-premium-bg py-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#febd69]/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#febd69]/15 border border-[#febd69]/20 flex items-center justify-center gentle-float">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#febd69" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Get the GearGeekz Newsletter</h3>
                <p className="text-gray-400 text-sm">Weekly reviews, guides, and exclusive recommendations</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-72 px-4 py-3 rounded-xl bg-[#232f3e] border border-gray-600 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#febd69] focus:ring-2 focus:ring-[#febd69]/20 transition-all"
              />
              <button
                onClick={() => {
                  const el = document.querySelector('footer input[type="email"]') as HTMLInputElement;
                  if (el?.value) {
                    fetch('/api/newsletter', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: el.value.trim() }),
                    }).then(() => { el.value = ''; });
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#febd69] to-[#f3a847] text-[#131921] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cta-primary"
              >
                Subscribe Free
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate disclosure */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[#131921] rounded-xl p-5 text-center border border-gray-700/30">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Affiliate Disclosure:</strong> GearGeekz earns commissions from qualifying purchases through affiliate links on this site.
              We participate in affiliate programs with Amazon, Walmart, Best Buy, and other retailers. Our recommendations are based on research,
              comparison, and editorial evaluation. Affiliate commissions do not influence our rankings or recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar with social links */}
      <div className="bg-[#131921] py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button onClick={goHome} className="text-white font-bold text-lg hover:opacity-80 transition-opacity">
            Gear<span className="gradient-text">Geekz</span>
          </button>
          {/* Social media icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://twitter.com/geargeekz"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#232f3e]/80 hover:bg-[#1da1f2]/20 flex items-center justify-center text-gray-400 hover:text-[#1da1f2] transition-all duration-200 hover:scale-110"
              aria-label="Follow us on X / Twitter"
            >
              <Twitter size={16} />
            </a>
            <a
              href="https://youtube.com/@geargeekz"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#232f3e]/80 hover:bg-[#ff0000]/15 flex items-center justify-center text-gray-400 hover:text-[#ff0000] transition-all duration-200 hover:scale-110"
              aria-label="Subscribe on YouTube"
            >
              <Youtube size={16} />
            </a>
            <a
              href="https://github.com/geargeekz"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#232f3e]/80 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
              aria-label="Star us on GitHub"
            >
              <Github size={16} />
            </a>
            <a
              href={assetUrl("/rss.xml")}
              className="w-9 h-9 rounded-full bg-[#232f3e]/80 hover:bg-[#febd69]/15 flex items-center justify-center text-gray-400 hover:text-[#febd69] transition-all duration-200 hover:scale-110"
              aria-label="RSS Feed"
            >
              <Rss size={16} />
            </a>
          </div>
          <p className="text-gray-500 text-xs text-center">
            © {new Date().getFullYear()} GearGeekz. All rights reserved.
            All product names, logos, and brands are property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
