'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getBrandBySlug, getBrandsByCategory, brands } from '@/data/brands';
import { getProductsByBrand } from '@/data/products';
import { buyingGuides } from '@/data/buying-guides';
import { useRouterStore } from '@/lib/router';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/affiliate/RatingBar';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Disclosure } from '@/components/affiliate/Disclosure';
import { Building2, MapPin, Calendar, ExternalLink, ArrowLeft, Package, Globe, BookOpen, Users, ChevronDown, ChevronUp, Trophy, Sparkles } from 'lucide-react';

interface BrandPageProps {
  brandSlug: string;
}

// ─── Brand accent color from name hash ─────────────────────────────────
function getBrandAccent(brandName: string): { color: string; light: string; glow: string; gradient: string } {
  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  const color = `hsl(${hue}, 70%, 55%)`;
  const light = `hsla(${hue}, 70%, 55%, 0.12)`;
  const glow = `hsla(${hue}, 70%, 55%, 0.25)`;
  const gradient = `linear-gradient(135deg, hsl(${hue}, 70%, 20%), hsl(${hue}, 50%, 12%))`;
  return { color, light, glow, gradient };
}

// ─── Animated Counter Component ────────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(value * eased * 10) / 10);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span ref={ref} className="animate-count-up tabular-nums">
      {Number.isInteger(value) ? Math.round(display) : display.toFixed(1)}{suffix}
    </span>
  );
}

