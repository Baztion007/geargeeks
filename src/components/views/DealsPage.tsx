'use client';

import React, { useMemo } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { getTrending, getBestSellers } from '@/data/products';
import { categories } from '@/data/categories';
import { getAffiliateUrl, getAffiliateLinkProps, getMerchantName } from '@/lib/affiliate';
import { useRouterStore } from '@/lib/router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreBadge } from '@/components/affiliate/ScoreBadge';
import {
  Tag,
  Flame,
  Star,
  ExternalLink,
  ShoppingCart,
  TrendingUp,
  Package,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  Clock,
  Search,
  Scale,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Gift,
  Store,
} from 'lucide-react';
import type { Merchant } from '@/lib/types';

// ─── Merchant branding data ────────────────────────────────────────
const merchantDeals: {
  merchant: Merchant;
  color: string;
  bgColor: string;
  borderColor: string;
  darkBgColor: string;
  darkBorderColor: string;
  description: string;
  highlights: string[];
  icon: React.ElementType;
}[] = [
  {
    merchant: 'amazon',
    color: '#FF9900',
    bgColor: 'bg-[#FF9900]/10',
    borderColor: 'border-[#FF9900]/30',
    darkBgColor: 'dark:bg-[#FF9900]/15',
    darkBorderColor: 'dark:border-[#FF9900]/40',
    description: 'Prime-eligible deals on thousands of products with fast, free shipping and easy returns.',
    highlights: ['Prime Free Shipping', 'Lightning Deals Daily', 'Subscribe & Save'],
    icon: Zap,
  },
  {
    merchant: 'walmart',
    color: '#0071DC',
    bgColor: 'bg-[#0071DC]/10',
    borderColor: 'border-[#0071DC]/30',
    darkBgColor: 'dark:bg-[#0071DC]/15',
    darkBorderColor: 'dark:border-[#0071DC]/40',
    description: 'Rollbacks and everyday low prices on essentials, electronics, and more with free store pickup.',
    highlights: ['Free Store Pickup', 'Rollback Savings', 'Walmart+ Benefits'],
    icon: ShoppingCart,
  },
  {
    merchant: 'bestbuy',
    color: '#0046BE',
    bgColor: 'bg-[#0046BE]/10',
    borderColor: 'border-[#0046BE]/30',
    darkBgColor: 'dark:bg-[#0046BE]/15',
    darkBorderColor: 'dark:border-[#0046BE]/40',
    description: 'Top Deal and Deal of the Day on electronics, appliances, and tech with price-match guarantee.',
    highlights: ['Price Match Guarantee', 'Top Deals of the Week', 'My Best Buy Rewards'],
    icon: Tag,
  },
  {
    merchant: 'target',
    color: '#CC0000',
    bgColor: 'bg-[#CC0000]/10',
    borderColor: 'border-[#CC0000]/30',
    darkBgColor: 'dark:bg-[#CC0000]/15',
    darkBorderColor: 'dark:border-[#CC0000]/40',
    description: 'Circle offers and Target-run exclusives on home, electronics, and everyday essentials.',
    highlights: ['Target Circle Offers', 'Same-Day Delivery', 'Drive Up Free'],
    icon: Gift,
  },
  {
    merchant: 'rei',
    color: '#003A70',
    bgColor: 'bg-[#003A70]/10',
    borderColor: 'border-[#003A70]/30',
    darkBgColor: 'dark:bg-[#003A70]/15',
    darkBorderColor: 'dark:border-[#003A70]/40',
    description: 'Member-exclusive deals on outdoor gear, camping equipment, and adventure essentials.',
    highlights: ['REI Member Dividend', 'Garage Sales', 'Used Gear Savings'],
    icon: Store,
  },
  {
    merchant: 'bhphoto',
    color: '#C41A1A',
    bgColor: 'bg-[#C41A1A]/10',
    borderColor: 'border-[#C41A1A]/30',
    darkBgColor: 'dark:bg-[#C41A1A]/15',
    darkBorderColor: 'dark:border-[#C41A1A]/40',
    description: 'Deals on cameras, lenses, audio gear, and pro electronics from the photo & video experts.',
    highlights: ['Daily Deals', 'Used Equipment', 'Payboo Card Savings'],
    icon: Sparkles,
  },
];

