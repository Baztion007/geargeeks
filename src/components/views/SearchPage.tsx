'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { products, searchProducts } from '@/data/products';
import { categories, getCategoryBySlug } from '@/data/categories';
import { brands, getBrandBySlug } from '@/data/brands';
import { buyingGuides } from '@/data/buying-guides';
import { blogPosts } from '@/data/blog-posts';
import { useRouterStore } from '@/lib/router';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { Disclosure } from '@/components/affiliate/Disclosure';
import { StarRating } from '@/components/affiliate/RatingBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  PackageOpen,
  TrendingUp,
  Package,
  Building2,
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
  Compass,
  Tag,
  X,
  Keyboard,
  History,
  Sparkles,
} from 'lucide-react';

interface SearchPageProps {
  query: string;
}

// Popular search tags for suggestions — travel/tech/gear focused
const POPULAR_TAGS = [
  'travel',
  'headphones',
  'anker',
  'backpack',
  'noise cancelling',
  'charger',
  'luggage',
  'fitness',
  'standing desk',
  'earbuds',
  'sony',
  'speaker',
];

// Recent searches localStorage key
const RECENT_SEARCHES_KEY = 'gearscope-recent-searches';
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

function clearRecentSearches() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

type SearchTab = 'all' | 'products' | 'categories' | 'brands' | 'guides' | 'blog';

interface SearchResultGroup {
  products: typeof products;
  categories: typeof categories;
  brands: typeof brands;
  guides: typeof buyingGuides;
  blogs: typeof blogPosts;
}

