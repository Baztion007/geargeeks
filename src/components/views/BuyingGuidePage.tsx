'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { ProductCard } from '@/components/affiliate/ProductCard';

import { StarRating } from '@/components/affiliate/RatingBar';
import { getBuyingGuideBySlug } from '@/data/buying-guides';
import { getProductBySlug, products } from '@/data/products';
import { getAuthorBySlug } from '@/data/authors';
import { useRouterStore } from '@/lib/router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen,
  GitCompare,
  Compass,
  HelpCircle,
  ShoppingCart,
  ArrowRight,
  User,
  Calendar,
  Package,
  Clock,
  Star,
  Tag,
  List,
  Share2,
  Twitter,
  Facebook,
  Link2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { generateGuidePageJsonLd, generateGuideMeta } from '@/lib/seo';
import { JsonLdScript } from '@/components/affiliate/JsonLdScript';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { getAffiliateUrl, getAffiliateLinkProps, getMerchantName } from '@/lib/affiliate';
import type { Merchant } from '@/lib/types';

// Guide type badge configuration
const guideTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'best-products': { label: 'Best Products', icon: Star, color: 'bg-amber-500 text-white' },
  'comparison': { label: 'Comparison', icon: GitCompare, color: 'bg-emerald-600 text-white' },
  'brand-review': { label: 'Brand Review', icon: Tag, color: 'bg-violet-600 text-white' },
  'category-guide': { label: 'Category Guide', icon: BookOpen, color: 'bg-sky-600 text-white' },
};

// Social Share Buttons Component
function SocialShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/#guide/${slug}` : '';
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
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <Share2 size={14} />
        Share:
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 flex items-center justify-center transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={14} className="text-sky-600 dark:text-sky-400" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 flex items-center justify-center transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={14} className="text-blue-600 dark:text-blue-400" />
      </a>
      <button
        onClick={handleCopyLink}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
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

// Table of Contents
function TableOfContents({ guide }: { guide: NonNullable<ReturnType<typeof getBuyingGuideBySlug>> }) {
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'top-picks', title: 'Our Top Picks' },
  ];
  if (guide.comparisonData.length > 0) {
    sections.push({ id: 'comparison', title: 'Comparison' });
  }
  if (guide.decisionGuide.length > 0) {
    sections.push({ id: 'decision-guide', title: 'Which One Is Right for You?' });
  }
  if (guide.faq.length > 0) {
    sections.push({ id: 'faq', title: 'FAQ' });
  }

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

interface BuyingGuidePageProps {
  guideSlug: string;
}

