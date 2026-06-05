'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { buyingGuides } from '@/data/buying-guides';
import { getAuthorBySlug } from '@/data/authors';
import { useRouterStore } from '@/lib/router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Compass,
  ChevronRight,
  Calendar,
  User,
  Package,
  ArrowRight,
  Clock,
  GitCompare,
  Star,
  Tag,
  Sparkles,
  Eye,
} from 'lucide-react';
import type { GuideType } from '@/lib/types';

// ─── Guide type color config with CSS variable approach ─────────────────
const guideTypeConfig: Record<string, { label: string; icon: React.ElementType; accentClass: string; bgLight: string; bgDark: string; border: string; textLight: string; textDark: string }> = {
  'best-products': {
    label: 'Best Products',
    icon: Star,
    accentClass: 'guide-type-best-products',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800/30',
    textLight: 'text-amber-800',
    textDark: 'dark:text-amber-300',
  },
  'comparison': {
    label: 'Comparison',
    icon: GitCompare,
    accentClass: 'guide-type-comparison',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-900/10',
    border: 'border-sky-200 dark:border-sky-800/30',
    textLight: 'text-sky-800',
    textDark: 'dark:text-sky-300',
  },
  'brand-review': {
    label: 'Brand Review',
    icon: Tag,
    accentClass: 'guide-type-brand-review',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-900/10',
    border: 'border-violet-200 dark:border-violet-800/30',
    textLight: 'text-violet-800',
    textDark: 'dark:text-violet-300',
  },
  'category-guide': {
    label: 'Category Guide',
    icon: BookOpen,
    accentClass: 'guide-type-category-guide',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/10',
    border: 'border-emerald-200 dark:border-emerald-800/30',
    textLight: 'text-emerald-800',
    textDark: 'dark:text-emerald-300',
  },
};

// ─── Reading time max for bar calculation ───────────────────────────────
const MAX_READING_TIME = 20; // 20 min as 100%

function isRecentlyAdded(updatedAt: string): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(updatedAt) > thirtyDaysAgo;
}