export function SearchPage({ query }: SearchPageProps) {
  const [searchInput, setSearchInput] = useState(query);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const goToSearch = useRouterStore((s) => s.goToSearch);
  const goToCategory = useRouterStore((s) => s.goToCategory);
  const goToBrand = useRouterStore((s) => s.goToBrand);
  const goToBuyingGuide = useRouterStore((s) => s.goToBuyingGuide);
  const goToBlogPost = useRouterStore((s) => s.goToBlogPost);
  const goHome = useRouterStore((s) => s.goHome);

  useEffect(() => {
    setMounted(true);
    setRecentSearches(getRecentSearches());
  }, []);

  // Save search to recent when query changes
  useEffect(() => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
    }
  }, [query]);

  // Search across all content types
  const searchResults = useMemo<SearchResultGroup>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { products: [], categories: [], brands: [], guides: [], blogs: [] };

    return {
      products: searchProducts(query),
      categories: categories.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.slug.includes(q)
      ),
      brands: brands.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.slug.includes(q)
      ),
      guides: buyingGuides.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.excerpt.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.guideType.toLowerCase().includes(q)
      ),
      blogs: blogPosts.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      ),
    };
  }, [query]);

  const totalResults =
    searchResults.products.length +
    searchResults.categories.length +
    searchResults.brands.length +
    searchResults.guides.length +
    searchResults.blogs.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      goToSearch(trimmed);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchInput(tag);
    goToSearch(tag);
  };

  const handleClearRecentSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Get suggested tags that aren't the current query
  const suggestedTags = useMemo(() => {
    const q = query.toLowerCase();
    return POPULAR_TAGS.filter(
      (tag) => !tag.includes(q) && !q.includes(tag)
    ).slice(0, 8);
  }, [query]);

  // Tab config with counts
  const tabs: { key: SearchTab; label: string; count: number; icon: React.ElementType }[] = [
    { key: 'all', label: 'All', count: totalResults, icon: Search },
    { key: 'products', label: 'Products', count: searchResults.products.length, icon: Package },
    { key: 'categories', label: 'Categories', count: searchResults.categories.length, icon: Compass },
    { key: 'brands', label: 'Brands', count: searchResults.brands.length, icon: Building2 },
    { key: 'guides', label: 'Guides', count: searchResults.guides.length, icon: BookOpen },
    { key: 'blog', label: 'Blog', count: searchResults.blogs.length, icon: FileText },
  ];

  // Determine placeholder with keyboard shortcut
  const searchPlaceholder = typeof navigator !== 'undefined' && /Mac|iPhone|iPod/.test(navigator.userAgent)
    ? 'Search gear, reviews, guides... (⌘K)'
    : 'Search gear, reviews, guides... (Ctrl+K)';

  // No results state
  if (totalResults === 0 && query.trim()) {
    return (
      <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Breadcrumbs items={[{ label: `Search: "${query}"` }]} />

          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-10 h-10 text-sm"
                />
              </div>
              <Button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-semibold h-10 px-6">
                <Search size={16} className="mr-1" />
                Search
              </Button>
            </form>
          </div>

          {/* Result Count Summary - 0 results */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">0 results</span> for{' '}
              <span className="font-semibold text-gray-900 dark:text-white">&ldquo;{query}&rdquo;</span>
            </p>
          </div>

          {/* No Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <PackageOpen size={56} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No results found</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try different keywords, check your spelling, or browse our suggestions below.
              </p>
              {/* Helpful suggestions */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">
                  <Sparkles size={10} className="mr-1" />
                  Try broader terms
                </Badge>
                <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">
                  <Sparkles size={10} className="mr-1" />
                  Check spelling
                </Badge>
                <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">
                  <Sparkles size={10} className="mr-1" />
                  Use fewer words
                </Badge>
              </div>
            </div>

            {/* Recent Searches */}
            {mounted && recentSearches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Searches</h3>
                  </div>
                  <button
                    onClick={handleClearRecentSearches}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleTagClick(term)}
                      className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-300 text-xs rounded-full border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700 transition-colors flex items-center gap-1.5"
                    >
                      <Clock size={10} className="text-gray-400" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Search Suggestions */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[#febd69]" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Popular Searches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-[#febd69] hover:text-[#131921] text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600 hover:border-[#febd69] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse All Categories */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Browse Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.slug}
                    variant="outline"
                    size="sm"
                    onClick={() => goToCategory(cat.slug)}
                    className="text-xs hover:border-[#febd69] hover:text-[#131921] dark:hover:text-[#febd69]"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: `Search: "${query}"` }]} />

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-10 h-10 text-sm"
              />
              {/* Keyboard shortcut indicator */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded border border-gray-200 dark:border-gray-600">
                  {typeof navigator !== 'undefined' && /Mac|iPhone|iPod/.test(navigator.userAgent) ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded border border-gray-200 dark:border-gray-600">
                  K
                </kbd>
              </div>
            </div>
            <Button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-semibold h-10 px-6">
              <Search size={16} className="mr-1" />
              Search
            </Button>
          </form>
        </div>

        {/* Recent Searches - shown when no active query */}
        {mounted && !query.trim() && recentSearches.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Searches</h3>
              </div>
              <button
                onClick={handleClearRecentSearches}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleTagClick(term)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-300 text-xs rounded-full border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700 transition-colors flex items-center gap-1.5"
                >
                  <Clock size={10} className="text-gray-400" />
                  {term}
                  <X size={10} className="text-gray-300 dark:text-gray-600 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches - shown when no active query */}
        {mounted && !query.trim() && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-[#febd69]" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Popular Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-[#febd69] hover:text-[#131921] text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600 hover:border-[#febd69] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        {query.trim() && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{totalResults}</span>{' '}
              result{totalResults !== 1 ? 's' : ''} for{' '}
              <span className="font-semibold text-gray-900 dark:text-white">&ldquo;{query}&rdquo;</span>
              {' '}across {tabs.filter((t) => t.count > 0).length} categor{tabs.filter((t) => t.count > 0).length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
        )}

        {/* Tabs */}
        {query.trim() && (
          <div className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'text-[#131921] dark:text-white tab-active-indicator'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge className={`ml-1 text-[10px] px-1.5 py-0 ${
                      activeTab === tab.key
                        ? 'bg-[#febd69] text-[#131921]'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Results Content */}
        {query.trim() && (
          <div className="space-y-8">
            {/* Products Section */}
            {(activeTab === 'all' || activeTab === 'products') && searchResults.products.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Package size={18} className="text-[#febd69]" />
                      Products ({searchResults.products.length})
                    </h2>
                    {searchResults.products.length > 4 && (
                      <button
                        onClick={() => setActiveTab('products')}
                        className="text-sm text-[#007185] dark:text-[#5cc7d4] hover:underline flex items-center gap-1"
                      >
                        View all <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                )}
                <div className={`grid gap-4 ${
                  activeTab === 'products'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}>
                  {(activeTab === 'all' ? searchResults.products.slice(0, 4) : searchResults.products).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Categories Section */}
            {(activeTab === 'all' || activeTab === 'categories') && searchResults.categories.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Compass size={18} className="text-[#febd69]" />
                      Categories ({searchResults.categories.length})
                    </h2>
                  </div>
                )}
                <div className={`grid gap-3 ${
                  activeTab === 'categories'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-4'
                }`}>
                  {(activeTab === 'all' ? searchResults.categories.slice(0, 4) : searchResults.categories).map((cat) => (
                    <Card
                      key={cat.slug}
                      className="group cursor-pointer hover:shadow-lg transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#febd69]/30 card-hover-lift overflow-hidden rounded-xl"
                      onClick={() => goToCategory(cat.slug)}
                    >
                      <div className="h-24 bg-gradient-to-br from-slate-700 to-slate-900 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 z-10">
                          <Badge className="bg-[#febd69] text-[#131921] text-[10px]">{cat.productCount} Products</Badge>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-[#c7511f] transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{cat.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Brands Section */}
            {(activeTab === 'all' || activeTab === 'brands') && searchResults.brands.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 size={18} className="text-[#febd69]" />
                      Brands ({searchResults.brands.length})
                    </h2>
                  </div>
                )}
                <div className={`grid gap-3 ${
                  activeTab === 'brands'
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
                    : 'grid-cols-3 sm:grid-cols-6'
                }`}>
                  {(activeTab === 'all' ? searchResults.brands.slice(0, 6) : searchResults.brands).map((b) => (
                    <Card
                      key={b.slug}
                      className="group cursor-pointer hover:shadow-lg transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#febd69]/30 card-hover-lift"
                      onClick={() => goToBrand(b.slug)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center group-hover:from-amber-50 group-hover:to-amber-100 dark:group-hover:from-amber-900/30 dark:group-hover:to-amber-800/30 transition-colors">
                          <Building2 size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-[#febd69] transition-colors" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#c7511f] transition-colors">
                          {b.name}
                        </h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{b.productCount} product{b.productCount !== 1 ? 's' : ''}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Buying Guides Section */}
            {(activeTab === 'all' || activeTab === 'guides') && searchResults.guides.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen size={18} className="text-[#febd69]" />
                      Buying Guides ({searchResults.guides.length})
                    </h2>
                  </div>
                )}
                <div className={`grid gap-4 ${
                  activeTab === 'guides'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-3'
                }`}>
                  {(activeTab === 'all' ? searchResults.guides.slice(0, 3) : searchResults.guides).map((guide) => (
                    <Card
                      key={guide.id}
                      className="group cursor-pointer hover:shadow-xl transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#febd69]/30 card-hover-lift overflow-hidden"
                      onClick={() => goToBuyingGuide(guide.slug)}
                    >
                      <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                        <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                          <Badge className="bg-[#febd69] text-[#131921] text-[10px] font-semibold uppercase tracking-wider">
                            {guide.guideType.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3 z-20">
                          <Badge variant="secondary" className="bg-white/90 text-gray-700 text-[10px]">
                            <Clock size={10} className="mr-1" />
                            {guide.readingTime} min
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5 group-hover:text-[#c7511f] transition-colors line-clamp-2">
                          {guide.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{guide.excerpt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px]">{guide.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Blog Posts Section */}
            {(activeTab === 'all' || activeTab === 'blog') && searchResults.blogs.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText size={18} className="text-[#febd69]" />
                      Blog Posts ({searchResults.blogs.length})
                    </h2>
                  </div>
                )}
                <div className={`grid gap-4 ${
                  activeTab === 'blog'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}>
                  {(activeTab === 'all' ? searchResults.blogs.slice(0, 2) : searchResults.blogs).map((post) => (
                    <Card
                      key={post.id}
                      className="group cursor-pointer hover:shadow-xl transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#febd69]/30 card-hover-lift overflow-hidden"
                      onClick={() => goToBlogPost(post.slug)}
                    >
                      <div className="h-32 bg-gradient-to-br from-amber-800/80 to-amber-950 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                        <div className="absolute bottom-3 left-3 z-20">
                          <Badge className="bg-white/90 text-gray-700 text-[10px]">
                            <Clock size={10} className="mr-1" />
                            {post.readingTime} min read
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                          <span className="text-[10px] text-gray-400">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5 group-hover:text-[#c7511f] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                                <Tag size={8} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Affiliate Disclosure */}
        {searchResults.products.length > 0 && (
          <div className="mt-6">
            <Disclosure />
          </div>
        )}

        {/* Related Searches */}
        {query.trim() && suggestedTags.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-[#febd69]" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Related Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-[#febd69] hover:text-[#131921] text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600 hover:border-[#febd69] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Browse All Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Browse All Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.slug}
                className="cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#febd69] hover:text-[#131921] border border-gray-200 dark:border-gray-600 hover:border-[#febd69] transition-colors px-3 py-1.5 text-xs"
                onClick={() => goToCategory(cat.slug)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
