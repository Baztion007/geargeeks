'use client';

import React, { useState, useEffect } from 'react';
import { getProductBySlug, getRelatedProducts } from '@/data/products';
import { getAuthorBySlug } from '@/data/authors';
import { getCategoryBySlug } from '@/data/categories';
import { useRouterStore } from '@/lib/router';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Disclosure, EditorialIndependence } from '@/components/affiliate/Disclosure';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
import { StarRating, RatingBreakdownDisplay } from '@/components/affiliate/RatingBar';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { UserReviewsSection } from '@/components/affiliate/UserReviewsSection';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from '@/components/ui/table';
import { Check, X, Clock, User, BookOpen, Award, History } from 'lucide-react';
import { PriceAlertButton } from '@/components/affiliate/PriceAlertButton';
import { ImageLightbox } from '@/components/affiliate/ImageLightbox';
import { useRecentlyViewedStore } from '@/lib/recently-viewed';

interface ProductDetailPageProps {
  productSlug: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getReviewStatusBadge(status: string) {
  switch (status) {
    case 'verified':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-semibold">
          <Award size={12} className="mr-1" />
          Verified Review
        </Badge>
      );
    case 'updated':
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold">
          <Clock size={12} className="mr-1" />
          Updated Review
        </Badge>
      );
    case 'new':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs font-semibold">
          <BookOpen size={12} className="mr-1" />
          New Review
        </Badge>
      );
    default:
      return null;
  }
}

