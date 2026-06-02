'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useRouterStore } from '@/lib/router';
import { StarRating } from './RatingBar';
import { Disclosure } from './Disclosure';
import { CheckPriceButton } from './AffiliateLink';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Coffee, Heart, BarChart3, Eye } from 'lucide-react';
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
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg card-hover-lift hover:border-[#febd69]/30 hover:ring-1 hover:ring-[#febd69]/20">
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
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-400">
              <Coffee className="w-16 h-16" />
            </div>
          </div>
        )}

        {/* Best For Badge */}
        {product.bestFor && (
          <Badge className="absolute top-2 left-2 bg-[#febd69] text-[#131921] hover:bg-[#f3a847] text-xs font-semibold shadow-sm">
            <Tag size={10} className="mr-1" />
            {product.bestFor}
          </Badge>
        )}

        {/* Heart/Wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.slug);
          }}
          className={`absolute top-2 ${product.originalPrice ? 'right-10' : 'right-2'} w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 z-10 ${
            isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            className={isWishlisted ? 'fill-red-500' : ''}
          />
        </button>

        {/* Sale badge */}
        {product.originalPrice && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-xs font-bold shadow-sm pulse-badge">
            Sale
          </Badge>
        )}

        {/* Review status badge */}
        {product.reviewStatus === 'verified' && (
          <div className="absolute bottom-2 right-2 bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            ✓ Verified
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3 sm:p-4">
        {/* Category */}
        <button
          onClick={() => goToCategory(product.categorySlug)}
          className="text-[11px] sm:text-xs bg-[#007185]/10 text-[#007185] dark:bg-[#007185]/20 dark:text-[#5cc7d4] hover:text-[#c7511f] hover:bg-[#c7511f]/10 px-2 py-0.5 rounded-full font-medium transition-colors mb-1"
        >
          {product.category}
        </button>

        {/* Title */}
        <h3
          className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm leading-tight mb-2 cursor-pointer hover:text-[#c7511f] line-clamp-2"
          onClick={() => goToProduct(product.slug)}
        >
          {product.title}
        </h3>

        {/* Rating */}
        <StarRating rating={product.rating} size="sm" />

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">{product.originalPrice}</span>
          )}
        </div>

        {/* Excerpt */}
        <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{product.excerpt}</p>

        {/* Subtle divider */}
        <div className="border-t border-gray-100 dark:border-gray-700 my-2" />

        {/* Compare & Quick View - side by side on mobile, stacked on larger screens */}
        <div className="flex sm:flex-col gap-2 sm:gap-0">
          {/* Compare Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product.slug);
            }}
            className={`flex items-center gap-1.5 sm:mt-2 text-xs font-medium transition-colors ${
              isCompared
                ? 'text-amber-700 hover:text-amber-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
          >
            <BarChart3 size={14} className={isCompared ? 'fill-amber-200' : ''} />
            Compare
          </button>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="flex items-center gap-1.5 sm:mt-1 text-xs font-medium text-gray-400 hover:text-[#007185] transition-colors"
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
            <CheckPriceButton asin={product.asin} size="sm" className="w-full mt-2 cta-shimmer bg-gradient-to-r from-[#febd69] via-[#f3a847] to-[#febd69] hover:shadow-md hover:shadow-[#febd69]/20" />
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
    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all cursor-pointer card-hover-lift hover:border-[#febd69]/30"
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
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-400">
            <Coffee className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1 hover:text-[#c7511f] line-clamp-2">
          {product.title}
        </h3>
        <StarRating rating={product.rating} size="sm" />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{product.excerpt}</p>
        {product.bestFor && (
          <Badge className="mt-2 bg-[#febd69] text-[#131921] hover:bg-[#f3a847] text-xs">
            Best for: {product.bestFor}
          </Badge>
        )}
      </div>
    </div>
  );
}
