'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useRouterStore } from '@/lib/router';
import { StarRating } from './RatingBar';
import { Disclosure } from './Disclosure';
import { CheckPriceButton } from './AffiliateLink';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Coffee, Heart, BarChart3 } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist';
import { useCompareStore } from '@/lib/compare';

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

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 rounded-lg">
      {/* Image */}
      <div
        className="relative cursor-pointer overflow-hidden bg-gray-50 aspect-square"
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
          className={`absolute top-2 ${product.originalPrice ? 'right-10' : 'right-2'} w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all z-10 ${
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
          <Badge variant="destructive" className="absolute top-2 right-2 text-xs font-bold shadow-sm">
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
      <CardContent className="p-4">
        {/* Category */}
        <button
          onClick={() => goToCategory(product.categorySlug)}
          className="text-xs text-[#007185] hover:text-[#c7511f] hover:underline mb-1"
        >
          {product.category}
        </button>

        {/* Title */}
        <h3
          className="font-semibold text-gray-900 text-sm leading-tight mb-2 cursor-pointer hover:text-[#c7511f] line-clamp-2"
          onClick={() => goToProduct(product.slug)}
        >
          {product.title}
        </h3>

        {/* Rating */}
        <StarRating rating={product.rating} size="sm" />

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
          )}
        </div>

        {/* Excerpt */}
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{product.excerpt}</p>

        {/* Compare Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCompare(product.slug);
          }}
          className={`flex items-center gap-1.5 mt-2 text-xs font-medium transition-colors ${
            isCompared
              ? 'text-amber-700 hover:text-amber-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
        >
          <BarChart3 size={14} className={isCompared ? 'fill-amber-200' : ''} />
          Compare
        </button>

        {/* Affiliate CTA */}
        {showAffiliate && (
          <div className="mt-3">
            <Disclosure compact />
            <CheckPriceButton asin={product.asin} size="sm" className="w-full mt-2" />
          </div>
        )}
      </CardContent>
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
    <div className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all cursor-pointer"
      onClick={() => goToProduct(product.slug)}
    >
      {/* Image */}
      <div className="w-32 h-32 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
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
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 hover:text-[#c7511f] line-clamp-2">
          {product.title}
        </h3>
        <StarRating rating={product.rating} size="sm" />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.excerpt}</p>
        {product.bestFor && (
          <Badge className="mt-2 bg-[#febd69] text-[#131921] hover:bg-[#f3a847] text-xs">
            Best for: {product.bestFor}
          </Badge>
        )}
      </div>
    </div>
  );
}
