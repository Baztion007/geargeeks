'use client';

import React, { useState } from 'react';
import { products } from '@/data/products';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
import { StarRating } from '@/components/affiliate/RatingBar';
import { Disclosure } from '@/components/affiliate/Disclosure';
import { useRouterStore } from '@/lib/router';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle2, XCircle, Tag, BookOpen } from 'lucide-react';

interface QuickViewModalProps {
  productSlug: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ productSlug, isOpen, onClose }: QuickViewModalProps) {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const [imgError, setImgError] = useState(false);

  const product = productSlug
    ? products.find((p) => p.slug === productSlug)
    : null;

  // Reset image error when product changes
  React.useEffect(() => {
    setImgError(false);
  }, [productSlug]);

  if (!product) return null;

  const handleReadFullReview = () => {
    onClose();
    goToProduct(product.slug);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogTitle className="sr-only">Quick View: {product.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Quick overview of {product.title} including rating, pros, and cons.
        </DialogDescription>

        <div className="flex flex-col md:flex-row">
          {/* Product Image - Left Side */}
          <div className="md:w-2/5 shrink-0 bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-6 md:rounded-l-lg">
            <div className="w-full aspect-square relative">
              {product.image && !imgError ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-amber-400 dark:text-amber-300">
                  <Package className="w-24 h-24" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Right Side */}
          <div className="md:w-3/5 p-5 md:p-6 flex flex-col gap-3">
            {/* Category Badge */}
            <Badge variant="outline" className="w-fit text-xs text-[#007185] dark:text-[#5cc7d4] border-[#007185]/30 dark:border-[#5cc7d4]/30">
              {product.category}
            </Badge>

            {/* Title */}
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {product.title}
            </h2>

            {/* Star Rating + Rating Number */}
            <StarRating rating={product.rating} size="sm" showValue />

            {/* Best For Tags */}
            {product.bestFor && product.bestFor.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.bestFor.map((tag) => (
                  <Badge key={tag} className="bg-[#febd69] text-[#131921] hover:bg-[#f3a847] text-xs font-semibold">
                    <Tag size={10} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Summary */}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{product.summary}</p>

            {/* Pros (first 3) */}
            {product.pros.length > 0 && (
              <div className="mt-1">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Pros</h4>
                <ul className="space-y-1">
                  {product.pros.slice(0, 3).map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons (first 2) */}
            {product.cons.length > 0 && (
              <div className="mt-1">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Cons</h4>
                <ul className="space-y-1">
                  {product.cons.slice(0, 2).map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclosure */}
            <div className="mt-1">
              <Disclosure compact />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2 mt-1">
              <CheckPriceButton merchant={product.merchant} productId={product.asin} size="md" className="w-full" />
              <button
                onClick={handleReadFullReview}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[#007185] dark:text-[#5cc7d4] border border-[#007185]/30 dark:border-[#5cc7d4]/30 rounded-lg hover:bg-[#007185]/5 dark:hover:bg-[#5cc7d4]/10 transition-colors"
              >
                <BookOpen size={16} />
                Read Full Review
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
