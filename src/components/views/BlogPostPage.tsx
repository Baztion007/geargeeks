'use client';

import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
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
  Package,
  Tag,
  BookOpen,
  Mail,
  Share2,
  Twitter,
  Facebook,
  Link2,
  Check,
  List,
} from 'lucide-react';
import { BlogComments } from '@/components/affiliate/BlogComments';
import { generateBlogPostJsonLd } from '@/lib/seo';
import { JsonLdScript } from '@/components/affiliate/JsonLdScript';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const categoryColors: Record<string, string> = {
  'Travel Gear': 'bg-emerald-100 text-emerald-700',
  'Home & Office': 'bg-sky-100 text-sky-700',
  'Electronics': 'bg-violet-100 text-violet-700',
  'Fitness': 'bg-rose-100 text-rose-700',
};

// Social Share Buttons Component
function SocialShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/#blog/${slug}` : '';
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <Share2 size={14} />
        Share:
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 flex items-center justify-center transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={14} className="text-sky-600 dark:text-sky-400" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 flex items-center justify-center transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={14} className="text-blue-600 dark:text-blue-400" />
      </a>
      <button
        onClick={handleCopyLink}
        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <Check size={14} className="text-emerald-600" />
        ) : (
          <Link2 size={14} className="text-gray-600 dark:text-gray-400" />
        )}
      </button>
    </div>
  );
}

// Table of Contents Component
function TableOfContents({ content }: { content: string }) {
  const paragraphs = content.split('\n\n').filter((p) => p.trim());
  // Create TOC entries from content - use first few paragraphs as sections
  const sections = paragraphs.slice(0, 6).map((p, i) => {
    const firstLine = p.split('\n')[0];
    const title = firstLine.length > 60 ? firstLine.substring(0, 57) + '...' : firstLine;
    return { id: `section-${i}`, title };
  });

  if (sections.length < 3) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-600">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <List size={14} />
        Table of Contents
      </h3>
      <ol className="space-y-1.5">
        {sections.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(section.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span className="text-gray-400 mr-2">{i + 1}.</span>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function BlogPostPage({ postSlug }: { postSlug: string }) {
  const post = getBlogPostBySlug(postSlug);
  const goToBlog = useRouterStore((s) => s.goToPage);
  const goToAuthor = useRouterStore((s) => s.goToAuthor);
  const goToBlogPost = useRouterStore((s) => s.goToBlogPost);
  const goToProduct = useRouterStore((s) => s.goToProduct);

  // Find related products by matching tags — must be before conditional return
  const relatedProducts = useMemo(() => {
    if (!post) return [];
    const matched = products
      .filter((p) => p.tags.some((t) => post.tags.includes(t)))
      .slice(0, 6);
    return matched.length > 0 ? matched : products.slice(0, 6);
  }, [postSlug, post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Breadcrumbs items={[{ label: 'Blog', route: { page: 'blog' } }, { label: 'Not Found' }]} />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The blog post you&apos;re looking for doesn&apos;t exist or has been moved.</p>
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
  const readTime = post.readingTime ? `${post.readingTime} min read` : getReadTime(post.content);

  // Split content into paragraphs
  const paragraphs = post.content.split('\n\n').filter((p) => p.trim());

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Blog post structured data for SEO */}
        <JsonLdScript data={generateBlogPostJsonLd(post)} />
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                {author && (
                  <button
                    onClick={() => goToAuthor(author.slug)}
                    className="flex items-center gap-2 hover:text-[#c7511f] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-700 flex items-center justify-center overflow-hidden">
                      {author.photo ? (
                        <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-amber-600 dark:text-amber-300" />
                      )}
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{author.name}</span>
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

              {/* Social Share */}
              <div className="mb-4">
                <SocialShareButtons title={post.title} slug={post.slug} />
              </div>

              <Separator className="my-4" />

              {/* Table of Contents */}
              <TableOfContents content={post.content} />

              {/* Article Content */}
              <div className="prose prose-gray max-w-none">
                {paragraphs.map((paragraph, idx) => (
                  <p key={idx} id={`section-${idx}`} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 scroll-mt-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              <Separator className="my-6" />
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={14} className="text-gray-400 shrink-0" />
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Share at bottom */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <SocialShareButtons title={post.title} slug={post.slug} />
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
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-700 flex items-center justify-center overflow-hidden shrink-0">
                    {author.photo ? (
                      <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-amber-600 dark:text-amber-300" />
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => goToAuthor(author.slug)}
                      className="font-bold text-gray-900 dark:text-white hover:text-[#c7511f] transition-colors"
                    >
                      {author.name}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{author.reviewCount} articles</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">{author.bio}</p>
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
                  <span className="text-gray-500 dark:text-gray-400">Published</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Updated</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(post.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Read Time</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{readTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Category</span>
                  <Badge className={`text-xs ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                    {post.category}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Related Products Sidebar */}
            {relatedProducts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Featured Products</h3>
                <div className="space-y-3">
                  {relatedProducts.slice(0, 3).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => goToProduct(product.slug)}
                      className="block w-full text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#c7511f] transition-colors line-clamp-2 leading-snug">
                            {product.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-amber-600 font-medium">★ {product.rating.toFixed(1)}</span>
                            {product.bestFor.length > 0 && (
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">{product.bestFor[0]}</span>
                            )}
                          </div>
                          <CheckPriceButton merchant={product.merchant} productId={product.asin} size="sm" className="mt-1.5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                          <Package className="w-6 h-6 text-[#febd69]/50" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#c7511f] transition-colors line-clamp-2 leading-snug">
                            {relPost.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(relPost.publishedAt)}</p>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{relPost.readingTime} min</span>
                          </div>
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
              className="w-full border-[#131921] text-[#131921] dark:border-gray-600 dark:text-gray-300 hover:bg-[#131921] hover:text-white"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>

        {/* Related Products - Full Width, 3 Columns */}
        {relatedProducts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package size={20} className="text-[#c7511f]" />
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Newsletter CTA - Full Width, Compact */}
        <div className="bg-gradient-to-r from-[#131921] to-[#37475a] rounded-lg px-8 md:px-16 py-5 text-white mt-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-[#febd69]" />
              <h3 className="text-lg font-bold">Stay Updated</h3>
            </div>
            <p className="text-gray-300 mb-3 text-sm">
              Get the latest gear guides, reviews, and recommendations delivered straight to your inbox. No spam, ever.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#febd69] text-sm"
                aria-label="Email address for newsletter"
              />
              <Button className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold shrink-0 text-sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section - Full Width */}
        <div className="mt-6">
          <BlogComments postSlug={postSlug} />
        </div>
      </div>
    </div>
  );
}

function getReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
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
            <p className="text-gray-400 text-sm">GearGeekz Blog</p>
          </div>
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
