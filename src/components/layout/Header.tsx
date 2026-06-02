'use client';

import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, X, ChevronDown, Heart, Percent, TrendingUp, MessageSquare, BookOpen, Info, Compass, Sun, Moon, Monitor } from 'lucide-react';
import { useRouterStore } from '@/lib/router';
import { useWishlistStore } from '@/lib/wishlist';
import { useThemeStore } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navItems = [
  { label: "Today's Deals", page: 'deals' as const, icon: Percent },
  { label: 'Best Sellers', page: 'best-sellers' as const, icon: TrendingUp },
  { label: 'Guides', page: 'guides' as const, icon: Compass },
  { label: 'Reviews', page: 'reviews' as const, icon: MessageSquare },
  { label: 'Blog', page: 'blog' as const, icon: BookOpen },
  { label: 'About', page: 'about' as const, icon: Info },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const navigate = useRouterStore((s) => s.navigate);
  const goHome = useRouterStore((s) => s.goHome);
  const goToSearch = useRouterStore((s) => s.goToSearch);
  const goToPage = useRouterStore((s) => s.goToPage);
  const goToWishlist = useRouterStore((s) => s.goToWishlist);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const themeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor;
  const ThemeIcon = themeIcon;
  const themeLabel = theme === 'dark' ? 'Light mode' : theme === 'light' ? 'Dark mode' : 'System theme';

  React.useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      goToSearch(searchQuery.trim());
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className={`z-50 transition-shadow duration-200 ${isSticky ? 'shadow-lg backdrop-blur-sm' : ''}`}>
      {/* Primary Header */}
      <div className="bg-[#131921]/98 backdrop-blur-sm text-white">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-[#37475a] rounded"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <button
              onClick={goHome}
              className="flex items-center gap-1 shrink-0 hover:outline hover:outline-1 hover:outline-white rounded p-1"
              aria-label="Go to homepage"
            >
              <div className="w-8 h-8 bg-[#febd69] rounded-full flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#131921" strokeWidth="2.5">
                  <path d="M18 8c0-3.3-2.7-6-6-6S6 4.7 6 8" />
                  <path d="M4 8h16l-1 13H5L4 8z" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Brew<span className="gradient-text">Hub</span>
              </span>
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-3xl">
              <div className="flex w-full">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coffee gear, reviews, and guides..."
                  className="rounded-r-none border-0 bg-white text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-[#febd69]/50 focus-visible:ring-offset-0 h-10 transition-shadow"
                  aria-label="Search"
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-[#febd69] hover:bg-[#f3a847] text-[#131921] px-4 h-10"
                  aria-label="Search"
                >
                  <Search size={20} />
                </Button>
              </div>
            </form>

            {/* Right section */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 hover:outline hover:outline-1 hover:outline-white rounded p-1 transition-all duration-200"
                aria-label={themeLabel}
                title={themeLabel}
              >
                <ThemeIcon size={22} className="text-[#febd69]" />
                <span className="text-[11px] text-gray-400 hidden xl:inline">{theme === 'system' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
              <button
                className="flex flex-col items-start hover:outline hover:outline-1 hover:outline-white rounded p-1 text-xs"
                onClick={() => goToPage('about')}
              >
                <span className="text-gray-300 text-[11px]">Hello, Sign in</span>
                <span className="font-bold text-sm flex items-center gap-0.5">
                  Account <ChevronDown size={12} />
                </span>
              </button>
              <button
                className="flex flex-col items-start hover:outline hover:outline-1 hover:outline-white rounded p-1 text-xs"
                onClick={() => goToPage('contact')}
              >
                <span className="text-gray-300 text-[11px]">Returns</span>
                <span className="font-bold text-sm">& Orders</span>
              </button>
              <button
                className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-white rounded p-1"
                onClick={goToWishlist}
                aria-label="Wishlist"
              >
                <div className="relative">
                  <Heart size={28} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#febd69] text-[#131921] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm hidden lg:block">Wishlist</span>
              </button>
              <button
                className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-white rounded p-1"
                aria-label="Shopping cart"
              >
                <div className="relative">
                  <ShoppingCart size={28} />
                  <span className="absolute -top-1 -right-1 bg-[#febd69] text-[#131921] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    0
                  </span>
                </div>
                <span className="font-bold text-sm hidden lg:block">Cart</span>
              </button>
            </div>
          </div>

          {/* Mobile search - more prominent */}
          <form onSubmit={handleSearch} className="sm:hidden mt-2">
            <div className="flex w-full">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coffee gear, reviews, and guides..."
                className="rounded-r-none border-0 bg-white text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-[#febd69]/50 focus-visible:ring-offset-0 h-11 text-sm transition-shadow"
                aria-label="Search mobile"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-[#febd69] hover:bg-[#f3a847] text-[#131921] px-4 h-11"
                aria-label="Search"
              >
                <Search size={20} />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="bg-[#232f3e] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="hidden md:flex items-center gap-1 h-10 text-sm" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  navigate({ page: item.page } as any);
                }}
                className="px-3 py-1 hover:outline hover:outline-1 hover:outline-white rounded text-gray-200 hover:text-white transition-colors amazon-link"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile nav menu - slide-in panel */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="md:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Slide-in panel */}
              <div className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-[#232f3e] text-white z-50 overflow-y-auto shadow-2xl animate-slide-in-left">
                {/* Panel header */}
                <div className="flex items-center justify-between p-4 bg-[#131921]">
                  <span className="font-bold text-lg">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-[#37475a] flex items-center justify-center transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Nav items with icons and dividers */}
                <nav className="py-2" aria-label="Mobile navigation">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <React.Fragment key={item.page}>
                        <button
                          onClick={() => {
                            navigate({ page: item.page } as any);
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full text-left px-5 py-3 hover:bg-[#37475a] text-gray-200 hover:text-white transition-colors"
                        >
                          <Icon size={18} className="text-[#febd69] shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                        {index < navItems.length - 1 && (
                          <div className="border-b border-gray-600/30 mx-5" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </nav>

                {/* Mobile-only quick links */}
                <div className="border-t border-gray-600/30 mt-2 pt-2">
                  <button
                    onClick={() => {
                      goToWishlist();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-5 py-3 hover:bg-[#37475a] text-gray-200 hover:text-white transition-colors"
                  >
                    <Heart size={18} className="text-[#febd69] shrink-0" />
                    <span className="font-medium">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-[#febd69] text-[#131921] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full text-left px-5 py-3 hover:bg-[#37475a] text-gray-200 hover:text-white transition-colors"
                  >
                    <ThemeIcon size={18} className="text-[#febd69] shrink-0" />
                    <span className="font-medium">{themeLabel}</span>
                    <span className="ml-auto text-[11px] text-gray-400">{theme === 'system' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
