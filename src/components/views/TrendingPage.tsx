'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { getTrending, getBestSellers } from '@/data/products';
import { categories } from '@/data/categories';
import { useRouterStore } from '@/lib/router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Star,
  Clock,
  Package,
  ArrowUpDown,
  Sparkles,
  Flame,
  Eye,
  Zap,
} from 'lucide-react';

type SortOption = 'rating' | 'recent' | 'reviewed';

const ITEMS_PER_PAGE = 12;

export function TrendingPage() {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [currentPage, setCurrentPage] = useState(1);

  // Ref for sliding indicator
  const pillsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Combine trending + best sellers, deduplicate
  const allProducts = useMemo(() => {
    const trending = getTrending();
    const bestSellers = getBestSellers();
    const seen = new Set(trending.map((p) => p.id));
    const combined = [...trending];
    for (const p of bestSellers) {
      if (!seen.has(p.id)) {
        combined.push(p);
      }
    }
    return combined;
  }, []);

  const trendingCategories = useMemo(() => {
    const cats = new Set(allProducts.map((p) => p.categorySlug));
    return categories.filter((c) => cats.has(c.slug));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = selectedCategory === 'all'
      ? [...allProducts]
      : allProducts.filter((p) => p.categorySlug === selectedCategory);

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'reviewed':
        // Products with 'verified' status first, then by rating
        result.sort((a, b) => {
          if (a.reviewStatus === 'verified' && b.reviewStatus !== 'verified') return -1;
          if (a.reviewStatus !== 'verified' && b.reviewStatus === 'verified') return 1;
          return b.rating - a.rating;
        });
        break;
    }
    return result;
  }, [allProducts, selectedCategory, sortBy]);

  const sortOptions: { key: SortOption; label: string; icon: React.ElementType }[] = [
    { key: 'rating', label: 'Expert Rating', icon: Star },
    { key: 'recent', label: 'Recently Updated', icon: Clock },
    { key: 'reviewed', label: 'Most Reviewed', icon: Flame },
  ];

  // Reset page on filter/sort change
  useEffect(() => { setCurrentPage(1); }, [selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Update sliding indicator position
  useEffect(() => {
    if (!pillsRef.current) return;
    const activePill = pillsRef.current.querySelector('[data-active="true"]') as HTMLElement;
    if (activePill) {
      const containerRect = pillsRef.current.getBoundingClientRect();
      const pillRect = activePill.getBoundingClientRect();
      setIndicatorStyle({
        left: pillRect.left - containerRect.left,
        width: pillRect.width,
      });
    }
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Trending' }]} />

        {/* ─── Dynamic Hero with Animated Gradient ─────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-xl ring-1 ring-black/5">
          <div className="bg-gradient-to-r from-[#131921] via-[#1e293b] to-[#0f172a] p-8 md:p-12 text-white animated-gradient" style={{ backgroundSize: '200% 200%' }}>
            {/* ─── Decorative elements with flame shapes ──────────────── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Floating geometric shapes */}
              <div className="absolute top-[8%] right-[6%] w-20 h-20 rounded-full border-2 border-amber-500/10 bg-amber-500/5 hero-float-1" />
              <div className="absolute bottom-[12%] right-[18%] w-12 h-12 rounded-lg border border-amber-500/10 bg-amber-500/5 hero-float-2" style={{ animationDelay: '1s' }} />
              <div className="absolute top-[35%] right-[30%] w-8 h-8 rounded-full bg-amber-500/10 hero-float-3" style={{ animationDelay: '2s' }} />
              {/* Flame decorative elements */}
              <div className="absolute top-[15%] right-[12%] flame-flicker" style={{ animationDelay: '0.3s' }}>
                <Flame className="w-10 h-10 text-amber-500/20" />
              </div>
              <div className="absolute bottom-[20%] right-[25%] flame-flicker" style={{ animationDelay: '0.8s' }}>
                <Flame className="w-6 h-6 text-orange-500/15" />
              </div>
              <div className="absolute top-[55%] right-[8%] flame-flicker" style={{ animationDelay: '1.2s' }}>
                <Flame className="w-8 h-8 text-amber-400/15" />
              </div>
              {/* Gradient orbs */}
              <div className="absolute top-[20%] right-[40%] w-32 h-32 rounded-full bg-amber-500/5 blur-2xl hero-float-slow" />
              <div className="absolute bottom-[10%] right-[5%] w-24 h-24 rounded-full bg-orange-500/5 blur-xl hero-float-2" style={{ animationDelay: '3s' }} />
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 hero-float-3">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Trending on <span className="text-gradient">GearGeekz</span>
                </h1>
              </div>
              <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
                The gear our editors and readers are most excited about right now. Expert-tested, honestly reviewed.
              </p>
              <div className="flex items-center gap-4 mt-5 text-sm">
                <span className="flex items-center gap-1.5 text-[#febd69]">
                  <Sparkles size={14} />
                  {allProducts.length} Trending Products
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Star size={14} className="fill-current" />
                  Curated by Experts
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={14} />
                  Updated Weekly
                </span>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        </div>

        {/* ─── "Hot Right Now" Featured Spotlight ──────────────────────── */}
        {filteredProducts.length > 0 && selectedCategory === 'all' && (
          <div className="mb-6 section-entrance">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-amber-500 trending-flame-accent flame-flicker" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hot Right Now</h2>
              <Badge className="pulse-badge-enhanced bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider border-0">
                <Zap className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
            <Card
              className="spotlight-card overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-amber-400/50 dark:border-amber-500/30 bg-white dark:bg-gray-800 rounded-2xl"
              onClick={() => goToProduct(filteredProducts[0].slug)}
            >
              <div className="flex flex-col md:flex-row">
                {/* Product Image — large */}
                <div className="md:w-2/5 aspect-video md:aspect-auto bg-gray-50 dark:bg-gray-700 relative overflow-hidden">
                  {filteredProducts[0].image ? (
                    <img
                      src={filteredProducts[0].image}
                      alt={filteredProducts[0].title}
                      className="w-full h-full object-contain p-6"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                      <Package className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                  {/* Trending badge on image */}
                  <div className="absolute top-3 left-3">
                    <Badge className="pulse-badge-enhanced bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold border-0 shadow-lg shadow-amber-500/30">
                      <Flame className="w-3 h-3 mr-1" />
                      #1 Trending
                    </Badge>
                  </div>
                </div>
                {/* Product Detail Overlay */}
                <CardContent className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">{filteredProducts[0].category}</p>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                    {filteredProducts[0].title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {filteredProducts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          className={star <= Math.round(filteredProducts[0].rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                        />
                      ))}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white ml-1">{filteredProducts[0].rating.toFixed(1)}</span>
                    </div>
                    {filteredProducts[0].bestFor.length > 0 && (
                      <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 text-[10px] border border-amber-200 dark:border-amber-800/30">
                        {filteredProducts[0].bestFor[0]}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-400 text-[#0f172a] font-semibold"
                      onClick={(e) => { e.stopPropagation(); goToProduct(filteredProducts[0].slug); }}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View Full Review
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* ─── Category Filter Pills with Sliding Indicator ────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category pills with sliding indicator */}
            <div className="filter-pills-container" ref={pillsRef}>
              <button
                onClick={() => setSelectedCategory('all')}
                data-active={selectedCategory === 'all'}
                className={`filter-pill ${selectedCategory === 'all' ? 'filter-pill-active slide-indicator' : 'filter-pill-inactive'}`}
              >
                All Categories
              </button>
              {trendingCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  data-active={selectedCategory === cat.slug}
                  className={`filter-pill ${selectedCategory === cat.slug ? 'filter-pill-active slide-indicator' : 'filter-pill-inactive'}`}
                >
                  {cat.name}
                </button>
              ))}
              {/* Sliding underline indicator */}
              <div
                className="filter-pills-indicator"
                style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              />
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
              {sortOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      sortBy === opt.key
                        ? 'bg-gradient-to-r from-[#febd69] to-[#f3a847] text-[#131921] shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon size={12} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top 3 Spotlight */}
        {selectedCategory === 'all' && filteredProducts.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 section-entrance">
            {filteredProducts.slice(0, 3).map((product, index) => {
              const isTop = index === 0;
              return (
                <Card
                  key={product.id}
                  className={`overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-2 rounded-xl ${
                    isTop
                      ? 'border-amber-400 md:-mt-4 shadow-lg shadow-amber-500/10'
                      : index === 1
                      ? 'border-gray-300 dark:border-gray-600'
                      : 'border-amber-700/50 dark:border-amber-700/30'
                  } bg-white dark:bg-gray-800`}
                  onClick={() => goToProduct(product.slug)}
                >
                  {/* Rank header with trending badge */}
                  <div
                    className={`p-3 flex items-center justify-center gap-2 ${
                      isTop
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-400 to-gray-300'
                        : 'bg-gradient-to-r from-amber-700 to-amber-600'
                    } text-white`}
                  >
                    {isTop && <Sparkles className="w-5 h-5 pulse-badge-enhanced" />}
                    <span className="font-bold text-lg">
                      {isTop ? 'Most Trending' : index === 1 ? 'Rising Star' : 'Editor Pick'}
                    </span>
                  </div>
                  <CardContent className="p-4 text-center">
                    <div className="w-full aspect-square bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-contain p-2"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button className="text-[#007185] hover:text-[#c7511f] hover:underline text-xs mb-1">
                      {product.category}
                    </button>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                        />
                      ))}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{product.rating.toFixed(1)}</span>
                    </div>
                    {product.bestFor.length > 0 && (
                      <div className="mt-2">
                        <Badge className="bg-[#febd69]/20 text-[#131921] dark:text-[#febd69] hover:bg-[#febd69]/20 text-[10px] px-1.5">
                          {product.bestFor[0]}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Product Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              {selectedCategory === 'all'
                ? 'All Trending Products'
                : trendingCategories.find((c) => c.slug === selectedCategory)?.name}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedProducts.map((product, index) => (
                <div key={product.id} className={`relative card-entrance card-entrance-delay-${Math.min(index + 1, 12)}`}>
                  {/* Trending badge for top products */}
                  {index < 3 && currentPage === 1 && (
                    <div className="absolute top-2 right-2 z-20">
                      <Badge className="pulse-badge-enhanced bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold border-0 shadow-md">
                        <Flame className="w-2.5 h-2.5 mr-0.5" />
                        Trending
                      </Badge>
                    </div>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No trending products found in this category.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'bg-amber-500 text-black hover:bg-amber-400' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 section-entrance">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              Trending products are selected based on our expert review scores, recent updates, and editorial interest.
              These are the products our team is most excited about right now. Individual preferences and needs may vary.
              We encourage you to read our full reviews before making a purchase decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
