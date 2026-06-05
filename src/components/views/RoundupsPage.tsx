'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { products, getProductsByCategory } from '@/data/products';
import { buyingGuides, getBuyingGuidesByCategory } from '@/data/buying-guides';
import { categories } from '@/data/categories';
import { useRouterStore } from '@/lib/router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  ArrowRight,
  Compass,
  BookOpen,
  Star,
  Users,
  TrendingUp,
  Briefcase,
  Dumbbell,
  Map,
  Headphones,
  Laptop,
  Layers,
} from 'lucide-react';

interface RoundupCollection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  productSlugs: string[];
  guideSlug?: string;
}

const roundups: RoundupCollection[] = [
  {
    id: 'travel-essentials',
    title: 'Best for Travel',
    description: 'Essential gear for frequent travelers, digital nomads, and vacation adventurers — from luggage to tech adapters.',
    icon: Map,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    productSlugs: ['samsonite-freeform-carry-on', 'peak-design-travel-backpack', 'anker-737-power-bank', 'epicka-universal-adapter', 'apple-airtag-4-pack'],
    guideSlug: 'best-travel-gadgets-2026',
  },
  {
    id: 'remote-work',
    title: 'Best for Remote Work',
    description: 'Build the perfect home office with ergonomic desks, chairs, and accessories designed for all-day productivity.',
    icon: Briefcase,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    productSlugs: ['uplift-v2-standing-desk', 'herman-miller-aeron-chair', 'ergotron-lx-monitor-arm', 'keychron-q1-pro-keyboard'],
    guideSlug: 'how-to-choose-travel-backpack',
  },
  {
    id: 'fitness-recovery',
    title: 'Best for Fitness & Recovery',
    description: 'Top-rated fitness trackers, recovery tools, and home gym equipment to optimize your training and wellness.',
    icon: Dumbbell,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    productSlugs: ['garmin-venu-3-fitness-tracker', 'theragun-pro-plus-massage-gun', 'bowflex-selecttech-552-dumbbells'],
  },
  {
    id: 'audio-essentials',
    title: 'Best for Audio Enthusiasts',
    description: 'Premium noise-cancelling headphones, earbuds, and speakers for music lovers, commuters, and audiophiles.',
    icon: Headphones,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    productSlugs: ['sony-wf1000xm5', 'bose-qc-ultra-headphones', 'jbl-charge-5-speaker', 'shure-aonic-50-gen-2'],
    guideSlug: 'best-noise-cancelling-headphones',
  },
  {
    id: 'tech-everyday',
    title: 'Best for Everyday Tech',
    description: 'Smart gadgets and electronics that make daily life easier, from portable chargers to wireless keyboards.',
    icon: Laptop,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    productSlugs: ['anker-523-powerport', 'samsung-t7-shield-ssd', 'keychron-q1-pro-keyboard', 'apple-airtag-4-pack'],
  },
  {
    id: 'outdoor-adventure',
    title: 'Best for Outdoor Adventures',
    description: 'Gear that performs in the wild — camping stoves, water filters, and rugged accessories for off-grid exploration.',
    icon: TrendingUp,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    productSlugs: ['biolite-campstove-2', 'lifestraw-personal-water-filter', 'cabeau-evolution-neck-pillow'],
  },
];

export function RoundupsPage() {
  const goToBuyingGuide = useRouterStore((s) => s.goToBuyingGuide);
  const goToProduct = useRouterStore((s) => s.goToProduct);

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Roundups' }]} />

        {/* Header */}
        <div className="relative rounded-xl overflow-hidden mb-6 shadow-lg">
          <div className="bg-gradient-to-r from-[#131921] via-[#1e293b] to-[#0f172a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Product <span className="text-gradient">Roundups</span>
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
              Curated collections of our top-rated products organized by use case. Whether you&apos;re building a home office, packing for travel, or upgrading your fitness gear, we&apos;ve got the right picks.
            </p>
            <div className="flex items-center gap-4 mt-5 text-sm">
              <span className="flex items-center gap-1.5 text-[#febd69]">
                <Layers size={14} />
                {roundups.length} Collections
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <Package size={14} />
                {roundups.reduce((sum, r) => sum + r.productSlugs.length, 0)} Products
              </span>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        </div>

        {/* Roundup Collections */}
        <div className="space-y-8 mb-6">
          {roundups.map((roundup) => {
            const Icon = roundup.icon;
            const collectionProducts = roundup.productSlugs
              .map((slug) => products.find((p) => p.slug === slug))
              .filter(Boolean) as typeof products;
            const relatedGuide = roundup.guideSlug
              ? buyingGuides.find((g) => g.slug === roundup.guideSlug)
              : null;

            return (
              <div key={roundup.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
                {/* Collection Header */}
                <div className={`${roundup.bgColor} p-6 border-b border-gray-200 dark:border-gray-700`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center shrink-0 ${roundup.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{roundup.title}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{roundup.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                          <Package size={10} className="mr-1" />
                          {collectionProducts.length} products
                        </Badge>
                        {relatedGuide && (
                          <Badge variant="outline" className="text-xs border-[#007185] text-[#007185]">
                            <BookOpen size={10} className="mr-1" />
                            Guide available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                    {collectionProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Related Guide CTA */}
                  {relatedGuide && (
                    <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <Compass className="w-5 h-5 text-[#007185] shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {relatedGuide.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {relatedGuide.readingTime} min read · {relatedGuide.recommendedProducts.length} products compared
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => goToBuyingGuide(relatedGuide.slug)}
                        variant="outline"
                        size="sm"
                        className="border-[#007185] text-[#007185] hover:bg-[#007185] hover:text-white shrink-0"
                      >
                        Read Guide
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Buying Guides Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Buying Guides</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Dive deeper with our comprehensive buying guides, featuring detailed comparisons, decision frameworks, and expert recommendations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyingGuides.map((guide) => (
              <Card
                key={guide.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#febd69]/30 rounded-xl"
                onClick={() => goToBuyingGuide(guide.slug)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#131921] to-[#37475a] flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5 text-[#febd69]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{guide.excerpt}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#febd69]/20 text-[#131921] dark:text-[#febd69] hover:bg-[#febd69]/20 text-[10px] px-1.5">
                          {guide.guideType === 'best-products' ? 'Best Products' : guide.guideType === 'comparison' ? 'Comparison' : guide.guideType === 'brand-review' ? 'Brand Review' : 'Category Guide'}
                        </Badge>
                        <span className="text-[10px] text-gray-400">{guide.readingTime} min</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
