'use client';

import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Disclosure } from '@/components/affiliate/Disclosure';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
import { StarRating } from '@/components/affiliate/RatingBar';
import { products, getBestSellers } from '@/data/products';
import { categories } from '@/data/categories';
import { useRouterStore } from '@/lib/router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  TrendingUp,
  Star,
  Award,
  Crown,
  Medal,
  Filter,
  ExternalLink,
} from 'lucide-react';

export function BestSellersPage() {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sort all products by rating (descending) for best sellers
  const allBestSellers = useMemo(() => {
    return [...products].sort((a, b) => b.rating - a.rating);
  }, []);

  const bestSellerCategories = useMemo(() => {
    const cats = new Set(allBestSellers.map((p) => p.categorySlug));
    return categories.filter((c) => cats.has(c.slug));
  }, [allBestSellers]);

  const filteredSellers = useMemo(() => {
    if (selectedCategory === 'all') return allBestSellers;
    return allBestSellers.filter((p) => p.categorySlug === selectedCategory);
  }, [allBestSellers, selectedCategory]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-amber-500 text-white',
        2: 'bg-gray-400 text-white',
        3: 'bg-amber-700 text-white',
      };
      return (
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
            colors[rank as keyof typeof colors]
          }`}
        >
          #{rank}
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-lg">
        #{rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Best Sellers' }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">Best Sellers</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Our highest-rated coffee equipment, ranked by expert review scores. Every product
              on this list has been thoroughly tested and approved by our team.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1.5 text-[#febd69]">
                <TrendingUp size={14} />
                {allBestSellers.length} Products Ranked
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <Star size={14} className="fill-current" />
                By Expert Rating
              </span>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {selectedCategory === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {allBestSellers.slice(0, 3).map((product, index) => {
              const rank = index + 1;
              return (
                <Card
                  key={product.id}
                  className={`overflow-hidden cursor-pointer hover:shadow-xl transition-all border-2 ${
                    rank === 1
                      ? 'border-amber-400 md:-mt-4'
                      : rank === 2
                      ? 'border-gray-300'
                      : 'border-amber-700/50'
                  }`}
                  onClick={() => goToProduct(product.slug)}
                >
                  {/* Rank header */}
                  <div
                    className={`p-3 flex items-center justify-center gap-2 ${
                      rank === 1
                        ? 'bg-amber-500'
                        : rank === 2
                        ? 'bg-gray-400'
                        : 'bg-amber-700'
                    } text-white`}
                  >
                    {getRankIcon(rank)}
                    <span className="font-bold text-lg">
                      {rank === 1 ? 'Best Overall' : rank === 2 ? 'Runner Up' : 'Best Value'}
                    </span>
                  </div>
                  <CardContent className="p-4 text-center">
                    {/* Image */}
                    <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-contain p-2"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="2" y="3" width="20" height="18" rx="2" />
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <button className="text-[#007185] hover:text-[#c7511f] hover:underline text-xs mb-1">
                      {product.category}
                    </button>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <StarRating rating={product.rating} size="sm" showValue />
                    <div className="mt-2 flex items-baseline justify-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <CheckPriceButton asin={product.asin} size="sm" className="w-full mt-3" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-gray-500 mr-1" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#131921] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {bestSellerCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-[#131921] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ranked List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#c7511f]" />
              {selectedCategory === 'all'
                ? 'All Categories'
                : bestSellerCategories.find((c) => c.slug === selectedCategory)?.name}{' '}
              Rankings
            </h2>
            <span className="text-sm text-gray-500">
              {filteredSellers.length} product{filteredSellers.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {filteredSellers.map((product, index) => {
              const rank = index + 1;
              // Offset rank when showing category-filtered list with top-3 podium visible
              const displayRank = selectedCategory === 'all' ? rank : rank;

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#007185]/30 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => goToProduct(product.slug)}
                >
                  {/* Rank */}
                  <div className="shrink-0">{getRankBadge(displayRank)}</div>

                  {/* Image */}
                  <div className="w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="2" y="3" width="20" height="18" rx="2" />
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#007185]">{product.category}</span>
                      {product.reviewStatus === 'verified' && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5">
                          ✓ Verified
                        </Badge>
                      )}
                      {product.bestFor && (
                        <Badge className="bg-[#febd69]/20 text-[#131921] hover:bg-[#febd69]/20 text-[10px] px-1.5">
                          {product.bestFor}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-1 hover:text-[#c7511f]">
                      {product.title}
                    </h3>
                    <StarRating rating={product.rating} size="sm" />
                  </div>

                  {/* Price & CTA */}
                  <div className="shrink-0 text-right hidden sm:block">
                    <div className="flex items-baseline justify-end gap-2 mb-2">
                      <span className="text-lg font-bold text-gray-900">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <CheckPriceButton asin={product.asin} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSellers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found in this category.</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <Disclosure />
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Rankings are based on our expert review scores and reflect our team&apos;s testing and
              evaluation. Individual preferences and needs may vary. We encourage you to read our
              full reviews before making a purchase decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
