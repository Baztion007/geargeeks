'use client';

import { useEffect } from 'react';
import { siteData } from '@/lib/affiliate';
import type { RoutePath } from '@/lib/types';
import { useRouterStore } from '@/lib/router';

// Per-page meta configuration — maps route pages to title/description
const PAGE_META: Record<string, { title: string; description: string; path: string }> = {
  home: { title: 'GearGeekz — Gear Up Smart', description: 'Premium product reviews and buying guides to help you discover the right gear for your life.', path: '/' },
  trending: { title: 'Trending Gear — GearGeekz', description: 'Discover the latest trending gear, recently updated reviews, and hot products.', path: '/trending' },
  'best-sellers': { title: 'Best Sellers — GearGeekz', description: 'Our top-rated products across all categories, ranked by expert reviews.', path: '/best-sellers' },
  deals: { title: 'Deals — GearGeekz', description: 'Find the best deals on premium gear from Amazon, Walmart, Best Buy, and more.', path: '/deals' },
  guides: { title: 'Buying Guides — GearGeekz', description: 'Expert buying guides to help you choose the right gear for every need.', path: '/guides' },
  blog: { title: 'Blog — GearGeekz', description: 'Gear news, tips, and in-depth articles from our editorial team.', path: '/blog' },
  about: { title: 'About GearGeekz', description: 'Learn about our editorial process, expert team, and commitment to unbiased reviews.', path: '/about' },
  contact: { title: 'Contact Us — GearGeekz', description: 'Get in touch with the GearGeekz team.', path: '/contact' },
  privacy: { title: 'Privacy Policy — GearGeekz', description: 'GearGeekz privacy policy.', path: '/privacy' },
  terms: { title: 'Terms of Service — GearGeekz', description: 'GearGeekz terms of service.', path: '/terms' },
  'editorial-policy': { title: 'Editorial Policy — GearGeekz', description: 'Our editorial independence and review standards.', path: '/editorial-policy' },
  'how-we-test': { title: 'How We Test — GearGeekz', description: 'Our rigorous hands-on testing methodology.', path: '/how-we-test' },
  wishlist: { title: 'Wishlist — GearGeekz', description: 'Your saved products and gear wishlist.', path: '/wishlist' },
  compare: { title: 'Compare Products — GearGeekz', description: 'Compare products side by side with detailed specs.', path: '/compare' },
  search: { title: 'Search — GearGeekz', description: 'Search for gear, reviews, and guides.', path: '/search' },
  roundups: { title: 'Product Roundups — GearGeekz', description: 'Curated product roundups and comparisons.', path: '/roundups' },
  bookmarks: { title: 'Bookmarks — GearGeekz', description: 'Your bookmarked articles and guides.', path: '/bookmarks' },
  'gear-finder': { title: 'Gear Finder Quiz — GearGeekz', description: 'Take our quiz to find the perfect gear for you.', path: '/gear-finder' },
  'affiliate-settings': { title: 'Affiliate Settings — GearGeekz', description: 'Manage your affiliate preferences.', path: '/affiliate-settings' },
};

interface DynamicMeta {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export function useSeoMeta(dynamicMeta?: DynamicMeta) {
  const route = useRouterStore((s) => s.route);

  useEffect(() => {
    let title = 'GearGeekz — Gear Up Smart';
    let description = 'Premium product reviews and buying guides to help you discover the right gear for your life.';
    let canonical = siteData.url;
    let ogImage = '';
    let ogType = 'website';

    if (dynamicMeta) {
      title = dynamicMeta.title;
      description = dynamicMeta.description;
      if (dynamicMeta.canonical) canonical = dynamicMeta.canonical;
      if (dynamicMeta.ogImage) ogImage = dynamicMeta.ogImage;
      if (dynamicMeta.ogType) ogType = dynamicMeta.ogType;
    } else {
      const pageMeta = PAGE_META[route.page];
      if (pageMeta) {
        title = pageMeta.title;
        description = pageMeta.description;
        canonical = `${siteData.url}${pageMeta.path}`;
      }
    }

    // Update document title
    document.title = title;

    // Update or create meta description
    updateMetaTag('description', description);

    // Update or create canonical link
    updateCanonicalLink(canonical);

    // Update OG tags
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:type', ogType);
    updateMetaProperty('og:url', canonical);
    if (ogImage) {
      updateMetaProperty('og:image', ogImage);
    }

    // Update Twitter tags
    updateMetaName('twitter:title', title);
    updateMetaName('twitter:description', description);
    if (ogImage) {
      updateMetaName('twitter:image', ogImage);
    }

    // Update keywords if provided
    if (dynamicMeta?.keywords && dynamicMeta.keywords.length > 0) {
      updateMetaTag('keywords', dynamicMeta.keywords.join(', '));
    }
  }, [route, dynamicMeta]);
}

function updateMetaTag(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function updateMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function updateMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function updateCanonicalLink(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}
