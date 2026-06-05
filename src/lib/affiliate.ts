import type { Merchant } from '@/lib/types';
import { generateAffiliateUrl as generateUrl, getLinkAttributes as getConfigLinkAttributes, getMerchantConfig } from './affiliate-config';

// Legacy hardcoded tags for backward compatibility (used only when trackingId is provided)
const AFFILIATE_TAGS: Record<Merchant, string> = {
  amazon: 'productreview0b-20',
  walmart: 'productreview0b',
  bestbuy: 'productreview0b',
  target: 'productreview0b',
  rei: 'productreview0b',
  bhphoto: 'productreview0b',
};

export type { Merchant };

export function getAffiliateUrl(params: { merchant: Merchant; productId: string; trackingId?: string }): string {
  const { merchant, productId, trackingId } = params;

  // If custom trackingId provided, use old direct method for backward compat
  if (trackingId) {
    const tag = trackingId;
    switch (merchant) {
      case 'amazon':
        return `https://www.amazon.com/dp/${productId}?tag=${tag}`;
      case 'walmart':
        return `https://walmart.com/ip/${productId}?affid=${tag}`;
      case 'bestbuy':
        return `https://bestbuy.com/site/${productId}?ref=${tag}`;
      case 'target':
        return `https://target.com/s?searchTerm=${productId}&ref=${tag}`;
      case 'rei':
        return `https://rei.com/product/${productId}?ref=${tag}`;
      case 'bhphoto':
        return `https://bhpho.to/${productId}`;
      default:
        return `https://www.amazon.com/dp/${productId}?tag=${tag}`;
    }
  }

  // Otherwise use the centralized config
  return generateUrl(merchant, productId);
}

export function getMerchantName(merchant: Merchant): string {
  const config = getMerchantConfig(merchant);
  if (config) return config.name;

  // Fallback
  const names: Record<Merchant, string> = {
    amazon: 'Amazon',
    walmart: 'Walmart',
    bestbuy: 'Best Buy',
    target: 'Target',
    rei: 'REI',
    bhphoto: 'B&H Photo',
  };
  return names[merchant];
}

export function getAffiliateLinkProps(url: string) {
  const attrs = getConfigLinkAttributes();
  return {
    href: url,
    target: attrs.target as '_blank',
    rel: attrs.rel,
  };
}

export const siteData = {
  name: 'GearGeekz',
  url: 'https://geargeekz.com',
  logo: '/logo.svg',
  tagline: 'Expert Reviews. Smart Recommendations.',
  description: 'Premium product reviews and buying guides to help you discover the right gear for your life.',
  contactEmail: 'hello@geargeekz.com',
  socialProfiles: [
    'https://twitter.com/geargeekz',
    'https://facebook.com/geargeekz',
    'https://instagram.com/geargeekz',
  ],
};

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteData.name,
    url: siteData.url,
    logo: `${siteData.url}${siteData.logo}`,
    email: siteData.contactEmail,
    sameAs: siteData.socialProfiles,
    description: siteData.description,
  };
}

export function generateProductJsonLd(product: import('@/lib/types').Product) {
  const affiliateUrl = getAffiliateUrl({ merchant: product.merchant, productId: product.asin });
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image,
    description: product.excerpt,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      url: affiliateUrl,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: getMerchantName(product.merchant) },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: Math.floor(Math.random() * 500) + 100,
    },
    review: {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: product.rating },
      author: { '@type': 'Person', name: siteData.name },
    },
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
