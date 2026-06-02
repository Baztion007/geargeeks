'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getProductBySlug, getProductsByCategory } from '@/data/products';
import { getBrandBySlug } from '@/data/brands';
import { getAuthorBySlug } from '@/data/authors';
import { getCategoryBySlug } from '@/data/categories';
import { useRouterStore } from '@/lib/router';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Disclosure, EditorialIndependence } from '@/components/affiliate/Disclosure';
import { CheckPriceButton, ViewLatestDealButton } from '@/components/affiliate/AffiliateLink';
import { StarRating, RatingBreakdownDisplay } from '@/components/affiliate/RatingBar';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { UserReviewsSection } from '@/components/affiliate/UserReviewsSection';
import { getAffiliateUrl, getAffiliateLinkProps, getMerchantName } from '@/lib/affiliate';
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
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Clock,
  User,
  BookOpen,
  Award,
  History,
  Package,
  ExternalLink,
  Share2,
  Twitter,
  Facebook,
  Link2,
  ChevronRight,
  List,
  ImageIcon,
} from 'lucide-react';
import { ImageLightbox } from '@/components/affiliate/ImageLightbox';
import { useRecentlyViewedStore } from '@/lib/recently-viewed';
import { toast } from '@/hooks/use-toast';

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
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-semibold">
          <Award size={12} className="mr-1" />
          Verified Review
        </Badge>
      );
    case 'updated':
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300 text-xs font-semibold">
          <Clock size={12} className="mr-1" />
          Updated Review
        </Badge>
      );
    case 'new':
      return (
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300 text-xs font-semibold">
          <BookOpen size={12} className="mr-1" />
          New Review
        </Badge>
      );
    default:
      return null;
  }
}