// ─── Deal hunting tips ──────────────────────────────────────────────
const dealTips: {
  icon: React.ElementType;
  title: string;
  description: string;
}[] = [
  {
    icon: Search,
    title: 'Compare Across Retailers',
    description: 'Always check the same product on multiple retailers before buying. Prices can vary significantly between Amazon, Walmart, and Best Buy for the exact same item.',
  },
  {
    icon: Bell,
    title: 'Set Price Drop Alerts',
    description: 'Use our "Get Notified" feature on any product page to receive alerts when the price drops. You can set a target or get notified of any significant decrease.',
  },
  {
    icon: Clock,
    title: 'Time Your Purchase',
    description: 'Major sale events like Prime Day, Black Friday, and Cyber Monday offer the deepest discounts. Off-season buying also saves on seasonal gear.',
  },
  {
    icon: Scale,
    title: 'Check the Total Cost',
    description: 'Factor in shipping, taxes, and return policies when comparing deals. A lower listed price isn\'t always the best value once you include all costs.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify Seller Authenticity',
    description: 'On marketplaces with third-party sellers, verify you\'re buying from the official retailer or authorized dealer to ensure warranty coverage and genuine products.',
  },
  {
    icon: AlertCircle,
    title: 'Beware of Fake Reviews',
    description: 'Cross-reference reviews across multiple sources. GearGeekz\'s expert-tested reviews are independent and verified — we never accept payment for positive ratings.',
  },
];

