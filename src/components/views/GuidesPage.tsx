'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Disclosure } from '@/components/affiliate/Disclosure';
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
  Coffee,
  ArrowRight,
} from 'lucide-react';

export function GuidesPage() {
  const goToBuyingGuide = useRouterStore((s) => s.goToBuyingGuide);
  const goToCategory = useRouterStore((s) => s.goToCategory);

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

  return (
    <div className="min-h-screen bg-[#eaeded]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Buying Guides' }]} />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Compass className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">Buying Guides</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Expert-curated guides to help you find the perfect coffee equipment for your needs and budget.
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
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#131921] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryNames[catSlug]}
              </button>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {filteredGuides.map((guide) => {
              const author = getAuthorBySlug(guide.authorSlug);
              return (
                <Card
                  key={guide.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white card-hover-lift cursor-pointer"
                  onClick={() => goToBuyingGuide(guide.slug)}
                >
                  {/* Guide image / fallback */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    <img
                      src={guide.image}
                      alt={guide.title}
                      className="w-full h-full object-cover"
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
                      <Compass className="w-16 h-16" />
                    </div>
                    {/* Category badge */}
                    <Badge className="absolute top-3 left-3 bg-[#febd69] text-[#131921] text-xs font-semibold hover:bg-[#f3a847]">
                      {guide.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h2 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-[#c7511f] transition-colors line-clamp-2">
                      {guide.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{guide.excerpt}</p>

                    {/* Author and date */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-6">
            <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Guides Found</h2>
            <p className="text-gray-600 mb-6">No guides available in this category yet.</p>
            <Button
              onClick={() => setSelectedCategory('all')}
              className="bg-[#131921] hover:bg-[#37475a] text-white"
            >
              View All Guides
            </Button>
          </div>
        )}

        {/* Affiliate Disclosure */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <Disclosure />
        </div>
      </div>
    </div>
  );
}