// ─── Social Share Buttons ────────────────────────────────────────────────────
function SocialShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out this review: ${title} — GearScope`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: 'Link copied!', description: 'The link has been copied to your clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Error', description: 'Failed to copy link.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <Share2 size={12} />
        Share:
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={14} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={14} />
      </a>
      <button
        onClick={handleCopyLink}
        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        aria-label="Copy link"
      >
        <Link2 size={14} />
      </button>
    </div>
  );
}

// ─── Table of Contents ────────────────────────────────────────────────────
function TableOfContents() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'verdict', label: 'Our Verdict' },
    { id: 'features', label: 'Key Features' },
    { id: 'full-review', label: 'Full Review' },
    { id: 'pros-cons', label: 'Pros & Cons' },
    { id: 'rating', label: 'Rating Breakdown' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'who-is-it-for', label: 'Is This Right for You?' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-4">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <List size={14} />
          Table of Contents
        </h3>
        <nav>
          <ul className="space-y-1">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <button
                  onClick={() => handleClick(id)}
                  className={`text-sm w-full text-left px-3 py-1.5 rounded-md transition-all duration-200 ${
                    activeSection === id
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 font-semibold toc-active-indicator'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────
function ImageGallery({ gallery, title }: { gallery: string[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const images = gallery.length > 0 ? gallery : [];

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center border border-gray-200 dark:border-gray-600">
        <Package className="w-24 h-24 text-slate-300 dark:text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div
        className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer image-zoom"
        onClick={() => { setLightboxOpen(true); }}
        role="button"
        tabIndex={0}
        aria-label="View full-size image"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setLightboxOpen(true); } }}
      >
        {!imgErrors[selectedIndex] ? (
          <img
            src={images[selectedIndex]}
            alt={`${title} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-contain p-6"
            loading="eager"
            onError={() => setImgErrors((prev) => ({ ...prev, [selectedIndex]: true }))}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-24 h-24 text-slate-300 dark:text-slate-400" />
          </div>
        )}
        {/* Image counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
          <ImageIcon size={12} />
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 shrink-0 thumbnail-select ${
                idx === selectedIndex
                  ? 'border-amber-500 ring-2 ring-amber-500/20 scale-105'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 hover:scale-105'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              {!imgErrors[idx] ? (
                <img
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain p-1 bg-gray-50 dark:bg-gray-700"
                  loading="lazy"
                  onError={() => setImgErrors((prev) => ({ ...prev, [idx]: true }))}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Package size={16} className="text-gray-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={selectedIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        productName={title}
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ProductDetailPage({ productSlug }: ProductDetailPageProps) {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const goToCategory = useRouterStore((s) => s.goToCategory);
  const goToAuthor = useRouterStore((s) => s.goToAuthor);
  const goToBrand = useRouterStore((s) => s.goToBrand);
  const addView = useRecentlyViewedStore((s) => s.addView);
  const recentlyViewedItems = useRecentlyViewedStore((s) => s.items);

  const product = getProductBySlug(productSlug);

  // Track recently viewed product
  useEffect(() => {
    if (productSlug) {
      addView(productSlug);
    }
  }, [productSlug, addView]);

  // Calculate reading time estimate
  const readingTime = useMemo(() => {
    if (!product) return 0;
    const wordCount = product.fullReview.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <X size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          We couldn&apos;t find the product you&apos;re looking for. It may have been removed or the link may be incorrect.
        </p>
        <button
          onClick={() => useRouterStore.getState().goHome()}
          className="bg-amber-500 hover:bg-amber-400 text-[#0f172a] font-bold px-6 py-3 rounded-lg transition-all hover:shadow-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const author = getAuthorBySlug(product.authorSlug);
  const category = getCategoryBySlug(product.categorySlug);
  const brand = getBrandBySlug(product.brandSlug);

  // Related products: same category, excluding current
  const relatedProducts = getProductsByCategory(product.categorySlug)
    .filter((p) => p.slug !== productSlug)
    .slice(0, 3);

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

  const merchantName = getMerchantName(product.merchant);
  const affiliateUrl = getAffiliateUrl({ merchant: product.merchant, productId: product.asin });
  const affiliateLinkProps = getAffiliateLinkProps(affiliateUrl);

  return (
    <article className="max-w-5xl mx-auto px-4 py-6 pb-28 md:pb-6">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Content freshness info */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          Published: {formatDate(product.publishedAt)}
        </span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          Updated: {formatDate(product.updatedAt)}
        </span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span>Status: {getReviewStatusBadge(product.reviewStatus)}</span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span className="flex items-center gap-1">
          <BookOpen size={12} />
          {readingTime} min read
        </span>
      </div>

      {/* 2. Product Header - Image Gallery + Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Image Gallery */}
        <ImageGallery gallery={product.gallery} title={product.title} />

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3 tracking-tight">
            {product.title}
          </h1>

          {/* Brand with link */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            by{' '}
            <button
              onClick={() => goToBrand(product.brandSlug)}
              className="text-[#007185] dark:text-[#5cc7d4] font-medium hover:underline"
            >
              {product.brand}
            </button>
          </p>

          {/* Star Rating */}
          <div className="mb-3">
            <StarRating rating={product.rating} size="lg" />
          </div>

          {/* Best For Tags */}
          {product.bestFor && product.bestFor.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.bestFor.map((bf) => (
                <Badge
                  key={bf}
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200 text-xs font-medium"
                >
                  <Award size={10} className="mr-1" />
                  {bf}
                </Badge>
              ))}
            </div>
          )}

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{product.excerpt}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Social Share */}
          <div className="mb-4">
            <SocialShareButtons title={product.title} />
          </div>

          {/* Disclosure before CTA */}
          <Disclosure />

          {/* Check Price / View Latest Deal CTA */}
          <ViewLatestDealButton
            merchant={product.merchant}
            productId={product.asin}
            size="lg"
            className="w-full sm:w-auto cta-shimmer bg-gradient-to-r from-[#febd69] via-[#f3a847] to-[#febd69] hover:shadow-lg hover:shadow-amber-500/20 rounded-lg font-bold text-lg h-14 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          />

          <p className="text-[10px] text-gray-400 mt-2">
            Price and availability are subject to change. As an affiliate, we earn from qualifying purchases.
          </p>
        </div>
      </div>

      {/* Table of Contents + Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 mb-8">
        {/* Sticky TOC on desktop */}
        <div className="hidden md:block">
          <div className="sticky top-6">
            <TableOfContents />
          </div>
        </div>

        <div>
          {/* Verdict Box */}
          <Card id="verdict" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300 section-entrance">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500 rounded-full p-2 shrink-0 mt-0.5 shadow-md shadow-amber-200/50 dark:shadow-amber-900/30">
                  <Award size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">Our Verdict</h2>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed">{product.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Table */}
          <section id="features" className="mb-8 section-entrance">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                      <TableHead className="w-1/3 font-semibold text-gray-700 dark:text-gray-300">Feature</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(product.features).map(([key, value], index) => (
                      <TableRow key={key} className={`${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''} hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors`}>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{key}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* Full Review Content */}
          <section id="full-review" className="mb-8 section-entrance">
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

          {/* Pros and Cons */}
          <section id="pros-cons" className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pros & Cons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pros */}
              <Card className="border-emerald-200 dark:border-emerald-800/30 pros-card">
                <CardContent className="p-5">
                  <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3 text-lg flex items-center gap-2">Pros</h3>
                  <ul className="space-y-2.5">
                    {product.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="bg-emerald-500 rounded-full p-0.5 shrink-0 mt-0.5">
                          <Check size={14} className="text-white" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Cons */}
              <Card className="border-red-200 dark:border-red-800/30 cons-card">
                <CardContent className="p-5">
                  <h3 className="font-bold text-red-800 dark:text-red-300 mb-3 text-lg flex items-center gap-2">Cons</h3>
                  <ul className="space-y-2.5">
                    {product.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="bg-red-500 rounded-full p-0.5 shrink-0 mt-0.5">
                          <X size={14} className="text-white" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{con}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-8" />

          {/* Rating Breakdown */}
          <section id="rating" className="mb-8 section-entrance">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Rating Breakdown</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="text-5xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                      {product.rating.toFixed(1)}
                    </div>
                    <StarRating rating={product.rating} size="md" showValue={false} />
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overall Score</span>
                  </div>
                  <div className="flex-1 w-full">
                    <RatingBreakdownDisplay breakdown={product.ratingBreakdown} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* Specifications Table */}
          <section id="specifications" className="mb-8 section-entrance">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Specifications</h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                      <TableHead className="w-1/3 font-semibold text-gray-700 dark:text-gray-300">
                        Specification
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <TableRow key={key} className={`${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''} hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors`}>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{key}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* Who Is It For / Who Should Skip */}
          <section id="who-is-it-for" className="mb-8 section-entrance">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Is This Right for You?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-emerald-200 dark:border-emerald-800/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-1.5">
                      <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">Who Is It For</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{product.whoIsItFor}</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 dark:border-orange-800/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-1.5">
                      <X size={18} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-bold text-orange-800 dark:text-orange-300 text-lg">Who Should Skip</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{product.whoShouldSkip}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile TOC (shown only on mobile) */}
      <div className="md:hidden mb-8">
        <TableOfContents />
      </div>

      <Separator className="my-8" />

      {/* Review Transparency Box */}
      <section className="mb-8">
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="bg-[#0f172a] dark:bg-gray-700 rounded-full p-2 shrink-0">
                <BookOpen size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Review Transparency</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Reviewed by:{' '}
                      {author ? (
                        <button
                          onClick={() => goToAuthor(author.slug)}
                          className="text-[#007185] dark:text-[#5cc7d4] hover:underline font-medium"
                        >
                          {author.name}
                        </button>
                      ) : (
                        <span className="font-medium">Unknown</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Last Updated: {formatDate(product.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Published: {formatDate(product.publishedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:{' '}
                      <span className="font-medium capitalize">{product.reviewStatus}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Available at: <span className="font-medium">{merchantName}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Reading time: <span className="font-medium">{readingTime} min</span>
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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

      {/* Final CTA */}
      <section className="mb-8 text-center">
        <Card className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] border-0 shadow-xl overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
              Ready to Check the {product.brand} {product.title.split(' ').slice(-2).join(' ')}?
            </h2>
            <p className="text-gray-300 mb-5">
              Check the latest price and availability on {merchantName}
            </p>
            <CheckPriceButton
              merchant={product.merchant}
              productId={product.asin}
              size="lg"
              className="w-full sm:w-auto cta-shimmer bg-gradient-to-r from-[#febd69] via-[#f3a847] to-[#febd69] hover:shadow-lg hover:shadow-amber-500/20 rounded-lg font-bold text-lg h-14 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            />
            <p className="text-xs text-gray-400 mt-3">
              Price and availability are subject to change. As an affiliate, we earn from qualifying purchases.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* Related Products */}
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
            <History size={20} className="text-gray-600 dark:text-gray-400" />
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
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{product.title}</h4>
            <StarRating rating={product.rating} size="sm" showValue />
          </div>
          <CheckPriceButton
            merchant={product.merchant}
            productId={product.asin}
            size="sm"
            className="shrink-0"
          />
        </div>
      </div>
    </article>
  );
}
