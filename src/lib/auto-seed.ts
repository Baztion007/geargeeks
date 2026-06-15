/**
 * Auto-seed mechanism for Cloudflare Workers deployment.
 *
 * When the app is first deployed to Cloudflare, the Turso database is empty.
 * Instead of requiring the user to manually click "Seed Database" in the admin panel,
 * this module automatically detects an empty database and seeds it.
 *
 * This is critical because on Cloudflare Workers:
 * - The database starts empty after first deployment
 * - Users might not know they need to seed
 * - The seed API endpoint requires admin authentication
 *
 * The auto-seed runs once and sets a flag to avoid re-running on every request.
 */

import { db, generateId } from '@/lib/db';
import { categories } from '@/data/categories';
import { brands } from '@/data/brands';
import { products } from '@/data/products';
import { blogPosts } from '@/data/blog-posts';

// Track whether auto-seed has been attempted (in-memory for Worker lifetime)
let _autoSeedAttempted = false;
let _autoSeedPromise: Promise<boolean> | null = null;

// Table creation SQL
const CREATE_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS Product (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    image TEXT DEFAULT '',
    gallery TEXT DEFAULT '[]',
    excerpt TEXT DEFAULT '',
    category TEXT DEFAULT '',
    categorySlug TEXT DEFAULT '',
    subcategory TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    brandSlug TEXT DEFAULT '',
    features TEXT DEFAULT '{}',
    pros TEXT DEFAULT '[]',
    cons TEXT DEFAULT '[]',
    rating REAL DEFAULT 0,
    ratingBreakdown TEXT DEFAULT '{}',
    asin TEXT DEFAULT '',
    merchant TEXT DEFAULT 'amazon',
    affiliateUrl TEXT DEFAULT '',
    priceUrl TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    updatedAt TEXT DEFAULT '',
    publishedAt TEXT DEFAULT '',
    authorSlug TEXT DEFAULT 'alex-rivera',
    reviewStatus TEXT DEFAULT 'new',
    bestFor TEXT DEFAULT '[]',
    summary TEXT DEFAULT '',
    fullReview TEXT DEFAULT '',
    whoIsItFor TEXT DEFAULT '',
    whoShouldSkip TEXT DEFAULT '',
    specifications TEXT DEFAULT '{}',
    relatedProducts TEXT DEFAULT '[]'
  )`,
  `CREATE TABLE IF NOT EXISTS CategoryDB (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    productCount INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS BrandDB (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT DEFAULT '',
    description TEXT DEFAULT '',
    founded TEXT,
    headquarters TEXT,
    website TEXT,
    categories TEXT DEFAULT '[]',
    productCount INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS BlogPost (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT DEFAULT '',
    image TEXT DEFAULT '',
    category TEXT DEFAULT '',
    content TEXT DEFAULT '',
    publishedAt TEXT DEFAULT '',
    updatedAt TEXT DEFAULT '',
    authorSlug TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    readingTime INTEGER DEFAULT 5
  )`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT DEFAULT '',
    message TEXT NOT NULL,
    createdAt TEXT DEFAULT '',
    isRead INTEGER DEFAULT 0,
    ip_address TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS NewsletterSubscriber (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    createdAt TEXT DEFAULT '',
    active INTEGER DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS UserReview (
    id TEXT PRIMARY KEY,
    productSlug TEXT NOT NULL,
    author TEXT NOT NULL,
    rating REAL DEFAULT 0,
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    pros TEXT,
    cons TEXT,
    verified INTEGER DEFAULT 0,
    helpful INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS PriceAlert (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    productSlug TEXT NOT NULL,
    targetPrice TEXT DEFAULT '',
    createdAt TEXT DEFAULT '',
    active INTEGER DEFAULT 1,
    UNIQUE(email, productSlug)
  )`,
  `CREATE TABLE IF NOT EXISTS AffiliateMerchantConfig (
    id TEXT PRIMARY KEY,
    merchantId TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    affiliateTag TEXT DEFAULT '',
    baseUrl TEXT DEFAULT '',
    urlTemplate TEXT DEFAULT '',
    enabled INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 1,
    color TEXT DEFAULT '#FF9900',
    icon TEXT DEFAULT 'shopping-bag',
    updatedAt TEXT DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS AffiliateGlobalSettings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    linkStrategy TEXT DEFAULT 'direct',
    redirectPrefix TEXT DEFAULT '/go/',
    nofollowEnabled INTEGER DEFAULT 1,
    sponsoredEnabled INTEGER DEFAULT 1,
    noopenerEnabled INTEGER DEFAULT 1,
    openInNewTab INTEGER DEFAULT 1,
    clickTracking INTEGER DEFAULT 1,
    impressionTracking INTEGER DEFAULT 0,
    updatedAt TEXT DEFAULT ''
  )`,
];

/**
 * Check if the database needs seeding (no products table or empty products).
 * Returns true if auto-seed should run.
 */
async function needsSeeding(): Promise<boolean> {
  try {
    const count = await db.product.count();
    return count === 0;
  } catch {
    // Table probably doesn't exist — needs seeding
    return true;
  }
}

/**
 * Run the auto-seed process.
 * Creates tables and seeds all data.
 * Returns true if seeding succeeded, false otherwise.
 */
async function runAutoSeed(): Promise<boolean> {
  console.log('[auto-seed] Starting automatic database seeding...');

  try {
    // Step 1: Create all tables
    for (const sql of CREATE_TABLES_SQL) {
      try {
        await db.$executeRawUnsafe(sql);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // "already exists" is fine — table was created by another request
        if (!msg.includes('already exists')) {
          console.warn('[auto-seed] Table creation warning:', msg.substring(0, 100));
        }
      }
    }
    console.log('[auto-seed] Tables created successfully');

    // Step 2: Check if data already exists (another concurrent request may have seeded)
    const productCount = await db.product.count();
    if (productCount > 0) {
      console.log('[auto-seed] Database already has data, skipping seed');
      return true;
    }

    // Step 3: Seed categories
    for (const category of categories) {
      try {
        await db.categoryDB.create({
          data: {
            slug: category.slug,
            name: category.name,
            description: category.description,
            image: category.image,
            productCount: category.productCount,
            featured: category.featured ? 1 : 0,
          },
        });
      } catch (e) {
        console.warn(`[auto-seed] Category ${category.slug} skipped:`, e instanceof Error ? e.message?.substring(0, 60) : String(e));
      }
    }
    console.log(`[auto-seed] Seeded ${categories.length} categories`);

    // Step 4: Seed brands
    for (const brand of brands) {
      try {
        await db.brandDB.create({
          data: {
            slug: brand.slug,
            name: brand.name,
            logo: brand.logo,
            description: brand.description,
            founded: brand.founded || null,
            headquarters: brand.headquarters || null,
            website: brand.website || null,
            categories: JSON.stringify(brand.categories || []),
            productCount: brand.productCount,
          },
        });
      } catch (e) {
        console.warn(`[auto-seed] Brand ${brand.slug} skipped:`, e instanceof Error ? e.message?.substring(0, 60) : String(e));
      }
    }
    console.log(`[auto-seed] Seeded ${brands.length} brands`);

    // Step 5: Seed products
    let productsSeeded = 0;
    for (const product of products) {
      try {
        const productData: Record<string, unknown> = {
          slug: product.slug,
          title: product.title,
          image: product.image,
          gallery: JSON.stringify(product.gallery || []),
          excerpt: product.excerpt,
          category: product.category,
          categorySlug: product.categorySlug,
          subcategory: product.subcategory || '',
          brand: product.brand,
          brandSlug: product.brandSlug,
          features: JSON.stringify(product.features || {}),
          pros: JSON.stringify(product.pros || []),
          cons: JSON.stringify(product.cons || []),
          rating: product.rating || 0,
          ratingBreakdown: JSON.stringify(product.ratingBreakdown || {}),
          asin: product.asin || '',
          merchant: product.merchant || 'amazon',
          affiliateUrl: product.affiliateUrl || '',
          priceUrl: product.priceUrl || '',
          tags: JSON.stringify(product.tags || []),
          authorSlug: product.authorSlug || 'alex-rivera',
          reviewStatus: product.reviewStatus || 'new',
          bestFor: JSON.stringify(product.bestFor || []),
          summary: product.summary || '',
          fullReview: product.fullReview || '',
          whoIsItFor: product.whoIsItFor || '',
          whoShouldSkip: product.whoShouldSkip || '',
          specifications: JSON.stringify(product.specifications || {}),
          relatedProducts: JSON.stringify(product.relatedProducts || []),
          publishedAt: product.publishedAt || new Date().toISOString(),
        };

        await db.product.create({ data: productData });
        productsSeeded++;
      } catch (e) {
        console.warn(`[auto-seed] Product ${product.slug} skipped:`, e instanceof Error ? e.message?.substring(0, 60) : String(e));
      }
    }
    console.log(`[auto-seed] Seeded ${productsSeeded}/${products.length} products`);

    // Step 6: Seed blog posts
    for (const post of blogPosts) {
      try {
        await db.blogPost.create({
          data: {
            id: post.id || generateId(),
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            image: post.image || '',
            category: post.category,
            content: post.content,
            publishedAt: post.publishedAt || new Date().toISOString(),
            updatedAt: post.updatedAt || new Date().toISOString(),
            authorSlug: post.authorSlug,
            tags: JSON.stringify(post.tags || []),
            readingTime: post.readingTime || 5,
          },
        });
      } catch (e) {
        console.warn(`[auto-seed] BlogPost ${post.slug} skipped:`, e instanceof Error ? e.message?.substring(0, 60) : String(e));
      }
    }
    console.log(`[auto-seed] Seeded ${blogPosts.length} blog posts`);

    console.log('[auto-seed] ✅ Auto-seed completed successfully');
    return true;
  } catch (error) {
    console.error('[auto-seed] ❌ Auto-seed failed:', error);
    return false;
  }
}

/**
 * Reset the auto-seed flag. Call this after manual seeding via the admin panel
 * so that the next request knows data is available.
 */
export function resetAutoSeedFlag(): void {
  _autoSeedAttempted = false;
}

/**
 * Ensure the database is seeded. Call this from API routes.
 * This function is idempotent — it only seeds if the database is empty.
 * It also prevents concurrent seeding from multiple requests.
 */
export async function ensureSeeded(): Promise<void> {
  // If we've already attempted auto-seed, skip (even if it failed,
  // we don't want to retry on every request)
  if (_autoSeedAttempted) return;

  // Check if seeding is needed
  const needsIt = await needsSeeding();
  if (!needsIt) {
    _autoSeedAttempted = true;
    return;
  }

  // Prevent concurrent seeding
  if (_autoSeedPromise) {
    await _autoSeedPromise;
    return;
  }

  _autoSeedPromise = runAutoSeed();
  const success = await _autoSeedPromise;
  _autoSeedPromise = null;
  _autoSeedAttempted = true;

  if (!success) {
    console.error('[auto-seed] Auto-seed failed. The database may be empty. Try manual seeding via admin panel.');
  }
}
