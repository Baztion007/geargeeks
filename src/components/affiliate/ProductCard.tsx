'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useRouterStore } from '@/lib/router';
import { StarRating } from './RatingBar';
import { Disclosure } from './Disclosure';
import { CheckPriceButton } from './AffiliateLink';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Package, Heart, BarChart3, Eye, CheckCircle, Bookmark } from 'lucide-react';
import { ScoreBadge } from '@/components/affiliate/ScoreBadge';
import { useWishlistStore } from '@/lib/wishlist';
import { useCompareStore } from '@/lib/compare';
import { useBookmarkStore } from '@/lib/bookmarks';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  showAffiliate?: boolean;
  hideDisclosure?: boolean;
}

export function ProductCard({ product, showAffiliate = true, hideDisclosure = false }: ProductCardProps) {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const goToCategory = useRouterStore((s) => s.goToCategory);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const isWishlisted = isInWishlist(product.slug);
  const toggleCompare = useCompareStore((s) => s.toggleItem);
  const isInCompare = useCompareStore((s) => s.isInCompare);
  const isCompared = isInCompare(product.slug);
  const addBookmark = useBookmarkStore((s) => s.addBookmark);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const isBookmarked = useBookmarkStore((s) => s.isBookmarked(product.slug));
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Fix hydration mismatch - bookmark state from localStorage differs from SSR
  React.useEffect(() => { setMounted(true); }, []);

  return (
    <Card className="group overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl card-border-animate card-entrance-scroll flex flex-col h-full">
      {/* Image */}
      <div
        className="relative cursor-pointer overflow-hidden bg-gray-50 dark:bg-gray-700 aspect-square image-shine"
        onClick={() => goToProduct(product.slug)}
      >
        {/* Skeleton loading state */}
        {imgLoading && product.image && !imgError && (
          <div className="absolute inset-0 img-skeleton z-[1]" />
        )}
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.title}
            className={`w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ${imgLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            loading="lazy"
            onError={() => { setImgError(true); setImgLoading(false); }}
            onLoad={() => setImgLoading(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-amber-400 dark:text-amber-300">
              <Package className="w-16 h-16" />
            </div>
          </div>
        )}

        {/* Gradient overlay — visible on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Score Circle — top-left, overlapping image, circular badge */}
        <div className="absolute top-2 left-2 z-10">
          <ScoreBadge rating={product.rating} size="sm" />
        </div>

        {/* Verified Review Badge — top-left below score, more prominent with pulse */}
        {product.reviewStatus === 'verified' && (
          <div className="absolute top-14 left-2 verified-badge verified-badge-pulse z-10">
            <CheckCircle size={10} />
            Verified
          </div>
        )}

        {/* Heart/Wishlist button — top-right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isBookmarked) removeBookmark(product.slug);
              else addBookmark(product.slug);
            }}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
            aria-label={mounted && isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark
              size={18}
              className={mounted && isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-gray-400 hover:text-amber-400'}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.slug);
            }}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{ color: isWishlisted ? '#ef4444' : undefined }}
          >
            <Heart
              size={18}
              className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category — colored left border accent */}
        <button
          onClick={() => goToCategory(product.categorySlug)}
          className="category-pill-accent mb-2"
        >
          {product.category}
        </button>

        {/* Title — bolder, slightly larger */}
        <h3
          className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-tight mb-2 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200 line-clamp-2"
          onClick={() => goToProduct(product.slug)}
        >
          {product.title}
        </h3>

        {/* Best For Tags — compact and elegant */}
        {product.bestFor && product.bestFor.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.bestFor.slice(0, 2).map((tag) => (
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

        {/* Star Rating only (ScoreBadge is now in the image) */}
        <StarRating rating={product.rating} size="sm" showValue />

        {/* Excerpt */}
        <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">{product.excerpt}</p>

        {/* Subtle divider */}
        <div className="border-t border-gray-100 dark:border-gray-700/50 my-3" />

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

        {/* Affiliate CTA — with shimmer sweep animation */}
        {showAffiliate && (
          <div className="mt-auto pt-3">
            {!hideDisclosure && <Disclosure compact />}
            <CheckPriceButton
              merchant={product.merchant}
              productId={product.asin}
              size="sm"
              className="w-full mt-2 cta-primary cta-sweep rounded-lg text-sm py-2.5 hover:shadow-lg hover:shadow-amber-500/25"
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
    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer card-hover-lift hover:border-[#febd69]/40"
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
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200 line-clamp-2">
            {product.title}
          </h3>
          {product.reviewStatus === 'verified' && (
            <div className="verified-badge shrink-0">
              <CheckCircle size={10} />
              Verified
            </div>
          )}
        </div>
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
