// Core types for the premium product review publication — GearScope

export interface Product {
  id: string;
  slug: string;
  title: string;
  image: string;
  gallery: string[];
  excerpt: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  brand: string;
  brandSlug: string;
  features: Record<string, string>;
  pros: string[];
  cons: string[];
  // NO PRICE FIELDS — prices are shown only on merchant sites
  rating: number;
  ratingBreakdown: RatingBreakdown;
  asin: string;
  merchant: Merchant;
  tags: string[];
  updatedAt: string;
  publishedAt: string;
  authorSlug: string;
  reviewStatus: 'verified' | 'updated' | 'new';
  bestFor: string[];
  summary: string;
  fullReview: string;
  whoIsItFor: string;
  whoShouldSkip: string;
  specifications: Record<string, string>;
  relatedProducts: string[];
}

export type Merchant = 'amazon' | 'walmart' | 'bestbuy' | 'target' | 'rei' | 'bhphoto';

export interface RatingBreakdown {
  overall: number;
  performance: number;
  easeOfUse: number;
  value: number;
  buildQuality: number;
  features: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  featured?: boolean;
}

export interface Brand {
  slug: string;
  name: string;
  logo: string;
  description: string;
  founded?: string;
  headquarters?: string;
  website?: string;
  categories: string[];
  productCount: number;
}

export interface Author {
  slug: string;
  name: string;
  photo: string;
  bio: string;
  expertise: string[];
  reviewCount: number;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
  };
}

export type GuideType = 'best-products' | 'comparison' | 'brand-review' | 'category-guide';

export interface BuyingGuide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  categorySlug: string;
  guideType: GuideType;
  introduction: string;
  recommendedProducts: string[];
  comparisonData: ComparisonRow[];
  decisionGuide: DecisionItem[];
  faq: FAQItem[];
  updatedAt: string;
  authorSlug: string;
  readingTime: number;
}

export interface ComparisonRow {
  feature: string;
  values: Record<string, string>;
}

export interface DecisionItem {
  useCase: string;
  recommendation: string;
  reason: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  authorSlug: string;
  tags: string[];
  readingTime: number;
}

// Router types
export type RoutePath =
  | { page: 'home' }
  | { page: 'product'; slug: string }
  | { page: 'category'; slug: string }
  | { page: 'brand'; slug: string }
  | { page: 'search'; query: string }
  | { page: 'buying-guide'; slug: string }
  | { page: 'author'; slug: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'privacy' }
  | { page: 'terms' }
  | { page: 'editorial-policy' }
  | { page: 'how-we-test' }
  | { page: 'trending' }
  | { page: 'roundups' }
  | { page: 'blog' }
  | { page: 'blog-post'; slug: string }
  | { page: 'wishlist' }
  | { page: 'compare' }
  | { page: 'guides' }
  | { page: 'bookmarks' }
  | { page: 'gear-finder' }
  | { page: 'affiliate-settings' }
  | { page: 'admin' }
  | { page: 'admin-products' }
  | { page: 'admin-categories' }
  | { page: 'admin-brands' }
  | { page: 'admin-affiliate' }
  | { page: 'best-sellers' }
  | { page: 'deals' }
  | { page: 'not-found' };
