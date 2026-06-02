'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useCompareStore } from '@/lib/compare';
import { useRouterStore } from '@/lib/router';
import { getProductBySlug } from '@/data/products';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { StarRating, RatingBreakdownDisplay } from '@/components/affiliate/RatingBar';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { X, Check, Coffee, ShoppingBag, BarChart3, Plus, ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react';

export function ComparePage() {
  const items = useCompareStore((s) => s.items);
  const removeItem = useCompareStore((s) => s.removeItem);
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
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Compare Products</h1>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add at least 2 products to compare their features, specifications, and ratings side by side.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => goToPage('best-sellers')}
              className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold"
            >
              <ShoppingBag size={16} className="mr-2" />
              Browse Best Sellers
            </Button>
          </div>
          {products.length === 1 && (
            <p className="text-sm text-gray-400 mt-4">
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <Breadcrumbs items={[{ label: 'Compare Products' }]} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Comparing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearCompare}
          className="text-gray-500 hover:text-red-600"
        >
          Clear All
        </Button>
      </div>

      {/* Swipe hint - mobile only */}
      {showSwipeHint && (
        <div className="md:hidden flex items-center justify-center gap-2 text-xs text-gray-400 mb-3 animate-pulse">
          <ArrowLeftRight size={14} />
          <span>Swipe to compare products</span>
          <ArrowLeftRight size={14} />
        </div>
      )}

      {/* Scroll arrows - mobile only */}
      {canScrollLeft && (
        <button
          onClick={() => scrollByAmount('left')}
          className="md:hidden fixed left-1 bottom-36 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollByAmount('right')}
          className="md:hidden fixed right-1 bottom-36 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
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

            {products.map((product) => (
              <Card key={product!.slug} className="relative snap-start">
                {/* Remove button */}
                <button
                  onClick={() => removeItem(product!.slug)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center z-10 transition-colors"
                  aria-label={`Remove ${product!.title} from compare`}
                >
                  <X size={14} className="text-gray-500 hover:text-red-600" />
                </button>

                <CardContent className="p-4 text-center">
                  {/* Image */}
                  <div
                    className="w-full aspect-square max-w-[180px] mx-auto rounded-lg overflow-hidden bg-gray-50 mb-3 cursor-pointer"
                    onClick={() => goToProduct(product!.slug)}
                  >
                    {product!.image ? (
                      <img
                        src={product!.image}
                        alt={product!.title}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-50">
                        <Coffee size={40} className="text-amber-400" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="font-semibold text-gray-900 text-sm leading-tight mb-2 cursor-pointer hover:text-[#c7511f] line-clamp-2"
                    onClick={() => goToProduct(product!.slug)}
                  >
                    {product!.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">{product!.price}</span>
                    {product!.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">{product!.originalPrice}</span>
                    )}
                  </div>

                  {/* Star Rating */}
                  <div className="flex justify-center mb-3">
                    <StarRating rating={product!.rating} size="sm" />
                  </div>

                  {/* CTA */}
                  <CheckPriceButton asin={product!.asin} size="sm" className="w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Features Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Key Features</h2>
            <Card className="overflow-hidden">
              <Table>
                <TableBody>
                  {allFeatureKeys.map((key) => {
                    const isDifferent = hasDifferingValues(key, 'features');
                    return (
                      <TableRow key={key} className={isDifferent ? 'bg-amber-50/50' : ''}>
                        <TableCell className="font-medium text-gray-700 w-[200px] min-w-[200px] text-sm">
                          {key}
                          {isDifferent && (
                            <Badge variant="outline" className="ml-2 text-[10px] border-amber-300 text-amber-700 py-0 px-1.5">
                              differs
                            </Badge>
                          )}
                        </TableCell>
                        {products.map((product) => (
                          <TableCell
                            key={product!.slug}
                            className={`text-sm min-w-[250px] md:min-w-0 ${isDifferent ? 'text-amber-800 font-medium' : 'text-gray-600'}`}
                          >
                            {product!.features[key] ?? '—'}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          <Separator className="my-6" />

          {/* Specifications Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Specifications</h2>
            <Card className="overflow-hidden">
              <Table>
                <TableBody>
                  {allSpecKeys.map((key) => {
                    const isDifferent = hasDifferingValues(key, 'specifications');
                    return (
                      <TableRow key={key} className={isDifferent ? 'bg-amber-50/50' : ''}>
                        <TableCell className="font-medium text-gray-700 w-[200px] min-w-[200px] text-sm">
                          {key}
                          {isDifferent && (
                            <Badge variant="outline" className="ml-2 text-[10px] border-amber-300 text-amber-700 py-0 px-1.5">
                              differs
                            </Badge>
                          )}
                        </TableCell>
                        {products.map((product) => (
                          <TableCell
                            key={product!.slug}
                            className={`text-sm min-w-[250px] md:min-w-0 ${isDifferent ? 'text-amber-800 font-medium' : 'text-gray-600'}`}
                          >
                            {product!.specifications[key] ?? '—'}
                          </TableCell>
                        ))}
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">Pros & Cons</h2>
            {/* On mobile: stack vertically per product. On desktop: grid layout */}
            <div className="md:hidden space-y-4">
              {products.map((product) => (
                <Card key={product!.slug} className="overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2">{product!.title}</h3>
                    <div className="space-y-3">
                      {/* Pros */}
                      <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-3">
                        <h4 className="font-bold text-emerald-800 mb-2 text-sm">Pros</h4>
                        <ul className="space-y-1.5">
                          {product!.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <div className="bg-emerald-500 rounded-full p-0.5 shrink-0 mt-0.5">
                                <Check size={10} className="text-white" />
                              </div>
                              <span className="text-gray-700 text-xs">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Cons */}
                      <div className="border border-red-200 bg-red-50/50 rounded-lg p-3">
                        <h4 className="font-bold text-red-800 mb-2 text-sm">Cons</h4>
                        <ul className="space-y-1.5">
                          {product!.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <div className="bg-red-500 rounded-full p-0.5 shrink-0 mt-0.5">
                                <X size={10} className="text-white" />
                              </div>
                              <span className="text-gray-700 text-xs">{con}</span>
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
                  <Card className="border-emerald-200 bg-emerald-50/50">
                    <CardContent className="p-3">
                      <h4 className="font-bold text-emerald-800 mb-2 text-sm">Pros</h4>
                      <ul className="space-y-1.5">
                        {product!.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <div className="bg-emerald-500 rounded-full p-0.5 shrink-0 mt-0.5">
                              <Check size={10} className="text-white" />
                            </div>
                            <span className="text-gray-700 text-xs">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Cons */}
                  <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="p-3">
                      <h4 className="font-bold text-red-800 mb-2 text-sm">Cons</h4>
                      <ul className="space-y-1.5">
                        {product!.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <div className="bg-red-500 rounded-full p-0.5 shrink-0 mt-0.5">
                              <X size={10} className="text-white" />
                            </div>
                            <span className="text-gray-700 text-xs">{con}</span>
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

          {/* Rating Breakdown Section - stack vertically on mobile */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Rating Breakdown</h2>
            {/* Mobile: stacked vertically */}
            <div className="md:hidden space-y-4">
              {products.map((product) => (
                <Card key={product!.slug}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2">{product!.title}</h3>
                    <div className="flex flex-col items-center mb-3">
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        {product!.rating.toFixed(1)}
                      </div>
                      <StarRating rating={product!.rating} size="sm" showValue={false} />
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
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        {product!.rating.toFixed(1)}
                      </div>
                      <StarRating rating={product!.rating} size="sm" showValue={false} />
                    </div>
                    <RatingBreakdownDisplay breakdown={product!.ratingBreakdown} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Add More Products */}
          <div className="text-center py-4">
            {items.length < 4 && (
              <Button
                variant="outline"
                onClick={() => goToPage('best-sellers')}
                className="mr-3"
              >
                <Plus size={16} className="mr-2" />
                Add More Products
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
