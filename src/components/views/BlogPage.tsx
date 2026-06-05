'use client';

import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { blogPosts } from '@/data/blog-posts';
import { authors, getAuthorBySlug } from '@/data/authors';
import { useRouterStore } from '@/lib/router';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Search,
  Calendar,
  User,
  ArrowRight,
  Package,
  Tag,
  Star,
  Clock,
} from 'lucide-react';

const CATEGORIES = ['All', 'Travel Gear', 'Home & Office', 'Electronics', 'Fitness'];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const categoryColors: Record<string, string> = {
  'Travel Gear': 'bg-emerald-600',
  'Home & Office': 'bg-sky-600',
  'Electronics': 'bg-violet-600',
  'Fitness': 'bg-rose-600',
};

export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const goToBlogPost = useRouterStore((s) => s.goToBlogPost);

  const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null;

  const filteredPosts = useMemo(() => {
    let posts = blogPosts;

    // Filter out the featured post from the grid
    if (featuredPost && selectedCategory === 'All' && !searchQuery.trim()) {
      posts = posts.filter((p) => p.id !== featuredPost.id);
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      posts = posts.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = blogPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return posts;
  }, [selectedCategory, searchQuery, featuredPost]);

  // Determine whether to show the featured hero (only when no filters are active)
  const showFeatured = featuredPost && selectedCategory === 'All' && !searchQuery.trim();

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Blog' }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">GearGeekz Blog</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Expert guides, comparisons, and insights for gear enthusiasts and savvy shoppers
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1.5 text-[#febd69]">
                <BookOpen size={14} />
                {blogPosts.length} Articles
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <Tag size={14} />
                {CATEGORIES.length - 1} Categories
              </span>
            </div>
          </div>
        </div>

        {/* Featured Article Hero */}
        {showFeatured && (
          <FeaturedArticleHero
            post={featuredPost}
            author={getAuthorBySlug(featuredPost.authorSlug)}
            onReadMore={() => goToBlogPost(featuredPost.slug)}
          />
        )}

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Category Tabs - horizontally scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-none snap-x snap-mandatory pb-1 -mb-1">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-1 shrink-0">Category:</span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap snap-start ${
                    selectedCategory === cat
                      ? 'bg-[#131921] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar - full width on mobile */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 sm:h-9 bg-gray-50 border-gray-200 focus-visible:ring-[#febd69]"
                aria-label="Search blog posts"
              />
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {filteredPosts.map((post) => {
              const author = getAuthorBySlug(post.authorSlug);
              return (
                <BlogCard key={post.id} post={post} author={author} onReadMore={() => goToBlogPost(post.slug)} />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center mb-6">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Articles Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              We couldn&apos;t find any articles matching your search. Try adjusting your filters or search terms.
            </p>
            <Button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="bg-[#131921] hover:bg-[#37475a] text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}


      </div>
    </div>
  );
}

// ─── Featured Article Hero ──────────────────────────────────────────────────
interface FeaturedArticleHeroProps {
  post: typeof blogPosts[number];
  author: ReturnType<typeof getAuthorBySlug>;
  onReadMore: () => void;
}

function FeaturedArticleHero({ post, author, onReadMore }: FeaturedArticleHeroProps) {
  const [imgError, setImgError] = useState(false);
  const goToAuthor = useRouterStore((s) => s.goToAuthor);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md mb-6 cursor-pointer group" onClick={onReadMore}>
      {/* Hero image with gradient overlay */}
      <div className="relative aspect-[21/9] sm:aspect-[21/7] overflow-hidden">
        {post.image && !imgError ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="eager"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#131921] to-[#37475a] flex items-center justify-center">
            <Package className="w-24 h-24 text-[#febd69]/30" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131921] via-[#131921]/60 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
        <div className="max-w-3xl">
          {/* Badges */}
          <Badge
            className={`${categoryColors[post.category] || 'bg-gray-600'} text-white text-xs font-semibold mb-3`}
          >
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
          <Badge
            className={`${categoryColors[post.category] || 'bg-gray-600'} text-white text-xs font-semibold mb-3 ml-2`}
          >
            {post.category}
          </Badge>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-[#febd69] transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* Author, date, reading time */}
          <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
            {author && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToAuthor(author.slug);
                }}
                className="flex items-center gap-1.5 hover:text-[#febd69] transition-colors"
              >
                <User size={14} />
                <span className="font-medium">{author.name}</span>
              </button>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {post.readingTime} min read
            </span>
          </div>

          {/* Excerpt */}
          <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-2 mb-4 max-w-2xl">
            {post.excerpt}
          </p>

          {/* CTA Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onReadMore();
            }}
            className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold"
          >
            Read Featured Article
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface BlogCardProps {
  post: typeof blogPosts[number];
  author: ReturnType<typeof getAuthorBySlug>;
  onReadMore: () => void;
}

function BlogCard({ post, author, onReadMore }: BlogCardProps) {
  const [imgError, setImgError] = useState(false);
  const goToAuthor = useRouterStore((s) => s.goToAuthor);

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div
        className="relative cursor-pointer overflow-hidden aspect-[16/9] bg-gray-100"
        onClick={onReadMore}
      >
        {post.image && !imgError ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#131921] to-[#37475a] flex items-center justify-center">
            <Package className="w-16 h-16 text-[#febd69]/50" />
          </div>
        )}

        {/* Category Badge */}
        <Badge
          className={`absolute top-3 left-3 text-white text-xs font-semibold ${categoryColors[post.category] || 'bg-gray-600'}`}
        >
          {post.category}
        </Badge>

        {/* Reading Time Badge */}
        <Badge className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium hover:bg-black/60 gap-1">
          <Clock size={10} />
          {post.readingTime} min
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Title */}
        <h2
          className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-snug mb-2 cursor-pointer hover:text-[#c7511f] transition-colors line-clamp-2"
          onClick={onReadMore}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">{post.excerpt}</p>

        {/* Author, Date & Reading Time */}
        <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
          {author && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToAuthor(author.slug);
              }}
              className="flex items-center gap-1.5 hover:text-[#c7511f] transition-colors"
            >
              <User size={12} />
              <span className="font-medium">{author.name}</span>
            </button>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {post.readingTime}m
          </span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600">
              {tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <span className="text-[10px] text-gray-400">+{post.tags.length - 3} more</span>
          )}
        </div>

        {/* Read More */}
        <button
          onClick={onReadMore}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#007185] hover:text-[#c7511f] transition-colors group/btn"
        >
          Read More
          <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </article>
  );
}
