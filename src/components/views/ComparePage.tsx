'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useCompareStore } from '@/lib/compare';
import { useRouterStore } from '@/lib/router';
import { getProductBySlug, searchProducts, products as allProducts } from '@/data/products';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { StarRating, RatingBreakdownDisplay } from '@/components/affiliate/RatingBar';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { X, Check, Package, ShoppingBag, BarChart3, Plus, ChevronLeft, ChevronRight, ArrowLeftRight, Search, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { ComparisonTable } from '@/components/affiliate/ComparisonTable';
import { ScoreBadge } from '@/components/affiliate/ScoreBadge';

export function ComparePage() {
  const items = useCompareStore((s) => s.items);
  const removeItem = useCompareStore((s) => s.removeItem);
  const addItem = useCompareStore((s) => s.addItem);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const goToPage = useRouterStore((s) => s.goToPage);

  const products = items
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean);

  // Scroll refs and state for mobile scroll indicators
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Add-to-compare search
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [showAddSearch, setShowAddSearch] = useState(false);

  const addSearchResults = useMemo(() => {
    if (!addSearchQuery.trim()) return [];
    return searchProducts(addSearchQuery).filter(
      (p) => !items.includes(p.slug)
    ).slice(0, 5);
  }, [addSearchQuery, items]);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [products.length]);

  // Hide swipe hint after first scroll
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handler = () => {
      setShowSwipeHint(false);
    };
    el.addEventListener('touchstart', handler, { once: true, passive: true });
    el.addEventListener('scroll', handler, { once: true, passive: true });
    return () => {
      el.removeEventListener('touchstart', handler);
      el.removeEventListener('scroll', handler);
    };
  }, []);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = 280;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // Empty state
  if (products.length < 2) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Compare Products' }]} />
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Compare Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add at least 2 products to compare their features, specifications, and ratings side by side.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => goToPage('home')}
              className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold"
            >
              <ShoppingBag size={16} className="mr-2" />
              Browse Products
            </Button>
          </div>
          {products.length === 1 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
              You have 1 product selected. Add {2 - products.length} more to start comparing.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Collect all feature and specification keys across products
  const allFeatureKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p!.features)))
  );
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p!.specifications)))
  );

  // Check if a row has differing values
  const hasDifferingValues = (key: string, type: 'features' | 'specifications'): boolean => {
    const values = products.map((p) => p![type][key] ?? 'N/A');
    return new Set(values).size > 1;
  };

  // Determine winner for a feature/spec row
  const getRowWinner = (key: string, type: 'features' | 'specifications'): number | null => {
    if (products.length < 2) return null;
    const values = products.map((p) => p![type][key] ?? '');
    if (new Set(values).size <= 1) return null;
    // Try numeric comparison
    const numericValues = values.map((v) => parseFloat(v.replace(/[^0-9.-]/g, '')));
    const hasNumeric = numericValues.some((v) => !isNaN(v));
    if (hasNumeric) {
      const validEntries = numericValues.map((v, i) => ({ v, i })).filter((x) => !isNaN(x.v));
      if (validEntries.length > 1) {
        const maxVal = Math.max(...validEntries.map((x) => x.v));
        return validEntries.find((x) => x.v === maxVal)?.i ?? null;
      }
    }
    return null;
  };

  // Compute overall winner based on most wins
  const winCounts = products.map(() => 0);
  [...allFeatureKeys, ...allSpecKeys].forEach((key) => {
    const type = allFeatureKeys.includes(key) ? 'features' : 'specifications';
    const winnerIdx = getRowWinner(key, type);
    if (winnerIdx !== null) winCounts[winnerIdx]++;
  });
  // Add rating advantage
  const maxRating = Math.max(...products.map((p) => p!.rating));
  products.forEach((p, i) => {
    if (p!.rating === maxRating) winCounts[i] += 2;
  });
  const overallWinnerIdx = winCounts.reduce((best, count, idx) => {
    if (count > winCounts[best]) return idx;
    if (count === winCounts[best] && products[idx]!.rating > products[best]!.rating) return idx;
    return best;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <Breadcrumbs items={[{ label: 'Compare Products' }]} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compare Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comparing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length < 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddSearch(!showAddSearch)}
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 border-amber-300 dark:border-amber-700"
            >
              <Plus size={16} className="mr-1" />
              Add to Compare
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompare}
            className="text-gray-500 hover:text-red-600"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Add to Compare Search Panel */}
      {showAddSearch && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plus size={16} className="text-amber-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Add a Product to Compare</h3>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={addSearchQuery}
                onChange={(e) => setAddSearchQuery(e.target.value)}
                placeholder="Search for a product to add..."
                className="pl-10 h-10 text-sm"
              />
            </div>
            {addSearchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {addSearchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      addItem(product.slug);
                      setAddSearchQuery('');
                      setShowAddSearch(false);
                    }}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-md bg-gray-50 dark:bg-gray-700 overflow-hidden shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{product.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.category} · {product.rating.toFixed(1)}★</p>
                    </div>
                    <Plus size={16} className="text-amber-600 shrink-0" />
                  </button>
                ))}
              </div>
            )}
            {addSearchQuery.trim() && addSearchResults.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">No products found. Try a different search.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Verdict Banner */}
      {products.length >= 2 && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800/40 bg-gradient-to-r from-amber-50/80 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/10 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                <Trophy size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Quick Verdict</h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  <span className="font-semibold">{products[overallWinnerIdx]!.title}</span> is our top pick
                  {winCounts[overallWinnerIdx] > 0 && (
                    <> — wins in {winCounts[overallWinnerIdx]} categor{winCounts[overallWinnerIdx] > 1 ? 'ies' : 'y'}</>
                  )}
                  {products[overallWinnerIdx]!.rating === maxRating && ' with the highest rating'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Swipe hint - mobile only */}
      {showSwipeHint && (
        <div className="md:hidden flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-3 animate-pulse">
          <ArrowLeftRight size={14} />
          <span>Swipe to compare products</span>
          <ArrowLeftRight size={14} />
        </div>
      )}

      {/* Scroll arrows - mobile only */}
      {canScrollLeft && (
        <button
          onClick={() => scrollByAmount('left')}
          className="md:hidden fixed left-1 bottom-36 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollByAmount('right')}
          className="md:hidden fixed right-1 bottom-36 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Comparison Table - horizontally scrollable on mobile with snap scrolling */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto -mx-4 px-4 pb-4 scroll-smooth snap-x snap-mandatory md:snap-none custom-scrollbar"
      >
        <div className="min-w-[640px] md:min-w-0">
          {/* Product Headers */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
            {/* Empty top-left cell */}
            <div />

            {products.map((product, idx) => (
              <Card key={product!.slug} className={`relative snap-start ${idx === overallWinnerIdx && products.length > 1 ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}>
                {/* Remove button */}
                <button
                  onClick={() => removeItem(product!.slug)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900/30 flex items-center justify-center z-10 transition-colors"
                  aria-label={`Remove ${product!.title} from compare`}
                >
                  <X size={14} className="text-gray-500 hover:text-red-600" />
                </button>

                <CardContent className="p-4 text-center">
                  {/* Winner badge */}
                  {idx === overallWinnerIdx && products.length > 1 && (
                    <Badge className="bg-amber-500 text-white text-[10px] mb-2">
                      <Trophy className="w-3 h-3 mr-1" />
                      Top Pick
                    </Badge>
                  )}

                  {/* Image */}
                  <div
                    className="w-full aspect-square max-w-[180px] mx-auto rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700 mb-3 cursor-pointer"
                    onClick={() => goToProduct(product!.slug)}
                  >
                    {product!.image ? (
                      <img
                        src={product!.image}
                        alt={product!.title}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-50 dark:bg-gray-700">
                        <Package size={40} className="text-amber-400 dark:text-amber-500" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2 cursor-pointer hover:text-[#c7511f] line-clamp-2"
                    onClick={() => goToProduct(product!.slug)}
                  >
                    {product!.title}
                  </h3>

                  {/* Score Badge */}
                  <div className="flex justify-center mb-2">
                    <ScoreBadge rating={product!.rating} size="sm" />
                  </div>

                  {/* CTA */}
                  <CheckPriceButton merchant={product!.merchant} productId={product!.asin} size="sm" className="w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Features Section with highlight indicators */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Features</h2>
            <Card className="overflow-hidden">
              <Table>
                <TableBody>
                  {allFeatureKeys.map((key, rowIdx) => {
                    const isDifferent = hasDifferingValues(key, 'features');
                    const winnerIdx = getRowWinner(key, 'features');
                    return (
                      <TableRow key={key} className={`${isDifferent ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''} ${rowIdx % 2 === 1 ? 'bg-gray-50/30 dark:bg-gray-800/30' : ''}`}>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300 w-[200px] min-w-[200px] text-sm sticky left-0 bg-white dark:bg-gray-800 z-[5]">
                          {key}
                          {isDifferent && (
                            <Badge variant="outline" className="ml-2 text-[10px] border-amber-300 text-amber-700 dark:text-amber-400 py-0 px-1.5">
                              differs
                            </Badge>
                          )}
                        </TableCell>
                        {products.map((product, pIdx) => {
                          const isWinner = winnerIdx === pIdx;
                          const isLoser = winnerIdx !== null && winnerIdx !== pIdx;
                          return (
                            <TableCell
                              key={product!.slug}
                              className={`text-sm min-w-[250px] md:min-w-0 ${isWinner ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/30 dark:bg-emerald-900/10' : isDifferent ? 'text-amber-800 dark:text-amber-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                              <div className="flex items-center gap-1.5">
                                {isWinner && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                {isLoser && winnerIdx !== null && <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 opacity-40" />}
                                <span>{product!.features[key] ?? '—'}</span>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          <Separator className="my-6" />

          {/* Specifications Section with highlight indicators */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Specifications</h2>
            <Card className="overflow-hidden">
              <Table>
                <TableBody>
                  {allSpecKeys.map((key, rowIdx) => {
                    const isDifferent = hasDifferingValues(key, 'specifications');
                    const winnerIdx = getRowWinner(key, 'specifications');
                    return (
                      <TableRow key={key} className={`${isDifferent ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''} ${rowIdx % 2 === 1 ? 'bg-gray-50/30 dark:bg-gray-800/30' : ''}`}>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300 w-[200px] min-w-[200px] text-sm sticky left-0 bg-white dark:bg-gray-800 z-[5]">
                          {key}
                          {isDifferent && (
                            <Badge variant="outline" className="ml-2 text-[10px] border-amber-300 text-amber-700 dark:text-amber-400 py-0 px-1.5">
                              differs
                            </Badge>
                          )}
                        </TableCell>
                        {products.map((product, pIdx) => {
                          const isWinner = winnerIdx === pIdx;
                          const isLoser = winnerIdx !== null && winnerIdx !== pIdx;
                          return (
                            <TableCell
                              key={product!.slug}
                              className={`text-sm min-w-[250px] md:min-w-0 ${isWinner ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/30 dark:bg-emerald-900/10' : isDifferent ? 'text-amber-800 dark:text-amber-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                              <div className="flex items-center gap-1.5">
                                {isWinner && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                {isLoser && winnerIdx !== null && <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 opacity-40" />}
                                <span>{product!.specifications[key] ?? '—'}</span>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          <Separator className="my-6" />

          {/* Pros & Cons Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Pros & Cons</h2>
            {/* On mobile: stack vertically per product. On desktop: grid layout */}
            <div className="md:hidden space-y-4">
              {products.map((product) => (
                <Card key={product!.slug} className="overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3 line-clamp-2">{product!.title}</h3>
                    <div className="space-y-3">
                      {/* Pros */}
                      <div className="border border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-900/10 rounded-lg p-3">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 text-sm">Pros</h4>
                        <ul className="space-y-1.5">
                          {product!.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <div className="bg-emerald-500 rounded-full p-0.5 shrink-0 mt-0.5">
                                <Check size={10} className="text-white" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-xs">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Cons */}
                      <div className="border border-red-200 bg-red-50/50 dark:border-red-800/30 dark:bg-red-900/10 rounded-lg p-3">
                        <h4 className="font-bold text-red-800 dark:text-red-300 mb-2 text-sm">Cons</h4>
                        <ul className="space-y-1.5">
                          {product!.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <div className="bg-red-500 rounded-full p-0.5 shrink-0 mt-0.5">
                                <X size={10} className="text-white" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-xs">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Desktop grid layout */}
            <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              <div /> {/* Spacer */}

              {products.map((product) => (
                <div key={product!.slug} className="space-y-3">
                  {/* Pros */}
                  <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                    <CardContent className="p-3">
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 text-sm">Pros</h4>
                      <ul className="space-y-1.5">
                        {product!.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <div className="bg-emerald-500 rounded-full p-0.5 shrink-0 mt-0.5">
                              <Check size={10} className="text-white" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 text-xs">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Cons */}
                  <Card className="border-red-200 bg-red-50/50 dark:border-red-800/30 dark:bg-red-900/10">
                    <CardContent className="p-3">
                      <h4 className="font-bold text-red-800 dark:text-red-300 mb-2 text-sm">Cons</h4>
                      <ul className="space-y-1.5">
                        {product!.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <div className="bg-red-500 rounded-full p-0.5 shrink-0 mt-0.5">
                              <X size={10} className="text-white" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 text-xs">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Rating Breakdown Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Rating Breakdown</h2>
            {/* Mobile: stacked vertically */}
            <div className="md:hidden space-y-4">
              {products.map((product) => (
                <Card key={product!.slug}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3 line-clamp-2">{product!.title}</h3>
                    <div className="flex flex-col items-center mb-3">
                      <ScoreBadge rating={product!.rating} size="md" />
                    </div>
                    <RatingBreakdownDisplay breakdown={product!.ratingBreakdown} />
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Desktop: grid layout */}
            <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              <div /> {/* Spacer */}

              {products.map((product) => (
                <Card key={product!.slug}>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center mb-3">
                      <ScoreBadge rating={product!.rating} size="md" />
                    </div>
                    <RatingBreakdownDisplay breakdown={product!.ratingBreakdown} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Quick Comparison Table */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Comparison Table</h2>
            <ComparisonTable productSlugs={items} onRemoveProduct={removeItem} />
          </div>

          <Separator className="my-6" />

          {/* Add More Products */}
          <div className="text-center py-4">
            {items.length < 4 && (
              <Button
                variant="outline"
                onClick={() => goToPage('home')}
                className="mr-3"
              >
                <Plus size={16} className="mr-2" />
                Browse Products
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
