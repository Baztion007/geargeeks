'use client';

import React, { useState, useEffect } from 'react';
import { useRecentlyViewedStore } from '@/lib/recently-viewed';
import { useDataStore, useEnsureData } from '@/lib/data-store';
import { useRouterStore } from '@/lib/router';
import { StarRating } from '@/components/affiliate/RatingBar';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, Trash2, Eye, X, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';

export function RecentlyViewedWidget() {
  useEnsureData();
  const products = useDataStore((s) => s.products);
  const recentlyViewed = useRecentlyViewedStore((s) => s.recentlyViewed);
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const clearRecentlyViewed = useRecentlyViewedStore((s) => s.clearRecentlyViewed);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileHidden, setIsMobileHidden] = useState(false);

  const prods = recentlyViewed
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined)
    .slice(0, 8);

  // Auto-hide on mobile after 5 seconds
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && prods.length > 0) {
      const timer = setTimeout(() => {
        setIsMobileHidden(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [prods.length]);

  if (prods.length === 0) return null;
  if (isMobileHidden) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden">
        <button
          onClick={() => setIsMobileHidden(false)}
          className="w-full px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
        >
          <Eye className="w-3 h-3" />
          Show recently viewed ({prods.length})
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-2.5">
          {/* Header */}
          <div className="flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 hidden sm:inline">Recently Viewed</span>
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-[9px] font-bold px-1.5 py-0">
              {prods.length}
            </Badge>
          </div>

          {/* Scrollable product strip */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {prods.map((product) => (
              <button
                key={product.id}
                onClick={() => goToProduct(product.slug)}
                className="group flex items-center gap-2 shrink-0 px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-7 h-7 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-0.5"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                </div>
                {/* Title + Rating */}
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight max-w-[120px]">
                    {product.title}
                  </p>
                  <StarRating rating={product.rating} size="xs" showValue={false} />
                </div>
              </button>
            ))}
          </div>

          {/* Clear All button */}
          <button
            onClick={() => {
              clearRecentlyViewed();
              setIsVisible(false);
            }}
            className="text-[10px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-0.5 shrink-0 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Close on mobile */}
          <button
            onClick={() => setIsMobileHidden(true)}
            className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
