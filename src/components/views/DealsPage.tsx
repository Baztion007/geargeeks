'use client';

import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Disclosure } from '@/components/affiliate/Disclosure';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
import { StarRating } from '@/components/affiliate/RatingBar';
import { getDeals, products } from '@/data/products';
import { categories } from '@/data/categories';
import { useRouterStore } from '@/lib/router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tag,
  Percent,
  TrendingDown,
  Clock,
  Flame,
  Star,
  ExternalLink,
  Zap,
} from 'lucide-react';

function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
}

function calcSavingsPercent(current: string, original: string): number {
  const curr = parsePrice(current);
  const orig = parsePrice(original);
  if (orig === 0) return 0;
  return Math.round(((orig - curr) / orig) * 100);
}

export function DealsPage() {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const allDeals = useMemo(() => getDeals(), []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const dealCategories = useMemo(() => {
    const cats = new Set(allDeals.map((p) => p.categorySlug));
    return categories.filter((c) => cats.has(c.slug));
  }, [allDeals]);

  const filteredDeals = useMemo(() => {
    if (selectedCategory === 'all') return allDeals;
    return allDeals.filter((p) => p.categorySlug === selectedCategory);
  }, [allDeals, selectedCategory]);

  // Featured deal = highest savings percentage
  const featuredDeal = useMemo(() => {
    return allDeals.reduce((best, current) => {
      const bestSavings = best.originalPrice
        ? calcSavingsPercent(best.price, best.originalPrice)
        : 0;
      const currSavings = current.originalPrice
        ? calcSavingsPercent(current.price, current.originalPrice)
        : 0;
      return currSavings > bestSavings ? current : best;
    }, allDeals[0]);
  }, [allDeals]);

  if (allDeals.length === 0) {
    return (
      <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Breadcrumbs items={[{ label: 'Deals' }]} />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Deals Available</h2>
            <p className="text-gray-600">Check back soon for the latest coffee equipment deals!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Deals' }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">Today&apos;s Best Deals</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Save big on top-rated coffee equipment. We track the latest price drops so you
              don&apos;t have to.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1.5 text-[#febd69]">
                <Zap size={14} />
                {allDeals.length} Deals Available
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <Clock size={14} />
                Prices updated daily
              </span>
            </div>
          </div>
        </div>

        {/* Featured Deal */}
        {featuredDeal && featuredDeal.originalPrice && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6 border-2 border-[#febd69]">
            <div className="bg-[#febd69]/10 p-3 flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#c7511f]" />
              <span className="font-bold text-[#c7511f] text-sm uppercase tracking-wide">Featured Deal</span>
              <Badge variant="destructive" className="ml-auto text-xs font-bold">
                Save {calcSavingsPercent(featuredDeal.price, featuredDeal.originalPrice)}%
              </Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div
                  className="w-full md:w-48 h-48 shrink-0 bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => goToProduct(featuredDeal.slug)}
                >
                  {featuredDeal.image ? (
                    <img
                      src={featuredDeal.image}
                      alt={featuredDeal.title}
                      className="w-full h-full object-contain p-3"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="2" y="3" width="20" height="18" rx="2" />
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <button
                    onClick={() => goToProduct(featuredDeal.slug)}
                    className="text-[#007185] hover:text-[#c7511f] hover:underline text-sm mb-1"
                  >
                    {featuredDeal.category}
                  </button>
                  <h2
                    className="text-xl font-bold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-[#c7511f]"
                    onClick={() => goToProduct(featuredDeal.slug)}
                  >
                    {featuredDeal.title}
                  </h2>
                  <StarRating rating={featuredDeal.rating} size="md" />
                  <p className="text-sm text-gray-600 mt-2 mb-4">{featuredDeal.excerpt}</p>

                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold text-gray-900">{featuredDeal.price}</span>
                    <span className="text-lg text-gray-400 line-through">{featuredDeal.originalPrice}</span>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-sm font-bold">
                      Save {calcSavingsPercent(featuredDeal.price, featuredDeal.originalPrice)}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckPriceButton asin={featuredDeal.asin} size="md" />
                    <Button
                      variant="outline"
                      onClick={() => goToProduct(featuredDeal.slug)}
                      className="border-[#131921] text-[#131921]"
                    >
                      Read Full Review
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        )}

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-700 mr-2">Filter:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#131921] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Deals
            </button>
            {dealCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-[#131921] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Deals Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDeals.map((product) => {
              const savings = product.originalPrice
                ? calcSavingsPercent(product.price, product.originalPrice)
                : 0;
              return (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {/* Savings badge overlay */}
                  <div className="absolute top-2 right-2 z-10">
                    <Badge
                      variant="destructive"
                      className="text-xs font-bold shadow-md"
                    >
                      <Percent size={10} className="mr-0.5" />
                      {savings}% OFF
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredDeals.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">No deals found in this category.</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <Disclosure />
          <div className="flex items-start gap-3 mt-4">
            <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">About Our Deal Tracking</p>
              <p>
                We check prices daily, but deals can expire quickly. The prices shown were accurate
                at the time of our last update. Actual prices on Amazon may differ. Always verify
                the final price before purchasing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
