'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useRouterStore } from '@/lib/router';
import { StarRating } from './RatingBar';
import { Disclosure } from './Disclosure';
import { CheckPriceButton } from './AffiliateLink';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Package, Heart, BarChart3, Eye, Award } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist';
import { useCompareStore } from '@/lib/compare';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  showAffiliate?: boolean;
}

export function ProductCard({ product, showAffiliate = true }: ProductCardProps) {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const goToCategory = useRouterStore((s) => s.goToCategory);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const isWishlisted = isInWishlist(product.slug);
  const toggleCompare = useCompareStore((s) => s.toggleItem);
  const isInCompare = useCompareStore((s) => s.isInCompare);
  const isCompared = isInCompare(product.slug);
  const [imgError, setImgError] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  return (
    <Card className="group overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl card-hover-lift border-glow hover:border-[#febd69]/40">
      {/* Image */}
      <div
        className="relative cursor-pointer overflow-hidden bg-gray-50 dark:bg-gray-700 aspect-square image-zoom"
        onClick={() => goToProduct(product.slug)}
      >
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-amber-400 dark:text-amber-300">
              <Package className="w-16 h-16" />
            </div>
          </div>
        )}

        {/* Heart/Wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.slug);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 z-10 hover:scale-110"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{ color: isWishlisted ? '#ef4444' : undefined }}
        >
          <Heart
            size={16}
            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}
          />
        </button>

        {/* Review status badge */}
        {product.reviewStatus === 'verified' && (
          <div className="absolute bottom-2 right-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1" style={{ fontSize: '10px' }}>
            <Award size={8} />
            Verified
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3 sm:p-4">
        {/* Category */}
        <button
          onClick={() => goToCategory(product.categorySlug)}
          className="text-[11px] sm:text-xs bg-[#007185]/10 text-[#007185] dark:bg-[#007185]/20 dark:text-[#5cc7d4] hover:text-[#c7511f] hover:bg-[#c7511f]/10 px-2 py-0.5 rounded-full font-medium transition-colors duration-200 mb-1.5"
        >
          {product.category}
        </button>

        {/* Title */}
        <h3
          className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm leading-tight mb-1.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200 line-clamp-2"
          onClick={() => goToProduct(product.slug)}
        >
          {product.title}
        </h3>

        {/* Best For Tags — elegant badge chips */}
        {product.bestFor && product.bestFor.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.bestFor.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="badge-chip bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50"
              >
                <Tag size={8} className="shrink-0" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <StarRating rating={product.rating} size="sm" />

        {/* Excerpt */}
        <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">{product.excerpt}</p>

        {/* Subtle divider */}
        <div className="border-t border-gray-100 dark:border-gray-700/50 my-2.5" />

        {/* Compare & Quick View */}
        <div className="flex sm:flex-col gap-2 sm:gap-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product.slug);
            }}
            className={`flex items-center gap-1.5 sm:mt-1 text-xs font-medium transition-colors duration-200 ${
              isCompared
                ? 'text-amber-700 dark:text-amber-400 hover:text-amber-900'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
          >
            <BarChart3 size={14} className={isCompared ? 'fill-amber-200 dark:fill-amber-800' : ''} />
            Compare
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="flex items-center gap-1.5 sm:mt-1.5 text-xs font-medium text-gray-400 hover:text-[#007185] dark:hover:text-[#5cc7d4] transition-colors duration-200"
            aria-label="Quick view"
          >
            <Eye size={14} />
            Quick View
          </button>
        </div>

        {/* Affiliate CTA */}
        {showAffiliate && (
          <div className="mt-3">
            <Disclosure compact />
            <CheckPriceButton
              merchant={product.merchant}
              productId={product.asin}
              size="sm"
              className="w-full mt-2 cta-shimmer bg-gradient-to-r from-[#febd69] via-[#f3a847] to-[#febd69] hover:shadow-md hover:shadow-amber-500/20 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            />
          </div>
        )}
      </CardContent>

      {/* Quick View Modal */}
      <QuickViewModal
        productSlug={product.slug}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </Card>
  );
}

interface ProductCardHorizontalProps {
  product: Product;
}

export function ProductCardHorizontal({ product }: ProductCardHorizontalProps) {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer card-hover-lift border-glow hover:border-[#febd69]/40"
      onClick={() => goToProduct(product.slug)}
    >
      {/* Image */}
      <div className="w-32 h-32 shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain p-2"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-amber-400 dark:text-amber-300">
            <Package className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200 line-clamp-2">
          {product.title}
        </h3>
        <StarRating rating={product.rating} size="sm" />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{product.excerpt}</p>
        {product.bestFor && product.bestFor.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.bestFor.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="badge-chip bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              >
                <Tag size={8} className="shrink-0" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
