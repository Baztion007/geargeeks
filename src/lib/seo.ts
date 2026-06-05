import type { Product, Category, Brand, BuyingGuide, BlogPost, Author } from '@/lib/types';
import { getAffiliateUrl, getMerchantName, siteData } from '@/lib/affiliate';

const SITE_URL = siteData.url;

// ─── Deterministic hash for ratingCount ────────────────────────────────────
function hashSlugToCount(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    const char = slug.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Map to range 100–600
  return Math.abs(hash % 500) + 100;
}

// ─── Per-page meta tag generators ──────────────────────────────────────────

export function generateProductMeta(product: Product): {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogType: string;
  ogImage: string;
} {
  return {
    title: `${product.title} Review — ${siteData.name}`,
    description: `${product.summary} Read our hands-on ${product.brand} ${product.title} review with ratings, pros/cons, and expert analysis.`,
    keywords: [
      product.title,
      product.brand,
      product.category,
      ...product.bestFor,
      'review',
      'rating',
      ...product.tags,
    ],
    canonical: `${SITE_URL}/product/${product.slug}`,
    ogType: 'product',
    ogImage: product.image,
  };
}

export function generateCategoryMeta(category: Category): {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogType: string;
  ogImage: string;
} {
  return {
    title: `Best ${category.name} — Reviews & Buying Guides | ${siteData.name}`,
    description: `${category.description} Explore ${category.productCount} expert-reviewed ${category.name.toLowerCase()} with ratings and recommendations.`,
    keywords: [category.name, 'reviews', 'buying guide', 'best', 'ratings', category.slug],
    canonical: `${SITE_URL}/category/${category.slug}`,
    ogType: 'website',
    ogImage: category.image,
  };
}

export function generateBrandMeta(brand: Brand): {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogType: string;
  ogImage: string;
} {
  return {
    title: `${brand.name} Products — Reviews & Ratings | ${siteData.name}`,
    description: `${brand.description} Browse ${brand.productCount} reviewed ${brand.name} products with expert ratings and analysis.`,
    keywords: [brand.name, 'brand review', 'product ratings', ...brand.categories],
    canonical: `${SITE_URL}/brand/${brand.slug}`,
    ogType: 'website',
    ogImage: brand.logo,
  };
}

export function generateGuideMeta(guide: BuyingGuide): {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogType: string;
  ogImage: string;
} {
  return {
    title: `${guide.title} | ${siteData.name}`,
    description: `${guide.excerpt} Read our comprehensive ${guide.guideType.replace('-', ' ')} guide — ${guide.readingTime} min read.`,
    keywords: [guide.title, guide.category, guide.guideType, 'buying guide', 'recommendations'],
    canonical: `${SITE_URL}/guide/${guide.slug}`,
    ogType: 'article',
    ogImage: guide.image,
  };
}

export function generateBlogMeta(post: BlogPost): {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogType: string;
  ogImage: string;
} {
  return {
    title: `${post.title} | ${siteData.name}`,
    description: `${post.excerpt} ${post.readingTime} min read.`,
    keywords: [post.title, post.category, ...post.tags],
    canonical: `${SITE_URL}/blog/${post.slug}`,
    ogType: 'article',
    ogImage: post.image,
  };
}

// ─── JSON-LD generators ───────────────────────────────────────────────────

export function generateProductPageJsonLd(product: Product): object {
  const affiliateUrl = getAffiliateUrl({ merchant: product.merchant, productId: product.asin });

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.gallery.length > 0 ? product.gallery : product.image,
    description: product.excerpt,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: affiliateUrl,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: getMerchantName(product.merchant),
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: hashSlugToCount(product.slug),
    },
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: product.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        '@type': 'Organization',
        name: siteData.name,
      },
      datePublished: product.publishedAt,
      description: product.summary,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category,
        item: `${SITE_URL}/category/${product.categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${SITE_URL}/product/${product.slug}`,
      },
    ],
  };

  return {
    '@graph': [productSchema, breadcrumbSchema],
  };
}

export function generateCategoryPageJsonLd(category: Category, products: Product[]): object {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: `${SITE_URL}/category/${category.slug}`,
    image: category.image,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.title,
        url: `${SITE_URL}/product/${product.slug}`,
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: `${SITE_URL}/category/${category.slug}`,
      },
    ],
  };

  return {
    '@graph': [collectionSchema, breadcrumbSchema],
  };
}

export function generateBrandPageJsonLd(brand: Brand, products: Product[]): object {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    description: brand.description,
    url: brand.website || `${SITE_URL}/brand/${brand.slug}`,
    logo: brand.logo.startsWith('http') ? brand.logo : `${SITE_URL}${brand.logo}`,
    ...(brand.founded ? { foundingDate: brand.founded } : {}),
    ...(brand.headquarters ? { address: { '@type': 'PostalAddress', addressLocality: brand.headquarters } } : {}),
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brand.name} Products`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.title,
      url: `${SITE_URL}/product/${product.slug}`,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: brand.name,
        item: `${SITE_URL}/brand/${brand.slug}`,
      },
    ],
  };

  return {
    '@graph': [organizationSchema, itemListSchema, breadcrumbSchema],
  };
}

export function generateGuidePageJsonLd(guide: BuyingGuide): object {
  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt,
    image: guide.image,
    datePublished: guide.updatedAt,
    dateModified: guide.updatedAt,
    author: {
      '@type': 'Organization',
      name: siteData.name,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: siteData.name,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}${siteData.logo}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/guide/${guide.slug}`,
    },
  };

  const schemas: Record<string, unknown>[] = [articleSchema];

  // FAQPage schema — especially important for buying guides
  if (guide.faq.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
    schemas.push(faqSchema);
  }

  // BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: guide.category,
        item: `${SITE_URL}/category/${guide.categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: `${SITE_URL}/guide/${guide.slug}`,
      },
    ],
  };
  schemas.push(breadcrumbSchema);

  return {
    '@graph': schemas,
  };
}

export function generateBlogPostJsonLd(post: BlogPost): object {
  const blogSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: siteData.name,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: siteData.name,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}${siteData.logo}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };

  return {
    '@graph': [blogSchema, breadcrumbSchema],
  };
}

export function generateAuthorJsonLd(author: Author, productCount: number): object {
  const personSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `${SITE_URL}/author/${author.slug}`,
    image: author.photo.startsWith('http') ? author.photo : `${SITE_URL}${author.photo}`,
    description: author.bio,
    jobTitle: 'Product Reviewer',
    worksFor: {
      '@type': 'Organization',
      name: siteData.name,
      url: SITE_URL,
    },
    knowsAbout: author.expertise,
  };

  // Add social links as sameAs
  if (author.socialLinks) {
    const sameAs: string[] = [];
    if (author.socialLinks.twitter) sameAs.push(author.socialLinks.twitter);
    if (author.socialLinks.linkedin) sameAs.push(author.socialLinks.linkedin);
    if (sameAs.length > 0) {
      personSchema.sameAs = sameAs;
    }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: author.name,
        item: `${SITE_URL}/author/${author.slug}`,
      },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Reviews by ${author.name}`,
    numberOfItems: productCount,
  };

  return {
    '@graph': [personSchema, breadcrumbSchema, itemListSchema],
  };
}