export function GuidesPage() {
  const goToBuyingGuide = useRouterStore((s) => s.goToBuyingGuide);

  // Get unique categories from guides
  const guideCategories = Array.from(new Set(buyingGuides.map((g) => g.categorySlug)));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredGuides = selectedCategory === 'all'
    ? buyingGuides
    : buyingGuides.filter((g) => g.categorySlug === selectedCategory);

  const categoryNames: Record<string, string> = {};
  buyingGuides.forEach((g) => {
    categoryNames[g.categorySlug] = g.category;
  });

  // Get unique guide types for display
  const guideTypes = Array.from(new Set(buyingGuides.map((g) => g.guideType)));

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Buying Guides' }]} />

        {/* ─── Hero Section with Compass Decorative Element ────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6 ring-1 ring-black/5">
          <div className="relative bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white animated-gradient" style={{ backgroundSize: '200% 200%' }}>
            {/* Decorative Compass */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 right-[8%] -translate-y-1/2 hero-float-1">
                <Compass className="w-40 h-40 md:w-56 md:h-56 text-white/[0.04]" />
              </div>
              {/* Smaller floating accents */}
              <div className="absolute top-[12%] right-[30%] w-3 h-3 rounded-full bg-amber-500/20 hero-float-2" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-[18%] right-[15%] w-4 h-4 rounded-full bg-amber-400/15 hero-float-3" style={{ animationDelay: '2s' }} />
              <div className="absolute top-[30%] right-[45%] w-2 h-2 rounded-full bg-amber-300/20 hero-float-fast" style={{ animationDelay: '0.5s' }} />
            </div>

            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 hero-float-3">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Buying Guides</h1>
                <p className="text-lg text-gray-300 max-w-3xl">
                  Expert-curated guides to help you find the perfect gear for your needs. From travel essentials to home office setups, we&apos;ve got you covered.
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <span className="flex items-center gap-1.5 text-[#febd69]">
                    <BookOpen size={14} />
                    {buyingGuides.length} Guides
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Compass size={14} />
                    {guideCategories.length} Categories
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Star size={14} />
                    {guideTypes.length} Guide Types
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        </div>

        {/* ─── Guide Type Badges with Color Coding ─────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-1">Guide Types:</span>
            {guideTypes.map((type) => {
              const config = guideTypeConfig[type];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <Badge key={type} className={`${config.accentClass} text-xs font-semibold gap-1 ${config.bgLight} ${config.bgDark} ${config.border} ${config.textLight} ${config.textDark} border`}>
                  <Icon size={12} />
                  {config.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#131921] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Guides
            </button>
            {guideCategories.map((catSlug) => (
              <button
                key={catSlug}
                onClick={() => setSelectedCategory(catSlug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === catSlug
                    ? 'bg-[#131921] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {categoryNames[catSlug]}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Guides Grid with Enhanced Cards ─────────────────────────── */}
        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {filteredGuides.map((guide, index) => {
              const author = getAuthorBySlug(guide.authorSlug);
              const typeConfig = guideTypeConfig[guide.guideType];
              const TypeIcon = typeConfig?.icon || BookOpen;
              const recentlyAdded = isRecentlyAdded(guide.updatedAt);
              const readingTimePercent = Math.min((guide.readingTime / MAX_READING_TIME) * 100, 100);

              return (
                <Card
                  key={guide.id}
                  className={`group overflow-hidden hover:shadow-xl transition-all duration-300 border bg-white dark:bg-gray-800 card-hover-lift cursor-pointer relative card-entrance card-entrance-delay-${Math.min(index + 1, 12)}`}
                  style={typeConfig ? { borderColor: `var(--guide-accent, #e5e7eb)` } : undefined}
                  onClick={() => goToBuyingGuide(guide.slug)}
                >
                  {/* Guide image / fallback */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    <img
                      src={guide.image}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }}
                    />
                    <div
                      className="w-full h-full absolute inset-0 bg-gradient-to-br from-[#131921] to-[#37475a] items-center justify-center text-[#febd69]/50"
                      style={{ display: 'none' }}
                    >
                      <Package className="w-16 h-16" />
                    </div>
                    {/* Guide type badge with color coding */}
                    <Badge className={`absolute top-3 left-3 text-xs font-semibold gap-1 ${typeConfig?.bgLight} ${typeConfig?.bgDark} ${typeConfig?.border} ${typeConfig?.textLight} ${typeConfig?.textDark} border`}>
                      <TypeIcon size={12} />
                      {typeConfig?.label || guide.guideType}
                    </Badge>
                    {/* Reading time badge */}
                    <Badge className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium gap-1 hover:bg-black/60">
                      <Clock size={10} />
                      {guide.readingTime} min
                    </Badge>
                    {/* Category badge */}
                    <Badge className="absolute bottom-3 left-3 bg-[#febd69] text-[#131921] text-xs font-semibold hover:bg-[#f3a847]">
                      {guide.category}
                    </Badge>
                    {/* Recently Added badge */}
                    {recentlyAdded && (
                      <Badge className="absolute bottom-3 right-3 recently-added-badge text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                        New
                      </Badge>
                    )}
                    {/* ─── Read Now Hover Overlay ──────────────────────────── */}
                    <div className="read-now-overlay">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white font-bold text-sm">Read Now</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-snug mb-2 group-hover:text-[#c7511f] transition-colors line-clamp-2">
                      {guide.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{guide.excerpt}</p>

                    {/* ─── Reading Time Visual Indicator ───────────────────── */}
                    <div className={`flex items-center gap-2 mb-4 ${typeConfig?.accentClass || ''}`}>
                      <Clock size={12} className="text-gray-400 shrink-0" />
                      <div className="flex-1 reading-time-bar">
                        <div
                          className="reading-time-bar-fill"
                          style={{ width: `${readingTimePercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tabular-nums w-14 text-right">
                        {guide.readingTime} min
                      </span>
                    </div>

                    {/* Author and date */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {author && (
                        <span className="flex items-center gap-1.5">
                          <User size={12} />
                          <span className="font-medium">{author.name}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        Updated {new Date(guide.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Recommended products count */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#007185] font-medium">
                        {guide.recommendedProducts.length} products compared
                      </span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#c7511f] group-hover:translate-x-0.5 transition-transform">
                        Read Guide
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center mb-6">
            <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Guides Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">No guides available in this category yet.</p>
            <Button
              onClick={() => setSelectedCategory('all')}
              className="bg-[#131921] hover:bg-[#37475a] text-white"
            >
              View All Guides
            </Button>
          </div>
        )}


      </div>
    </div>
  );
}
