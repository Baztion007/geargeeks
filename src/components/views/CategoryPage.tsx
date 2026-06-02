'use client';

import React, { useState, useMemo } from 'react';
import { products, getProductsByCategory } from '@/data/products';
import { categories, getCategoryBySlug } from '@/data/categories';
import { useRouterStore } from '@/lib/router';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { Disclosure } from '@/components/affiliate/Disclosure';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, PackageOpen, X } from 'lucide-react';

interface CategoryPageProps {
  categorySlug: string;
}

type PriceRange = 'all' | 'under-50' | '50-150' | '150-300' | '300-1000' | 'over-1000';
type RatingFilter = 'all' | '4-plus' | '4.5-plus';
type SortOption = 'featured' | 'highest-rated' | 'lowest-price' | 'newest';

const PRICE_RANGES: { value: PriceRange; label: string }[] = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-50', label: 'Under $50' },
  { value: '50-150', label: '$50 - $150' },
  { value: '150-300', label: '$150 - $300' },
  { value: '300-1000', label: '$300 - $1,000' },
  { value: 'over-1000', label: 'Over $1,000' },
];

const RATING_FILTERS: { value: RatingFilter; label: string }[] = [
  { value: 'all', label: 'All Ratings' },
  { value: '4-plus', label: '4+ Stars' },
  { value: '4.5-plus', label: '4.5+ Stars' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'lowest-price', label: 'Lowest Price' },
  { value: 'newest', label: 'Newest' },
];

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, ''));
}

export function CategoryPage({ categorySlug }: CategoryPageProps) {
  const category = getCategoryBySlug(categorySlug);
  const goToCategory = useRouterStore((s) => s.goToCategory);

  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  const categoryProducts = useMemo(
    () => getProductsByCategory(categorySlug),
    [categorySlug]
  );

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    // Price filter
    if (priceRange !== 'all') {
      result = result.filter((p) => {
        const price = parsePrice(p.price);
        switch (priceRange) {
          case 'under-50':
            return price < 50;
          case '50-150':
            return price >= 50 && price <= 150;
          case '150-300':
            return price >= 150 && price <= 300;
          case '300-1000':
            return price >= 300 && price <= 1000;
          case 'over-1000':
            return price > 1000;
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      result = result.filter((p) => {
        switch (ratingFilter) {
          case '4-plus':
            return p.rating >= 4;
          case '4.5-plus':
            return p.rating >= 4.5;
          default:
            return true;
        }
      });
    }

    // Sort
    switch (sortOption) {
      case 'highest-rated':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest-price':
        result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        break;
      case 'featured':
      default:
        // Keep default order (featured)
        break;
    }

    return result;
  }, [categoryProducts, priceRange, ratingFilter, sortOption]);

  const hasActiveFilters = priceRange !== 'all' || ratingFilter !== 'all';

  const clearFilters = () => {
    setPriceRange('all');
    setRatingFilter('all');
  };

  // Category not found
  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <PackageOpen size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Category Not Found
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat.slug}
              variant="outline"
              onClick={() => goToCategory(cat.slug)}
              className="text-sm"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            {
              label: category.name,
              route: { page: 'category', slug: categorySlug },
            },
          ]}
        />

        {/* Category Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {category.name}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {category.description}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <Badge variant="secondary" className="text-xs">
              {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''}
            </Badge>
            {hasActiveFilters && (
              <Badge
                variant="outline"
                className="text-xs border-[#febd69] text-[#131921]"
              >
                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters & Sort</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-xs text-[#007185] hover:text-[#c7511f] hover:underline"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Price Range Select */}
            <Select
              value={priceRange}
              onValueChange={(v) => setPriceRange(v as PriceRange)}
            >
              <SelectTrigger className="w-[160px] text-sm" size="sm">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map((pr) => (
                  <SelectItem key={pr.value} value={pr.value}>
                    {pr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Rating Select */}
            <Select
              value={ratingFilter}
              onValueChange={(v) => setRatingFilter(v as RatingFilter)}
            >
              <SelectTrigger className="w-[150px] text-sm" size="sm">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                {RATING_FILTERS.map((rf) => (
                  <SelectItem key={rf.value} value={rf.value}>
                    {rf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Select */}
            <Select
              value={sortOption}
              onValueChange={(v) => setSortOption(v as SortOption)}
            >
              <SelectTrigger className="w-[160px] text-sm" size="sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((so) => (
                  <SelectItem key={so.value} value={so.value}>
                    {so.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 stagger-children">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-10 mb-6 text-center">
            <PackageOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No products match your filters
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your price range or rating filter to see more results.
            </p>
            <Button
              onClick={clearFilters}
              className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-semibold"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Category Description at Bottom */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Disclosure />
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            About {category.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {category.description}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Browse our full selection of {category.name.toLowerCase()} above. We
              independently review and test every product we recommend. Prices are
              updated regularly and may vary.
            </p>
          </div>
        </div>

        {/* Other Categories */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Explore Other Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.slug !== categorySlug)
              .map((cat) => (
                <Button
                  key={cat.slug}
                  variant="outline"
                  size="sm"
                  onClick={() => goToCategory(cat.slug)}
                  className="text-xs hover:border-[#febd69] hover:text-[#131921]"
                >
                  {cat.name}
                </Button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
