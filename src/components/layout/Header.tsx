'use client';

import React, { useState } from 'react';
import { Search, Menu, X, Heart, TrendingUp, BookOpen, Info, Compass, Sun, Moon, Monitor, Award, Tag } from 'lucide-react';
import { useRouterStore } from '@/lib/router';
import { useWishlistStore } from '@/lib/wishlist';
import { useThemeStore } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navItems: { label: string; page: 'trending' | 'best-sellers' | 'deals' | 'guides' | 'blog' | 'about'; icon: typeof TrendingUp }[] = [
  { label: 'Trending', page: 'trending', icon: TrendingUp },
  { label: 'Best Sellers', page: 'best-sellers', icon: Award },
  { label: 'Deals', page: 'deals', icon: Tag },
  { label: 'Guides', page: 'guides', icon: Compass },
  { label: 'Blog', page: 'blog', icon: BookOpen },
  { label: 'About', page: 'about', icon: Info },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const goHome = useRouterStore((s) => s.goHome);
  const goToSearch = useRouterStore((s) => s.goToSearch);
  const goToWishlist = useRouterStore((s) => s.goToWishlist);
  const goToPage = useRouterStore((s) => s.goToPage);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const themeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor;
  const ThemeIcon = themeIcon;
  const themeLabel = theme === 'dark' ? 'Light mode' : theme === 'light' ? 'Dark mode' : 'System theme';

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
    <header className="z-50">
      {/* Primary Header Bar */}
      <div className="bg-[#131921] text-white">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#37475a] rounded-lg transition-colors duration-200 active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <button
              onClick={() => goHome()}
              className="flex items-center gap-2 shrink-0 rounded-lg p-1 select-none"
              aria-label="Go to homepage"
            >
              <div className="bg-gradient-to-br from-[#febd69] to-[#f59e0b] rounded-full flex items-center justify-center shadow-md shadow-amber-500/30 w-9 h-9">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#131921" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              </div>
              <span className="font-bold tracking-tight leading-none text-xl">
                Gear<span className="gradient-text">Geekz</span>
              </span>
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
                  className="border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm rounded-none shadow-none min-w-[200px] h-11"
                  aria-label="Search"
                />
                <Button
                  type="submit"
                  className="rounded-none rounded-r-full bg-gradient-to-b from-[#febd69] to-[#f3a847] hover:from-[#f3a847] hover:to-[#e8a23a] text-[#131921] px-5 transition-all duration-200 hover:shadow-md h-11"
                  aria-label="Search"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Right section */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 hover:bg-[#37475a] rounded-lg p-2 transition-all duration-200 active:scale-95"
                aria-label={themeLabel}
                title={themeLabel}
              >
                <ThemeIcon size={20} className="text-[#febd69] transition-transform duration-200 hover:rotate-12" />
                <span className="text-[11px] text-gray-400 hidden xl:inline">{theme === 'system' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
              <button
                className="flex items-center gap-1.5 hover:bg-[#37475a] rounded-lg p-2 transition-all duration-200 active:scale-95"
                onClick={goToWishlist}
                aria-label="Wishlist"
              >
                <div className="relative">
                  <Heart size={24} className="transition-transform duration-200 hover:scale-110" />
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

            {/* Mobile right buttons */}
            <div className="flex sm:hidden items-center gap-0.5 ml-auto">
              <button
                onClick={toggleTheme}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#37475a] rounded-lg transition-colors"
                aria-label={themeLabel}
              >
                <ThemeIcon size={20} className="text-[#febd69]" />
              </button>
              <button
                className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#37475a] rounded-lg transition-colors relative"
                onClick={goToWishlist}
                aria-label="Wishlist"
              >
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-gradient-to-b from-[#febd69] to-[#f59e0b] text-[#131921] text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="sm:hidden mt-2">
            <div className={`flex w-full rounded-lg overflow-hidden transition-shadow duration-300 ${searchFocused ? 'ring-2 ring-[#febd69]/60' : 'ring-0'}`}>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search gear, reviews, and guides..."
                className="rounded-r-none border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-sm"
                aria-label="Search mobile"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-gradient-to-b from-[#febd69] to-[#f3a847] hover:from-[#f3a847] hover:to-[#e8a23a] text-[#131921] px-4 h-10 transition-all duration-200"
                aria-label="Search"
              >
                <Search size={18} />
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
                    goToPage(item.page);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#37475a] rounded-md text-gray-200 hover:text-white transition-all duration-200 nav-underline"
                >
                  <Icon size={14} className="text-[#febd69] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#131921" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
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
                        goToPage(item.page);
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
    </header>
  );
}
