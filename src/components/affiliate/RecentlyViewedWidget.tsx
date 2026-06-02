'use client';

import React, { useState, useEffect } from 'react';
import { useRecentlyViewedStore } from '@/lib/recently-viewed';
import { getProductBySlug } from '@/data/products';
import { useRouterStore } from '@/lib/router';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/affiliate/RatingBar';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, X, Trash2, Eye, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/types';

// Timestamp storage for recently viewed products
const TIMESTAMP_KEY = 'gearscope-view-timestamps';

interface ViewTimestamp {
  slug: string;
  timestamp: number;
  isFirstView: boolean;
}

function getViewTimestamps(): ViewTimestamp[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TIMESTAMP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveViewTimestamps(timestamps: ViewTimestamp[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMESTAMP_KEY, JSON.stringify(timestamps));
}

function recordViewTimestamp(slug: string) {
  const timestamps = getViewTimestamps();
  const existing = timestamps.find((t) => t.slug === slug);
  if (existing) {
    existing.timestamp = Date.now();
    existing.isFirstView = false;
  } else {
    timestamps.unshift({ slug, timestamp: Date.now(), isFirstView: true });
  }
  saveViewTimestamps(timestamps);
}

function formatViewTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecentlyViewedWidget() {
  const recentlyViewed = useRecentlyViewedStore((s) => s.recentlyViewed);
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const clearRecentlyViewed = useRecentlyViewedStore((s) => s.clearRecentlyViewed);
  const [viewTimestamps, setViewTimestamps] = useState<ViewTimestamp[]>([]);

  // Load timestamps on mount
  useEffect(() => {
    setViewTimestamps(getViewTimestamps());
    // Also record timestamps for current recently viewed items
    recentlyViewed.forEach((slug) => {
      recordViewTimestamp(slug);
    });
    setViewTimestamps(getViewTimestamps());
  }, [recentlyViewed]);

  const prods = recentlyViewed
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is Product => p !== undefined)
    .slice(0, 5);

  if (prods.length === 0) return null;

  const getTimestamp = (slug: string): ViewTimestamp | undefined => {
    return viewTimestamps.find((t) => t.slug === slug);
  };

  const handleClearAll = () => {
    clearRecentlyViewed();
    // Also clear timestamps
    saveViewTimestamps([]);
    setViewTimestamps([]);
  };

  return (
    <section className="py-8 sm:py-10 bg-gray-50 dark:bg-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recently Viewed
            </h3>
            {/* View History count badge */}
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] font-bold px-1.5 gap-0.5">
              <Eye size={10} />
              {prods.length}
            </Badge>
          </div>
          {/* Clear All button */}
          <button
            onClick={handleClearAll}
            className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {prods.map((product) => {
            const ts = getTimestamp(product.slug);
            const isNew = ts?.isFirstView ?? false;

            return (
              <Card
                key={product.id}
                className="group cursor-pointer shrink-0 w-44 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl snap-start relative"
                onClick={() => goToProduct(product.slug)}
              >
                {/* "New" badge for first-time viewed products */}
                {isNew && (
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[9px] font-bold px-1.5 py-0 shadow-sm gap-0.5">
                      <Sparkles size={8} />
                      New
                    </Badge>
                  </div>
                )}

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
                  {/* View timestamp */}
                  {ts && (
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-0.5">
                      <Clock size={8} className="shrink-0" />
                      {formatViewTime(ts.timestamp)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
