// Product types for the affiliate site
export interface Product {
  id: string;
  slug: string;
  title: string;
  image: string;
  gallery?: string[];
  excerpt: string;
  category: string;
  categorySlug: string;
  brand: string;
  features: Record<string, string>;
  pros: string[];
  cons: string[];
  price: string;
  originalPrice?: string;
  rating: number;
  ratingBreakdown: RatingBreakdown;
  asin: string;
  tags: string[];
  updatedAt: string;
  publishedAt: string;
  authorSlug: string;
  reviewStatus: 'verified' | 'updated' | 'new';
  bestFor: string;
  summary: string;
  fullReview: string;
  whoIsItFor: string;
  whoShouldSkip: string;
  specifications: Record<string, string>;
  relatedProducts: string[];
}

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

export interface BuyingGuide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  categorySlug: string;
  introduction: string;
  recommendedProducts: string[];
  comparisonData: ComparisonRow[];
  decisionGuide: DecisionItem[];
  faq: FAQItem[];
  updatedAt: string;
  authorSlug: string;
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
}

// Router types
export type RoutePath =
  | { page: 'home' }
  | { page: 'product'; slug: string }
  | { page: 'category'; slug: string }
  | { page: 'search'; query: string }
  | { page: 'buying-guide'; slug: string }
  | { page: 'author'; slug: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'privacy' }
  | { page: 'terms' }
  | { page: 'editorial-policy' }
  | { page: 'how-we-test' }
  | { page: 'deals' }
  | { page: 'best-sellers' }
  | { page: 'reviews' }
  | { page: 'blog' }
  | { page: 'blog-post'; slug: string }
  | { page: 'wishlist' }
  | { page: 'compare' }
  | { page: 'guides' }
  | { page: 'not-found' };
