'use client';

import React from 'react';
import { useRouterStore } from '@/lib/router';
import { Shield, Award, RefreshCw, Search } from 'lucide-react';

export function Footer() {
  const goHome = useRouterStore((s) => s.goHome);
  const goToPage = useRouterStore((s) => s.goToPage);
  const goToWishlist = useRouterStore((s) => s.goToWishlist);
  const navigate = useRouterStore((s) => s.navigate);

  const footerLinks = {
    'Get to Know Us': [
      { label: 'About BrewHub', action: () => goToPage('about') },
      { label: 'Wishlist', action: () => goToWishlist() },
      { label: 'Editorial Policy', action: () => goToPage('editorial-policy') },
      { label: 'How We Test', action: () => goToPage('how-we-test') },
      { label: 'Contact Us', action: () => goToPage('contact') },
    ],
    'Categories': [
      { label: 'Espresso Machines', action: () => navigate({ page: 'category', slug: 'espresso-machines' }) },
      { label: 'Coffee Grinders', action: () => navigate({ page: 'category', slug: 'coffee-grinders' }) },
      { label: 'Pour-Over & Drip', action: () => navigate({ page: 'category', slug: 'pour-over-drip' }) },
      { label: 'Kettles', action: () => navigate({ page: 'category', slug: 'kettles' }) },
      { label: 'French Press', action: () => navigate({ page: 'category', slug: 'french-press' }) },
    ],
    'Legal': [
      { label: 'Privacy Policy', action: () => goToPage('privacy') },
      { label: 'Terms of Service', action: () => goToPage('terms') },
      { label: 'Affiliate Disclosure', action: () => goToPage('about') },
    ],
  };

  return (
    <footer className="bg-[#232f3e] text-gray-300">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-[#37475a] hover:bg-[#485769] text-white text-sm py-3 transition-colors"
      >
        Back to top
      </button>

      {/* Trust badges */}
      <div className="bg-[#37475a] py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Search, label: 'Researched Products', desc: '100+ products tested' },
              { icon: Award, label: 'Expert Recommendations', desc: 'By certified specialists' },
              { icon: RefreshCw, label: 'Updated Regularly', desc: 'Reviews kept current' },
              { icon: Shield, label: 'Independent Reviews', desc: 'Unbiased & honest' },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-1">
                <badge.icon className="text-[#febd69]" size={24} />
                <span className="text-white text-sm font-semibold">{badge.label}</span>
                <span className="text-gray-400 text-xs">{badge.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-bold mb-3 text-sm">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
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

      {/* Affiliate disclosure */}
      <div className="border-t border-gray-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-[#131921] rounded-lg p-4 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Affiliate Disclosure:</strong> As an Amazon Associate I earn from qualifying purchases. 
              BrewHub Reviews is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program 
              designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. 
              Our recommendations are based on research, comparison, and editorial evaluation. Affiliate commissions do not 
              influence our rankings or recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#131921] py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <button onClick={goHome} className="text-white font-bold text-lg">
            Brew<span className="text-[#febd69]">Hub</span>
          </button>
          <p className="text-gray-500 text-xs text-center">
            © {new Date().getFullYear()} BrewHub Reviews. All rights reserved. 
            All product names, logos, and brands are property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