export function DealsPage() {
  const goHome = useRouterStore((s) => s.goHome);
  const goToCategory = useRouterStore((s) => s.goToCategory);
  const goToProduct = useRouterStore((s) => s.goToProduct);

  // Data
  const bestSellers = useMemo(() => getBestSellers(), []);
  const trendingProducts = useMemo(() => getTrending(), []);
  const dealOfTheWeek = bestSellers[0]; // Top-rated product

  // Get some product ASINs per merchant for the "Shop Deals" CTA
  const getMerchantProductId = (merchant: Merchant): string => {
    const product = bestSellers.find((p) => p.merchant === merchant);
    return product?.asin ?? 'deal-page';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ─── Breadcrumbs ─────────────────────────────────────────── */}
        <Breadcrumbs items={[{ label: 'Deals' }]} />

        {/* ─── Hero Section ────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-xl ring-1 ring-black/5">
          <div className="bg-gradient-to-r from-[#131921] via-[#1e293b] to-[#0f172a] p-8 md:p-12 text-white">
            {/* Decorative floating elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[10%] right-[8%] w-24 h-24 rounded-full border-2 border-amber-500/10 bg-amber-500/5 hero-float-1" />
              <div className="absolute bottom-[15%] right-[20%] w-16 h-16 rounded-lg border border-amber-500/10 bg-amber-500/5 hero-float-2" style={{ animationDelay: '1s' }} />
              <div className="absolute top-[40%] right-[35%] w-10 h-10 rounded-full bg-amber-500/10 hero-float-3" style={{ animationDelay: '2s' }} />
              <div className="absolute top-[15%] right-[15%] flame-flicker" style={{ animationDelay: '0.3s' }}>
                <Tag className="w-12 h-12 text-amber-500/20" />
              </div>
              <div className="absolute bottom-[20%] right-[8%] flame-flicker" style={{ animationDelay: '0.8s' }}>
                <Gift className="w-8 h-8 text-orange-500/15" />
              </div>
              <div className="absolute top-[60%] right-[45%] w-40 h-40 rounded-full bg-amber-500/5 blur-2xl hero-float-slow" />
              <div className="absolute bottom-[5%] right-[3%] w-32 h-32 rounded-full bg-orange-500/5 blur-xl hero-float-2" style={{ animationDelay: '3s' }} />
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 hero-float-3">
                  <Tag className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Latest <span className="text-gradient">Deals &amp; Offers</span>
                </h1>
              </div>
              <p className="text-lg text-gray-300 max-w-3xl leading-relaxed mb-5">
                Find the best deals on expert-reviewed gear through our affiliate links.
                We connect you directly to trusted retailers so you always see the most current pricing.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-[#febd69]">
                  <Sparkles size={14} />
                  6 Trusted Retailers
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <ShieldCheck size={14} />
                  No Hidden Fees
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={14} />
                  Updated Regularly
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <TrendingUp size={14} />
                  Expert-Curated
                </span>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />
        </div>

        {/* ─── Deal of the Week (Featured Banner) ──────────────────── */}
        {dealOfTheWeek && (
          <div className="mb-8 section-entrance">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-amber-500 flame-flicker" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deal of the Week</h2>
              <Badge className="pulse-badge-enhanced bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider border-0">
                <Zap className="w-3 h-3 mr-1" />
                Top Rated
              </Badge>
            </div>
            <Card
              className="spotlight-card overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-amber-400/50 dark:border-amber-500/30 bg-white dark:bg-gray-800 rounded-2xl"
              onClick={() => goToProduct(dealOfTheWeek.slug)}
            >
              <div className="flex flex-col md:flex-row">
                {/* Product Image */}
                <div className="md:w-2/5 aspect-video md:aspect-auto bg-gray-50 dark:bg-gray-700 relative overflow-hidden min-h-[240px]">
                  {dealOfTheWeek.image ? (
                    <img
                      src={dealOfTheWeek.image}
                      alt={dealOfTheWeek.title}
                      className="w-full h-full object-contain p-6"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {/* Deal badge on image */}
                  <div className="absolute top-3 left-3">
                    <Badge className="pulse-badge-enhanced bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold border-0 shadow-lg shadow-amber-500/30">
                      <Flame className="w-3 h-3 mr-1" />
                      Deal of the Week
                    </Badge>
                  </div>
                  {/* Score badge */}
                  <div className="absolute bottom-3 right-3">
                    <ScoreBadge rating={dealOfTheWeek.rating} size="md" />
                  </div>
                </div>

                {/* Product Details */}
                <CardContent className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wide">
                    {dealOfTheWeek.category} · {dealOfTheWeek.brand}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                    {dealOfTheWeek.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                    {dealOfTheWeek.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          className={star <= Math.round(dealOfTheWeek.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                        />
                      ))}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white ml-1">
                        {dealOfTheWeek.rating.toFixed(1)}
                      </span>
                    </div>
                    {dealOfTheWeek.bestFor.length > 0 && (
                      <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 text-[10px] border border-amber-200 dark:border-amber-800/30">
                        {dealOfTheWeek.bestFor[0]}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      {...getAffiliateLinkProps(getAffiliateUrl({ merchant: dealOfTheWeek.merchant, productId: dealOfTheWeek.asin }))}
                      className="inline-flex items-center justify-center gap-2 cta-primary cta-sweep rounded-lg font-bold px-6 py-3 text-sm hover:shadow-lg hover:shadow-amber-500/25"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={16} />
                      Check Price on {getMerchantName(dealOfTheWeek.merchant)}
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      onClick={(e) => { e.stopPropagation(); goToProduct(dealOfTheWeek.slug); }}
                    >
                      Read Full Review
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* ─── Merchant-Specific Deal Sections ─────────────────────── */}
        <div className="mb-8 section-entrance">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shop by Retailer</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 max-w-2xl">
            Browse deals from our trusted retail partners. Each link takes you directly to the retailer for the most current pricing and availability.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {merchantDeals.map((md) => {
              const Icon = md.icon;
              const url = getAffiliateUrl({ merchant: md.merchant, productId: getMerchantProductId(md.merchant) });
              const linkProps = getAffiliateLinkProps(url);
              const merchantName = getMerchantName(md.merchant);

              return (
                <Card
                  key={md.merchant}
                  className={`group overflow-hidden bg-white dark:bg-gray-800 border ${md.borderColor} ${md.darkBorderColor} rounded-xl hover:shadow-xl transition-all duration-300 card-hover-lift`}
                >
                  <CardContent className="p-5">
                    {/* Merchant header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${md.bgColor} ${md.darkBgColor} flex items-center justify-center`}
                        style={{ boxShadow: `0 0 12px ${md.color}20` }}
                      >
                        <Icon size={20} style={{ color: md.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {merchantName}
                        </h3>
                        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: md.color }}>
                          Affiliate Partner
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      {md.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {md.highlights.map((h) => (
                        <span
                          key={h}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${md.bgColor} ${md.darkBgColor}`}
                          style={{ color: md.color }}
                        >
                          <CheckCircle2 size={10} />
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <a
                      {...linkProps}
                      className="inline-flex items-center justify-center gap-2 w-full rounded-lg font-semibold text-sm py-2.5 transition-all hover:shadow-md active:scale-[0.98]"
                      style={{
                        backgroundColor: md.color,
                        color: '#ffffff',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'brightness(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      <ExternalLink size={14} />
                      Shop {merchantName} Deals
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ─── Hot Products Section ────────────────────────────────── */}
        <div className="mb-8 section-entrance">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 flame-flicker" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hot Products Right Now</h2>
              <Badge className="pulse-badge-enhanced bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider border-0">
                <Flame className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {trendingProducts.length} products
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 max-w-2xl">
            These products are generating the most interest from our readers. Click &quot;Check Price&quot; to see the latest deal on each retailer&apos;s site.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {trendingProducts.map((product, index) => (
              <div key={product.id} className={`relative card-entrance card-entrance-delay-${Math.min(index + 1, 12)}`}>
                {/* Hot badge overlay */}
                {index < 4 && (
                  <div className="absolute top-2 right-2 z-20">
                    <Badge className="pulse-badge-enhanced bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold border-0 shadow-md">
                      <Flame className="w-2.5 h-2.5 mr-0.5" />
                      Hot Right Now
                    </Badge>
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* ─── Deal Categories ─────────────────────────────────────── */}
        <div className="mb-8 section-entrance">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Browse Deals by Category</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 max-w-2xl">
            Explore our expert reviews and find the best deals in each product category.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card
                key={category.slug}
                className="group overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:shadow-xl transition-all duration-300 card-hover-lift"
                onClick={() => goToCategory(category.slug)}
              >
                {/* Category image / gradient header */}
                <div className="relative h-28 overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* Gradient fallback (hidden when image loads) */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 ${category.image ? 'hidden' : ''}`}>
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-white/40" />
                    </div>
                  </div>
                  {/* Always overlay gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  {/* Product count badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/40 text-white text-[10px] border-0 backdrop-blur-sm">
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                    </Badge>
                  </div>
                  {/* Category name on image */}
                  <h3 className="absolute bottom-2 left-3 font-bold text-white text-sm leading-tight drop-shadow-md">
                    {category.name}
                  </h3>
                </div>

                <CardContent className="p-3">
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-medium group-hover:gap-2 transition-all">
                    View Deals
                    <ArrowRight size={12} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ─── Deal Hunting Tips ───────────────────────────────────── */}
        <div className="mb-8 section-entrance">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deal Hunting Tips</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 max-w-2xl">
            Smart strategies to make sure you&apos;re getting the best value on every purchase.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dealTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card
                  key={index}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 card-hover-lift"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                        <Icon size={20} className="text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">
                          {tip.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ─── Affiliate Disclosure ────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 section-entrance">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">
                Affiliate Disclosure
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                GearGeekz earns commissions from qualifying purchases through affiliate links on this page.
                We participate in affiliate programs with Amazon, Walmart, Best Buy, Target, REI, and B&amp;H Photo.
                This does not affect which products we recommend — our editorial team independently selects and reviews all products.
                Prices and availability are subject to change. Always verify the final price on the retailer&apos;s site before purchasing.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