// ─── Brand Story Timeline ──────────────────────────────────────────────
function BrandStory({ brand, avgRating, brandProducts }: { brand: NonNullable<ReturnType<typeof getBrandBySlug>>; avgRating: number; brandProducts: ReturnType<typeof getProductsByBrand> }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const facts = [
    ...(brand.founded ? [{ icon: Calendar, label: 'Founded', value: brand.founded }] : []),
    ...(brand.headquarters ? [{ icon: MapPin, label: 'Headquarters', value: brand.headquarters }] : []),
    { icon: Package, label: 'Products Reviewed', value: `${brand.productCount} items` },
    { icon: Users, label: 'Categories', value: `${brand.categories.length} categor${brand.categories.length !== 1 ? 'ies' : 'y'}` },
    ...(avgRating > 0 ? [{ icon: Trophy, label: 'Average Rating', value: `${avgRating.toFixed(1)} / 5.0` }] : []),
  ];

  if (facts.length === 0) return null;

  return (
    <Card className="mb-8 overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm">Brand Story</span>
        </div>
        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {isExpanded && (
        <CardContent className="px-4 pb-4 pt-0">
          <div className="space-y-0">
            {facts.map((fact, idx) => {
              const Icon = fact.icon;
              return (
                <div key={fact.label} className="flex items-start gap-3 relative">
                  {/* Timeline line */}
                  {idx < facts.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 z-10">
                    <Icon size={14} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="py-1.5">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{fact.label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{fact.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function BrandPage({ brandSlug }: BrandPageProps) {
  const brand = getBrandBySlug(brandSlug);
  const goToBrand = useRouterStore((s) => s.goToBrand);
  const goToCategory = useRouterStore((s) => s.goToCategory);
  const goHome = useRouterStore((s) => s.goHome);
  const goToBuyingGuide = useRouterStore((s) => s.goToBuyingGuide);

  const brandProducts = useMemo(() => getProductsByBrand(brandSlug), [brandSlug]);

  // Find buying guides that mention products from this brand
  const brandGuides = useMemo(() => {
    if (!brand) return [];
    return buyingGuides.filter((guide) =>
      guide.recommendedProducts.some((slug) =>
        brandProducts.some((p) => p.slug === slug)
      )
    );
  }, [brand, brandProducts]);

  // Find related brands (share categories)
  const relatedBrands = useMemo(() => {
    if (!brand) return [];
    const brandCategorySet = new Set(brand.categories);
    return brands
      .filter((b) => b.slug !== brand.slug && b.categories.some((c) => brandCategorySet.has(c)))
      .slice(0, 6);
  }, [brand]);

  // Sort state for products
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'updated'>('rating');
  const sortedProducts = useMemo(() => {
    const sorted = [...brandProducts];
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'updated':
        return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      default:
        return sorted;
    }
  }, [brandProducts, sortBy]);

  // Brand not found state
  if (!brand) {
    return (
      <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Building2 size={32} className="text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Brand Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              We couldn&apos;t find the brand you&apos;re looking for. Browse our featured brands to discover more.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={goHome} className="bg-amber-500 hover:bg-amber-400 text-[#0f172a] font-bold">
                <ArrowLeft size={16} className="mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Average rating across brand products
  const avgRating = brandProducts.length > 0
    ? brandProducts.reduce((sum, p) => sum + p.rating, 0) / brandProducts.length
    : 0;

  const accent = getBrandAccent(brand.name);

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900" style={{ '--brand-accent': accent.color, '--brand-glow': accent.glow } as React.CSSProperties}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', route: { page: 'home' } },
            { label: brand.name },
          ]}
        />

        {/* ─── Premium Brand Showcase Hero ─────────────────────────────── */}
        <Card className="mb-6 overflow-hidden border-0 shadow-xl ring-1 ring-black/5">
          <div className="relative overflow-hidden p-6 sm:p-8 md:p-10" style={{ background: accent.gradient }}>
            {/* Brand initial watermark */}
            <div className="brand-watermark right-[-2%] bottom-[-15%] text-white">
              {brand.name.charAt(0).toUpperCase()}
            </div>

            {/* Decorative floating shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[10%] right-[20%] w-24 h-24 rounded-full border border-white/10 bg-white/5 hero-float-1" />
              <div className="absolute bottom-[10%] right-[8%] w-16 h-16 rounded-lg border border-white/8 bg-white/3 hero-float-2" style={{ animationDelay: '1s' }} />
              <div className="absolute top-[30%] right-[35%] w-8 h-8 rounded-full hero-float-3" style={{ background: accent.color, opacity: 0.15, animationDelay: '2s' }} />
            </div>

            <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
              {/* Brand Logo/Icon — large circle with accent glow */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border-2 border-white/15 shadow-xl shadow-black/20 hero-float-3" style={{ boxShadow: `0 20px 40px -12px rgba(0,0,0,0.3), 0 0 40px -8px ${accent.glow}` }}>
                <span className="text-5xl sm:text-6xl font-black text-white/90">{brand.name.charAt(0).toUpperCase()}</span>
              </div>

              {/* Brand Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">{brand.name}</h1>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-5 max-w-2xl">{brand.description}</p>

                {/* Meta info row */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
                  {brand.founded && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <Calendar size={14} style={{ color: accent.color }} />
                      <span>Founded {brand.founded}</span>
                    </div>
                  )}
                  {brand.headquarters && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <MapPin size={14} style={{ color: accent.color }} />
                      <span>{brand.headquarters}</span>
                    </div>
                  )}
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#febd69] text-sm transition-colors"
                      style={{ color: accent.color }}
                    >
                      <Globe size={14} />
                      <span>Official Website</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                {/* ─── Animated Stats Row ─────────────────────────────── */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
                    <Package size={16} style={{ color: accent.color }} />
                    <span className="text-white text-sm font-semibold">
                      <AnimatedCounter value={brand.productCount} /> Products Reviewed
                    </span>
                  </div>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
                      <Trophy size={16} style={{ color: accent.color }} />
                      <span className="text-white text-sm font-semibold">
                        <AnimatedCounter value={avgRating} /> Avg. Rating
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
                    <Users size={16} style={{ color: accent.color }} />
                    <span className="text-white text-sm font-semibold">
                      <AnimatedCounter value={brand.categories.length} /> Categor{brand.categories.length !== 1 ? 'ies' : 'y'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom accent bar */}
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${accent.color}, transparent)` }} />
        </Card>

        {/* ─── Brand Story Timeline ────────────────────────────────────── */}
        <BrandStory brand={brand} avgRating={avgRating} brandProducts={brandProducts} />

        {/* Products by this brand */}
        {brandProducts.length > 0 && (
          <section className="mb-8 section-entrance">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Products by {brand.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Sort by:</span>
                <div className="flex gap-1">
                  {[
                    { key: 'rating' as const, label: 'Top Rated' },
                    { key: 'name' as const, label: 'Name' },
                    { key: 'updated' as const, label: 'Recently Updated' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSortBy(opt.key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        sortBy === opt.key
                          ? 'text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-[#febd69]/50'
                      }`}
                      style={sortBy === opt.key ? { background: accent.color, color: '#fff' } : undefined}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedProducts.map((product, index) => (
                <div key={product.id} className={`brand-tinted-hover card-entrance card-entrance-delay-${Math.min(index + 1, 8)}`} style={{ '--brand-accent': `${accent.color}80`, '--brand-glow': accent.glow } as React.CSSProperties}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Disclosure />
            </div>
          </section>
        )}

        {/* Buying Guides mentioning this brand */}
        {brandGuides.length > 0 && (
          <section className="mb-8 section-entrance">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Buying Guides Featuring {brand.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandGuides.map((guide) => (
                <Card
                  key={guide.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer card-hover-lift brand-tinted-hover"
                  style={{ '--brand-accent': `${accent.color}80`, '--brand-glow': accent.glow } as React.CSSProperties}
                  onClick={() => goToBuyingGuide(guide.slug)}
                >
                  {/* Guide Image */}
                  <div className="relative h-40 overflow-hidden" style={{ background: accent.gradient }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <div className="absolute bottom-3 left-3 z-20">
                      <Badge className="text-[10px] font-semibold uppercase tracking-wider" style={{ background: accent.color, color: '#fff' }}>
                        {guide.guideType.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700 text-[10px]">
                        <BookOpen size={10} className="mr-1" />
                        {guide.readingTime} min
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {guide.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Brand Categories */}
        <section className="mb-8 section-entrance">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {brand.name} Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {brand.categories.map((catSlug) => {
              const catName = catSlug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
              return (
                <Button
                  key={catSlug}
                  variant="outline"
                  onClick={() => goToCategory(catSlug)}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#febd69] hover:text-[#131921] dark:hover:text-[#febd69] brand-tinted-hover"
                  style={{ '--brand-accent': `${accent.color}80`, '--brand-glow': accent.glow } as React.CSSProperties}
                >
                  {catName}
                </Button>
              );
            })}
          </div>
        </section>

        {/* Related Brands */}
        {relatedBrands.length > 0 && (
          <section className="mb-8 section-entrance">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Related Brands
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {relatedBrands.map((rb) => {
                const rbAccent = getBrandAccent(rb.name);
                return (
                  <Card
                    key={rb.slug}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 card-hover-lift brand-tinted-hover"
                    style={{ '--brand-accent': `${rbAccent.color}80`, '--brand-glow': rbAccent.glow } as React.CSSProperties}
                    onClick={() => goToBrand(rb.slug)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: rbAccent.light }}>
                        <span className="text-lg font-bold" style={{ color: rbAccent.color }}>{rb.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {rb.name}
                      </h3>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {rb.productCount} product{rb.productCount !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
