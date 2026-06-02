'use client';

import React from 'react';
import { useRecentlyViewedStore } from '@/lib/recently-viewed';
import { getProductBySlug } from '@/data/products';
import { useRouterStore } from '@/lib/router';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/affiliate/RatingBar';
import { Package, Clock, X } from 'lucide-react';
import type { Product } from '@/lib/types';

export function RecentlyViewedWidget() {
  const recentlyViewed = useRecentlyViewedStore((s) => s.recentlyViewed);
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const clearRecentlyViewed = useRecentlyViewedStore((s) => s.clearRecentlyViewed);

  const prods = recentlyViewed
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is Product => p !== undefined)
    .slice(0, 5);

  if (prods.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 bg-gray-50 dark:bg-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recently Viewed
            </h3>
          </div>
          <button
            onClick={clearRecentlyViewed}
            className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {prods.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer shrink-0 w-44 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl snap-start"
              onClick={() => goToProduct(product.slug)}
            >
              <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-50 dark:bg-gray-700">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <CardContent className="p-2.5">
                <h4 className="font-medium text-xs text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">
                  {product.title}
                </h4>
                <StarRating rating={product.rating} size="sm" showValue={false} />
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                  {product.category}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
