'use client';

import React, { useState, useMemo } from 'react';
import { products, searchProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { useRouterStore } from '@/lib/router';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { Disclosure } from '@/components/affiliate/Disclosure';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, PackageOpen, TrendingUp } from 'lucide-react';

interface SearchPageProps {
  query: string;
}

// Popular search tags for suggestions
const POPULAR_TAGS = [
  'espresso',
  'grinder',
  'pour-over',
  'kettle',
  'french press',
  'breville',
  'fellow',
  'baratza',
  'gooseneck',
  'built-in grinder',
  'manual',
  'travel',
];

export function SearchPage({ query }: SearchPageProps) {
  const [searchInput, setSearchInput] = useState(query);
  const goToSearch = useRouterStore((s) => s.goToSearch);
  const goToCategory = useRouterStore((s) => s.goToCategory);

  const searchResults = useMemo(() => searchProducts(query), [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      goToSearch(trimmed);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchInput(tag);
    goToSearch(tag);
  };

  // Get suggested tags that aren't the current query
  const suggestedTags = useMemo(() => {
    const q = query.toLowerCase();
    return POPULAR_TAGS.filter(
      (tag) => !tag.includes(q) && !q.includes(tag)
    ).slice(0, 8);
  }, [query]);

  // Get related categories based on query
  const relatedCategories = useMemo(() => {
    const q = query.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[{ label: `Search: "${query}"` }]}
        />

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search coffee equipment reviews..."
                className="pl-10 h-10 text-sm"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-semibold h-10 px-6"
            >
              <Search size={16} className="mr-1" />
              Search
            </Button>
          </form>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {searchResults.length > 0 ? (
              <>
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {searchResults.length}
                </span>{' '}
                result{searchResults.length !== 1 ? 's' : ''} for{' '}
                <span className="font-semibold text-gray-900">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            ) : (
              <>
                No results for{' '}
                <span className="font-semibold text-gray-900">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            )}
          </p>
        </div>

        {/* Search Results or No-Results State */}
        {searchResults.length > 0 ? (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Affiliate Disclosure */}
            <div className="mb-6">
              <Disclosure />
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
            {/* No Results State */}
            <div className="text-center mb-8">
              <PackageOpen size={56} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                No results found
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                We couldn&apos;t find any products matching &ldquo;{query}&rdquo;.
                Try searching with different keywords or browse our suggestions
                below.
              </p>
            </div>

            {/* Popular Search Suggestions */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[#febd69]" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Popular Searches
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-[#febd69] hover:text-[#131921] text-gray-600 text-xs rounded-full border border-gray-200 hover:border-[#febd69] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Related Categories */}
            {relatedCategories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Related Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relatedCategories.map((cat) => (
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
            )}

            {/* Browse All Categories */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Browse Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
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
        )}

        {/* Suggestions Section (shown even with results) */}
        {searchResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-[#febd69]" />
              <h3 className="text-sm font-semibold text-gray-700">
                Related Searches
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-[#febd69] hover:text-[#131921] text-gray-600 text-xs rounded-full border border-gray-200 hover:border-[#febd69] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Browse categories */}
            {relatedCategories.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  Related Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {relatedCategories.map((cat) => (
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
            )}
          </div>
        )}

        {/* Browse All Categories (at bottom) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Browse All Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.slug}
                className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-[#febd69] hover:text-[#131921] border border-gray-200 hover:border-[#febd69] transition-colors px-3 py-1.5 text-xs"
                onClick={() => goToCategory(cat.slug)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