export function BuyingGuidePage({ guideSlug }: BuyingGuidePageProps) {
  const navigate = useRouterStore((s) => s.navigate);
  const goHome = useRouterStore((s) => s.goHome);
  const goToAuthor = useRouterStore((s) => s.goToAuthor);
  const goToCategory = useRouterStore((s) => s.goToCategory);

  const guide = getBuyingGuideBySlug(guideSlug);

  // Update SEO meta tags for this guide
  useSeoMeta(guide ? generateGuideMeta(guide) : undefined);

  if (!guide) {
    return (
      <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Guide Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The buying guide you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => goHome()} className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921]">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const author = getAuthorBySlug(guide.authorSlug);
  const recommendedProducts = guide.recommendedProducts
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean) as typeof products;

  const typeConfig = guideTypeConfig[guide.guideType];
  const TypeIcon = typeConfig?.icon || BookOpen;

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Guide structured data for SEO (includes FAQPage) */}
        <JsonLdScript data={generateGuidePageJsonLd(guide)} />
        <Breadcrumbs
          items={[
            { label: guide.category, route: { page: 'category', slug: guide.categorySlug } },
            { label: guide.title },
          ]}
        />

        {/* Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-6 md:p-8 lg:p-12 text-white">
            {/* Guide Type Badge */}
            <Badge className={`${typeConfig?.color || 'bg-gray-600 text-white'} mb-3 gap-1`}>
              <TypeIcon size={12} />
              {typeConfig?.label || guide.guideType}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{guide.title}</h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mb-4">{guide.excerpt}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {author && (
                <button
                  onClick={() => goToAuthor(author.slug)}
                  className="flex items-center gap-1.5 hover:text-[#febd69] transition-colors"
                >
                  <User size={14} />
                  {author.name}
                </button>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Updated {new Date(guide.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {guide.readingTime} min read
              </span>
            </div>
            {/* Social Share */}
            <div className="mt-4">
              <SocialShareButtons title={guide.title} slug={guide.slug} />
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <TableOfContents guide={guide} />

        {/* Introduction */}
        <div id="introduction" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6 scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Introduction</h2>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {guide.introduction}
          </div>
        </div>

        {/* Recommended Products */}
        <div id="top-picks" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6 scroll-mt-4">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Top Picks</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Comparison Table — NO PRICES */}
        {guide.comparisonData.length > 0 && (
          <div id="comparison" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6 scroll-mt-4">
            <div className="flex items-center gap-3 mb-6">
              <GitCompare className="w-6 h-6 text-[#c7511f]" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comparison</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Comparing features, specs, and ratings — check retailer sites for current pricing.
            </p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHead className="font-bold text-gray-900 dark:text-white min-w-[120px]">Feature</TableHead>
                    {Object.keys(guide.comparisonData[0].values).map((product) => (
                      <TableHead key={product} className="font-bold text-gray-900 dark:text-white min-w-[130px]">
                        {product}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guide.comparisonData.map((row, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/50'}>
                      <TableCell className="font-medium text-gray-900 dark:text-white">{row.feature}</TableCell>
                      {Object.values(row.values).map((value, vIndex) => (
                        <TableCell key={vIndex} className="text-gray-700 dark:text-gray-300">
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Decision Guide */}
        {guide.decisionGuide.length > 0 && (
          <div id="decision-guide" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6 scroll-mt-4">
            <div className="flex items-center gap-3 mb-6">
              <Compass className="w-6 h-6 text-[#c7511f]" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Which One Is Right for You?</h2>
            </div>
            <div className="space-y-4">
              {guide.decisionGuide.map((item, index) => (
                <Card key={index} className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[#131921] text-[#febd69] flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          &quot;{item.useCase}&quot;
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowRight size={14} className="text-[#c7511f]" />
                          <span className="font-semibold text-[#c7511f]">{item.recommendation}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {guide.faq.length > 0 && (
          <div id="faq" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6 scroll-mt-4">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 text-[#c7511f]" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {guide.faq.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-gray-700/50"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold text-gray-900 dark:text-white hover:text-[#c7511f] hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* CTA Block — Multi-Retailer Price Comparison */}
        <div className="bg-gradient-to-r from-[#131921] to-[#37475a] rounded-lg p-4 sm:p-6 md:p-8 text-white mb-6">
          <h2 className="text-2xl font-bold mb-3 text-center">Ready to Make Your Choice?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto text-center">
            Check the latest prices and find the best deal for the gear that&apos;s right for you.
          </p>
          <div className="space-y-4 max-w-2xl mx-auto">
            {recommendedProducts.slice(0, 3).map((product) => {
              const retailers: { merchant: Merchant; label: string; color: string }[] = [
                { merchant: 'amazon', label: 'Amazon', color: '#FF9900' },
                { merchant: 'walmart', label: 'Walmart', color: '#0071DC' },
                { merchant: 'bestbuy', label: 'Best Buy', color: '#0046BE' },
              ];
              return (
                <div
                  key={product.id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                >
                  <h3 className="font-semibold text-white mb-3 text-sm leading-tight">{product.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {retailers.map((r) => {
                      const url = getAffiliateUrl({ merchant: r.merchant, productId: product.asin });
                      const linkProps = getAffiliateLinkProps(url);
                      const isPrimary = product.merchant === r.merchant;
                      return (
                        <a
                          key={r.merchant}
                          {...linkProps}
                          className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold text-xs px-4 py-2 transition-all hover:shadow-md active:scale-[0.98] ${
                            isPrimary
                              ? 'ring-1 ring-white/30'
                              : ''
                          }`}
                          style={{
                            backgroundColor: r.color,
                            color: '#ffffff',
                            opacity: isPrimary ? 1 : 0.85,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.filter = 'brightness(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = isPrimary ? '1' : '0.85';
                            e.currentTarget.style.filter = 'brightness(1)';
                          }}
                        >
                          <ExternalLink size={12} />
                          Check Price on {r.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-5 text-center">
            GearGeekz earns from qualifying purchases via affiliate links. Prices and availability are subject to change on the retailer&apos;s site.
          </p>
        </div>

        {/* Author Card */}
        {author && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-[#131921] to-[#37475a] flex items-center justify-center text-white text-xl font-bold cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => goToAuthor(author.slug)}
              >
                {author.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Written by</p>
                <button
                  onClick={() => goToAuthor(author.slug)}
                  className="font-bold text-gray-900 dark:text-white hover:text-[#c7511f] transition-colors"
                >
                  {author.name}
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{author.bio.substring(0, 120)}...</p>
              </div>
            </div>
          </div>
        )}

        {/* Share at bottom */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <SocialShareButtons title={guide.title} slug={guide.slug} />
        </div>
      </div>
    </div>
  );
}
