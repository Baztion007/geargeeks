'use client';

import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Disclosure } from '@/components/affiliate/Disclosure';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { getBlogPostBySlug, getRelatedPosts, blogPosts } from '@/data/blog-posts';
import { getAuthorBySlug } from '@/data/authors';
import { products } from '@/data/products';
import { useRouterStore } from '@/lib/router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Coffee,
  Tag,
  BookOpen,
  Mail,
  Share2,
} from 'lucide-react';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export function BlogPostPage({ postSlug }: { postSlug: string }) {
  const post = getBlogPostBySlug(postSlug);
  const goToBlog = useRouterStore((s) => s.goToPage);
  const goToAuthor = useRouterStore((s) => s.goToAuthor);
  const goToBlogPost = useRouterStore((s) => s.goToBlogPost);

  // Find related products by matching tags — must be before conditional return
  const relatedProducts = useMemo(() => {
    if (!post) return [];
    const matched = products
      .filter((p) => p.tags.some((t) => post.tags.includes(t)))
      .slice(0, 4);
    return matched.length > 0 ? matched : products.slice(0, 4);
  }, [postSlug, post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Breadcrumbs items={[{ label: 'Blog', route: { page: 'blog' } }, { label: 'Not Found' }]} />
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article Not Found</h2>
            <p className="text-gray-600 mb-6">The blog post you&apos;re looking for doesn&apos;t exist or has been moved.</p>
            <Button
              onClick={() => goToBlog('blog')}
              className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold"
            >
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const author = getAuthorBySlug(post.authorSlug);
  const relatedPosts = getRelatedPosts(postSlug, 3);
  const readTime = getReadTime(post.content);

  // Split content into paragraphs
  const paragraphs = post.content.split('\n\n').filter((p) => p.trim());

  const categoryColors: Record<string, string> = {
    Guides: 'bg-emerald-100 text-emerald-700',
    Comparisons: 'bg-blue-100 text-blue-700',
    Science: 'bg-purple-100 text-purple-700',
    Tips: 'bg-amber-100 text-amber-700',
    Reviews: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: 'Blog', route: { page: 'blog' } },
            { label: post.title },
          ]}
        />

        {/* Hero Image */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <HeroImage src={post.image} alt={post.title} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Article Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
              {/* Category Badge */}
              <Badge className={`mb-4 ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                {post.category}
              </Badge>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                {author && (
                  <button
                    onClick={() => goToAuthor(author.slug)}
                    className="flex items-center gap-2 hover:text-[#c7511f] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center overflow-hidden">
                      {author.photo ? (
                        <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-amber-600" />
                      )}
                    </div>
                    <span className="font-medium text-gray-700">{author.name}</span>
                  </button>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {readTime}
                </span>
              </div>

              <Separator className="my-4" />

              {/* Article Content */}
              <div className="prose prose-gray max-w-none">
                {paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              <Separator className="my-6" />
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={14} className="text-gray-400 shrink-0" />
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs text-gray-600 border-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Share */}
              <div className="flex items-center gap-3 mt-4">
                <Share2 size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Share this article:</span>
                <button className="text-[#007185] hover:text-[#c7511f] text-sm hover:underline">Twitter</button>
                <button className="text-[#007185] hover:text-[#c7511f] text-sm hover:underline">Facebook</button>
                <button className="text-[#007185] hover:text-[#c7511f] text-sm hover:underline">Email</button>
              </div>
            </div>

            {/* Affiliate Disclosure Before Products */}
            <div className="mb-6">
              <Disclosure />
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Coffee size={20} className="text-[#c7511f]" />
                  Related Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-r from-[#131921] to-[#37475a] rounded-lg p-6 md:p-8 text-white mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-8 h-8 text-[#febd69]" />
                <h3 className="text-xl font-bold">Stay Updated</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Get the latest coffee guides, reviews, and deals delivered straight to your inbox. No spam, ever.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                  aria-label="Email address for newsletter"
                />
                <Button className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold shrink-0">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Author Card */}
            {author && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">About the Author</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center overflow-hidden shrink-0">
                    {author.photo ? (
                      <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => goToAuthor(author.slug)}
                      className="font-bold text-gray-900 hover:text-[#c7511f] transition-colors"
                    >
                      {author.name}
                    </button>
                    <p className="text-xs text-gray-500">{author.reviewCount} articles</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-4">{author.bio}</p>
                <button
                  onClick={() => goToAuthor(author.slug)}
                  className="mt-3 text-sm text-[#007185] hover:text-[#c7511f] hover:underline font-medium"
                >
                  View Full Profile →
                </button>
              </div>
            )}

            {/* Article Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Article Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Published</span>
                  <span className="text-gray-700 font-medium">{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="text-gray-700 font-medium">{formatDate(post.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Read Time</span>
                  <span className="text-gray-700 font-medium">{readTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <Badge className={`text-xs ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                    {post.category}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Related Articles</h3>
                <div className="space-y-4">
                  {relatedPosts.map((relPost) => (
                    <button
                      key={relPost.id}
                      onClick={() => goToBlogPost(relPost.slug)}
                      className="block w-full text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#131921] to-[#37475a] flex items-center justify-center shrink-0 overflow-hidden">
                          <Coffee className="w-6 h-6 text-[#febd69]/50" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#c7511f] transition-colors line-clamp-2 leading-snug">
                            {relPost.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(relPost.publishedAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog */}
            <Button
              onClick={() => goToBlog('blog')}
              variant="outline"
              className="w-full border-[#131921] text-[#131921] hover:bg-[#131921] hover:text-white"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroImage({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative w-full aspect-[21/9] bg-gray-100">
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="eager"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#131921] to-[#37475a] flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-20 h-20 text-[#febd69]/30 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">BrewHub Blog</p>
          </div>
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