export default function ProductDetailPage({ productSlug }: ProductDetailPageProps) {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const goToCategory = useRouterStore((s) => s.goToCategory);
  const goToAuthor = useRouterStore((s) => s.goToAuthor);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const addView = useRecentlyViewedStore((s) => s.addView);
  const recentlyViewedItems = useRecentlyViewedStore((s) => s.items);

  const product = getProductBySlug(productSlug);

  // Track recently viewed product
  useEffect(() => {
    if (productSlug) {
      addView(productSlug);
    }
  }, [productSlug, addView]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <X size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">
          We couldn&apos;t find the product you&apos;re looking for. It may have been removed or the link may be incorrect.
        </p>
        <button
          onClick={() => useRouterStore.getState().goHome()}
          className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-6 py-3 rounded-lg transition-all hover:shadow-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const author = getAuthorBySlug(product.authorSlug);
  const category = getCategoryBySlug(product.categorySlug);
  const relatedProducts = getRelatedProducts(product.relatedProducts);

  // Get recently viewed products (excluding current product), max 5
  const recentlyViewedProducts = recentlyViewedItems
    .filter((slug) => slug !== productSlug)
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean)
    .slice(0, 5);

  const breadcrumbItems = [
    ...(category
      ? [
          {
            label: category.name,
            route: { page: 'category' as const, slug: category.slug },
          },
        ]
      : []),
    { label: product.title },
  ];

  return (
    <article className="max-w-5xl mx-auto px-4 py-6 pb-28 md:pb-6 dark:bg-gray-800 dark:rounded-xl">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Content freshness info */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          Published: {formatDate(product.publishedAt)}
        </span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          Updated: {formatDate(product.updatedAt)}
        </span>
        <span className="text-gray-300">|</span>
        <span>Status: {getReviewStatusBadge(product.reviewStatus)}</span>
      </div>

      {/* 2. Product Header - Image + Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Featured Image */}
        <div
          className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-gray-200 cursor-pointer image-zoom"
          onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
          role="button"
          tabIndex={0}
          aria-label="View full-size image"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setLightboxIndex(0); setLightboxOpen(true); } }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain p-6"
              loading="eager"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="w-full h-full items-center justify-center"
            style={{ display: product.image ? 'none' : 'flex' }}
          >
            <div className="text-center">
              <svg
                className="w-24 h-24 mx-auto text-gray-300 mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <circle cx="12" cy="12" r="4" />
                <path d="M2 7h20" />
              </svg>
              <p className="text-sm text-gray-400">{product.brand} Product Image</p>
            </div>
          </div>
          {/* Best For badge on image */}
          {product.bestFor && (
            <Badge className="absolute top-3 left-3 bg-[#febd69] text-[#131921] hover:bg-[#f3a847] text-xs font-semibold shadow-sm">
              <Award size={12} className="mr-1" />
              Best for: {product.bestFor}
            </Badge>
          )}
          {/* Sale badge */}
          {product.originalPrice && (
            <Badge variant="destructive" className="absolute top-3 right-3 text-xs font-bold shadow-sm">
              Sale
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
            {product.title}
          </h1>

          {/* Brand */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            by{' '}
            <span className="text-[#007185] font-medium hover:underline cursor-pointer">
              {product.brand}
            </span>
          </p>

          {/* Star Rating */}
          <div className="mb-3">
            <StarRating rating={product.rating} size="lg" />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{product.excerpt}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs text-gray-600 border-gray-300"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* 3. Disclosure before CTA */}
          <Disclosure />

          {/* 5. Check Price on Amazon Button */}
          <CheckPriceButton asin={product.asin} size="lg" className="w-full sm:w-auto cta-shimmer bg-gradient-to-r from-[#febd69] via-[#f3a847] to-[#febd69] hover:shadow-md hover:shadow-[#febd69]/20" />

          {/* Price Alert Button */}
          <div className="mt-3">
            <PriceAlertButton productSlug={product.slug} currentPrice={product.price} />
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* 4. Summary / Verdict Box */}
      <Card className="bg-amber-50 border-amber-200 mb-8 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="bg-amber-400 rounded-full p-2 shrink-0 mt-0.5 shadow-md shadow-amber-200/50">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-900 mb-2">Our Verdict</h2>
              <p className="text-amber-800 leading-relaxed">{product.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* 6. Features Table */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-1/3 font-semibold text-gray-700">Feature</TableHead>
                  <TableHead className="font-semibold text-gray-700">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(product.features).map(([key, value], index) => (
                  <TableRow key={key} className={`${index % 2 === 0 ? 'bg-gray-50/50' : ''} hover:bg-amber-50/50 transition-colors`}>
                    <TableCell className="font-medium text-gray-700 whitespace-nowrap">{key}</TableCell>
                    <TableCell className="text-gray-600">{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* 7. Full Review Content */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Full Review</h2>
        <div className="prose prose-gray max-w-none">
          {product.fullReview.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* 8. Pros and Cons Lists - Side by Side */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pros & Cons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pros */}
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-5">
              <h3 className="font-bold text-emerald-800 mb-3 text-lg">Pros</h3>
              <ul className="space-y-2.5 stagger-children">
                {product.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="bg-emerald-500 rounded-full p-0.5 shrink-0 mt-0.5">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-gray-700 text-sm">{pro}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Cons */}
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-5">
              <h3 className="font-bold text-red-800 mb-3 text-lg">Cons</h3>
              <ul className="space-y-2.5 stagger-children">
                {product.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="bg-red-500 rounded-full p-0.5 shrink-0 mt-0.5">
                      <X size={14} className="text-white" />
                    </div>
                    <span className="text-gray-700 text-sm">{con}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8" />

      {/* 9. Rating Breakdown */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Rating Breakdown</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Overall score */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="text-5xl font-bold text-amber-600 mb-1">
                  {product.rating.toFixed(1)}
                </div>
                <StarRating rating={product.rating} size="md" showValue={false} />
                <span className="text-sm text-gray-500 mt-1">Overall Score</span>
              </div>

              {/* Breakdown bars */}
              <div className="flex-1 w-full">
                <RatingBreakdownDisplay breakdown={product.ratingBreakdown} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* 10. Specifications Table */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Specifications</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-1/3 font-semibold text-gray-700">
                    Specification
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <TableRow key={key} className={`${index % 2 === 0 ? 'bg-gray-50/50' : ''} hover:bg-amber-50/50 transition-colors`}>
                    <TableCell className="font-medium text-gray-700 whitespace-nowrap">{key}</TableCell>
                    <TableCell className="text-gray-600">{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* 11. Who Is It For / Who Should Skip - Two columns */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Is This Right for You?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Who Is It For */}
          <Card className="border-emerald-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-emerald-100 rounded-full p-1.5">
                  <Check size={18} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-emerald-800 text-lg">Who Is It For</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{product.whoIsItFor}</p>
            </CardContent>
          </Card>

          {/* Who Should Skip */}
          <Card className="border-orange-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-orange-100 rounded-full p-1.5">
                  <X size={18} className="text-orange-600" />
                </div>
                <h3 className="font-bold text-orange-800 text-lg">Who Should Skip</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{product.whoShouldSkip}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8" />

      {/* 12. Review Transparency Box */}
      <section className="mb-8">
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="bg-[#131921] rounded-full p-2 shrink-0">
                <BookOpen size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3">Review Transparency</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500 shrink-0" />
                    <span className="text-gray-600">
                      Reviewed by:{' '}
                      {author ? (
                        <button
                          onClick={() => goToAuthor(author.slug)}
                          className="text-[#007185] hover:underline font-medium"
                        >
                          {author.name}
                        </button>
                      ) : (
                        <span className="font-medium">Unknown</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500 shrink-0" />
                    <span className="text-gray-600">
                      Last Updated: {formatDate(product.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-500 shrink-0" />
                    <span className="text-gray-600">
                      Published: {formatDate(product.publishedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-gray-500 shrink-0" />
                    <span className="text-gray-600">
                      Status:{' '}
                      <span className="font-medium capitalize">{product.reviewStatus}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Our reviews are based on hands-on testing, manufacturer specifications, and
                    comparison with competing products. We research user feedback, expert opinions,
                    and independent test results to provide comprehensive and unbiased evaluations.
                  </p>
                </div>
                <div className="mt-3">
                  <EditorialIndependence />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* User Reviews */}
      <UserReviewsSection productSlug={productSlug} />

      <Separator className="my-8" />

      {/* 13. Final CTA */}
      <section className="mb-8 text-center">
        <Card className="bg-gradient-to-r from-[#131921] to-[#232f3e] border-0 shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Ready to Buy the {product.brand} {product.title.split(' ').slice(-2).join(' ')}?
            </h2>
            <p className="text-gray-300 mb-5">
              Check the latest price and availability on Amazon
            </p>
            <CheckPriceButton asin={product.asin} size="lg" className="w-full sm:w-auto cta-shimmer bg-gradient-to-r from-[#febd69] via-[#f3a847] to-[#febd69] hover:shadow-lg hover:shadow-[#febd69]/30" />
            <p className="text-xs text-gray-400 mt-3">
              Price and availability are subject to change. As an Amazon Associate, we earn from
              qualifying purchases.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* 14. Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewedProducts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <History size={20} className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyViewedProducts.map((rvProduct) => (
              <ProductCard key={rvProduct!.id} product={rvProduct!} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 safe-area-bottom">
        <div className="h-px bg-gradient-to-r from-transparent via-[#febd69] to-transparent" />
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">As an Amazon Associate I earn from qualifying purchases.</p>
          </div>
          <CheckPriceButton asin={product.asin} size="sm" className="shrink-0" />
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={product.gallery || [product.image]}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        productName={product.title}
      />
    </article>
  );
}
