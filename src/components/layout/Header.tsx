'use client';

import React, { useState } from 'react';
import { Search, Menu, X, ChevronDown, Heart, TrendingUp, BookOpen, Info, Compass, Sun, Moon, Monitor, Award, Tag } from 'lucide-react';
import { useRouterStore } from '@/lib/router';
import { useWishlistStore } from '@/lib/wishlist';
import { useThemeStore } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navItems = [
  { label: 'Trending', page: 'trending' as const, icon: TrendingUp },
  { label: 'Best Sellers', page: 'best-sellers' as const, icon: Award },
  { label: 'Deals', page: 'deals' as const, icon: Tag },
  { label: 'Guides', page: 'guides' as const, icon: Compass },
  { label: 'Blog', page: 'blog' as const, icon: BookOpen },
  { label: 'About', page: 'about' as const, icon: Info },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useRouterStore((s) => s.navigate);
  const goHome = useRouterStore((s) => s.goHome);
  const goToSearch = useRouterStore((s) => s.goToSearch);
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
    <header className={`z-50 transition-all duration-300 header-glow header-glow-intense ${isSticky ? 'shadow-lg shadow-black/10 scrolled' : ''}`}>
      {/* Primary Header */}
      <div className={`transition-all duration-300 ${isSticky ? 'bg-[#131921]/95 backdrop-blur-md' : 'bg-[#131921]/98 backdrop-blur-sm'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-[#37475a] rounded-lg transition-colors duration-200 active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <button
              onClick={() => goHome()}
              onDoubleClick={(e) => { e.preventDefault(); goHome(); }}
              className="flex items-center gap-2 shrink-0 rounded-lg p-1 select-none"
              aria-label="Go to homepage"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#febd69] to-[#f59e0b] rounded-full flex items-center justify-center shadow-md shadow-amber-500/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#131921" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight leading-none">
                  Gear<span className="gradient-text">Geekz</span>
                </span>
                <span className="text-[9px] text-gray-400 leading-none hidden sm:block tracking-wide">Expert Reviews. Smart Recommendations.</span>
              </div>
            </button>

            {/* Search Bar — premium focus animation */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-3xl">
              <div className={`flex w-full rounded-full overflow-hidden transition-all duration-300 border ${searchFocused ? 'ring-2 ring-[#febd69]/70 shadow-lg shadow-amber-500/15 scale-[1.02] border-[#febd69]/40' : 'border-[#3a4a5c] hover:border-[#4a5a6d]'}`}>
                <div className="flex items-center pl-4 bg-white dark:bg-gray-800">
                  <Search size={18} className="text-gray-400 dark:text-gray-500" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search gear, reviews, and guides..."
                  className="border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 text-sm rounded-none shadow-none min-w-[200px]"
                  aria-label="Search"
                />
                <Button
                  type="submit"
                  className="rounded-none rounded-r-full bg-gradient-to-b from-[#febd69] to-[#f3a847] hover:from-[#f3a847] hover:to-[#e8a23a] text-[#131921] px-5 h-11 transition-all duration-200 hover:shadow-md"
                  aria-label="Search"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Right section */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 hover:bg-[#37475a] rounded-lg p-2 transition-all duration-200 active:scale-95"
                aria-label={themeLabel}
                title={themeLabel}
              >
                <ThemeIcon size={22} className="text-[#febd69] transition-transform duration-200 hover:rotate-12" />
                <span className="text-[11px] text-gray-400 hidden xl:inline">{theme === 'system' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
              <button
                className="flex items-center gap-1.5 hover:bg-[#37475a] rounded-lg p-2 transition-all duration-200 active:scale-95"
                onClick={goToWishlist}
                aria-label="Wishlist"
              >
                <div className="relative">
                  <Heart size={26} className="transition-transform duration-200 hover:scale-110" />
                  {wishlistCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 bg-gradient-to-b from-[#febd69] to-[#f59e0b] text-[#131921] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        {wishlistCount}
                      </span>
                      <span className="notification-dot" />
                    </>
                  )}
                </div>
                <span className="font-bold text-sm hidden lg:block">Wishlist</span>
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="sm:hidden mt-3">
            <div className={`flex w-full rounded-lg overflow-hidden transition-shadow duration-300 ${searchFocused ? 'ring-2 ring-[#febd69]/60' : 'ring-0'}`}>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search gear, reviews, and guides..."
                className="rounded-r-none border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 text-sm"
                aria-label="Search mobile"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-gradient-to-b from-[#febd69] to-[#f3a847] hover:from-[#f3a847] hover:to-[#e8a23a] text-[#131921] px-4 h-11 transition-all duration-200"
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
          <nav className="hidden md:flex items-center justify-center gap-1 h-10 text-sm" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    navigate({ page: item.page } as any);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#37475a] rounded-md text-gray-200 hover:text-white transition-all duration-200 nav-underline"
                >
                  <Icon size={14} className="text-[#febd69] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile nav menu - slide-in panel */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Slide-in panel */}
              <div className="md:hidden fixed top-0 left-0 bottom-0 w-[300px] bg-[#232f3e] text-white z-50 overflow-y-auto shadow-2xl animate-slide-in-left">
                {/* Panel header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#131921] to-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#febd69] to-[#f59e0b] rounded-full flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#131921" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                    <span className="font-bold text-lg">Gear<span className="gradient-text">Geekz</span></span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-[#37475a] flex items-center justify-center transition-colors duration-200"
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
                          className="flex items-center gap-3 w-full text-left px-5 py-3.5 hover:bg-[#37475a] text-gray-200 hover:text-white transition-colors duration-200 active:bg-[#4a5a6d]"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#37475a]/50 flex items-center justify-center">
                            <Icon size={16} className="text-[#febd69]" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </button>
                        {index < navItems.length - 1 && (
                          <div className="border-b border-gray-600/20 mx-5" />
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
                    className="flex items-center gap-3 w-full text-left px-5 py-3.5 hover:bg-[#37475a] text-gray-200 hover:text-white transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#37475a]/50 flex items-center justify-center">
                      <Heart size={16} className="text-[#febd69]" />
                    </div>
                    <span className="font-medium">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-gradient-to-b from-[#febd69] to-[#f59e0b] text-[#131921] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full text-left px-5 py-3.5 hover:bg-[#37475a] text-gray-200 hover:text-white transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#37475a]/50 flex items-center justify-center">
                      <ThemeIcon size={16} className="text-[#febd69]" />
                    </div>
                    <span className="font-medium">{themeLabel}</span>
                    <span className="ml-auto text-[11px] text-gray-400 bg-[#37475a]/50 px-2 py-0.5 rounded-full">{theme === 'system' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}</span>
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
