import type { MetadataRoute } from 'next';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import { brands } from '@/data/brands';
import { buyingGuides } from '@/data/buying-guides';
import { blogPosts } from '@/data/blog-posts';

const SITE_URL = 'https://geargeekz.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Homepage
  const homepage: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Product pages (hash-based routing)
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/#product/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Category pages (hash-based routing)
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/#category/${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Brand pages (hash-based routing)
  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}/#brand/${brand.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Buying guide pages (hash-based routing)
  const guidePages: MetadataRoute.Sitemap = buyingGuides.map((guide) => ({
    url: `${SITE_URL}/#guide/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog post pages (hash-based routing)
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/#blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Static pages (hash-based routing)
  const staticPages: MetadataRoute.Sitemap = [
    { hash: 'about', changeFrequency: 'monthly' as const, priority: 0.5 },
    { hash: 'contact', changeFrequency: 'monthly' as const, priority: 0.5 },
    { hash: 'privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { hash: 'terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { hash: 'editorial-policy', changeFrequency: 'yearly' as const, priority: 0.4 },
    { hash: 'how-we-test', changeFrequency: 'yearly' as const, priority: 0.4 },
    { hash: 'guides', changeFrequency: 'weekly' as const, priority: 0.7 },
    { hash: 'blog', changeFrequency: 'daily' as const, priority: 0.7 },
  ].map(({ hash, changeFrequency, priority }) => ({
    url: `${SITE_URL}/#${hash}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  return [
    ...homepage,
    ...productPages,
    ...categoryPages,
    ...brandPages,
    ...guidePages,
    ...blogPages,
    ...staticPages,
  ];
}
