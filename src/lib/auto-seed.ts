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
 * The auto-seed checks each entity type INDIVIDUALLY and only seeds what's missing.
 * This means if products seeded but blog posts failed, the next request will
 * retry seeding blog posts without re-seeding products.
 *
 * If the database connection fails (wrong auth token, etc.), the seed is NOT marked
 * as attempted so it will retry on the next request.
 */

import { db, generateId, testConnection } from '@/lib/db';
import { categories } from '@/data/categories';
import { brands } from '@/data/brands';
import { products } from '@/data/products';
import { blogPosts } from '@/data/blog-posts';

// Track whether auto-seed has been fully completed (all entity types present)
let _autoSeedCompleted = false;
let _autoSeedPromise: Promise<void> | null = null;

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
 * Check counts for each entity type individually.
 * Returns an object with counts and whether any entity needs seeding.
 */
async function checkEntityCounts(): Promise<{
  productCount: number;
  categoryCount: number;
  brandCount: number;
  blogPostCount: number;
  needsAnySeeding: boolean;
  connectionOk: boolean;
  error?: string;
}> {
  try {
    const [productCount, categoryCount, brandCount, blogPostCount] = await Promise.all([
      db.product.count().catch(() => 0),
      db.categoryDB.count().catch(() => 0),
      db.brandDB.count().catch(() => 0),
      db.blogPost.count().catch(() => 0),
    ]);

    return {
      productCount,
      categoryCount,
      brandCount,
      blogPostCount,
      needsAnySeeding: productCount === 0 || categoryCount === 0 || brandCount === 0 || blogPostCount === 0,
      connectionOk: true,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isConnectionError = msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized') ||
      msg.includes('authentication') || msg.includes('handshake') || msg.includes('ECONNREFUSED') ||
      msg.includes('fetch failed') || msg.includes('Invalid URL');

    if (isConnectionError) {
      const connTest = await testConnection();
      return {
        productCount: 0, categoryCount: 0, brandCount: 0, blogPostCount: 0,
        needsAnySeeding: false,
        connectionOk: connTest.ok,
        error: connTest.error || msg,
      };
    }

    // Table probably doesn't exist — needs seeding
    return {
      productCount: 0, categoryCount: 0, brandCount: 0, blogPostCount: 0,
      needsAnySeeding: true,
      connectionOk: true,
      error: msg,
    };
  }
}

/**
 * Seed categories if the table is empty.
 */
async function seedCategories(): Promise<number> {
  const count = await db.categoryDB.count().catch(() => 0);
  if (count > 0) return count;

  let seeded = 0;
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
      seeded++;
    } catch (e) {
      console.warn(`[auto-seed] Category ${category.slug} skipped:`, e instanceof Error ? e.message?.substring(0, 60) : String(e));
    }
  }
  console.log(`[auto-seed] Seeded ${seeded}/${categories.length} categories`);
  return seeded;
}

/**
 * Seed brands if the table is empty.
 */
async function seedBrands(): Promise<number> {
  const count = await db.brandDB.count().catch(() => 0);
  if (count > 0) return count;

  let seeded = 0;
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
      seeded++;
    } catch (e) {
      console.warn(`[auto-seed] Brand ${brand.slug} skipped:`, e instanceof Error ? e.message?.substring(0, 60) : String(e));
    }
  }
  console.log(`[auto-seed] Seeded ${seeded}/${brands.length} brands`);
  return seeded;
}

/**
 * Seed products if the table is empty.
 */
async function seedProducts(): Promise<number> {
  const count = await db.product.count().catch(() => 0);
  if (count > 0) return count;

  let seeded = 0;
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
      seeded++;
    } catch (e) {
      console.warn(`[auto-seed] Product ${product.slug} skipped:`, e instanceof Error ? e.message?.substring(0, 60) : String(e));
    }
  }
  console.log(`[auto-seed] Seeded ${seeded}/${products.length} products`);
  return seeded;
}

/**
 * Seed blog posts if the table is empty.
 */
async function seedBlogPosts(): Promise<number> {
  const count = await db.blogPost.count().catch(() => 0);
  if (count > 0) return count;

  let seeded = 0;
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
      seeded++;
    } catch (e) {
      console.warn(`[auto-seed] BlogPost ${post.slug} skipped:`, e instanceof Error ? e.message?.substring(0, 60) : String(e));
    }
  }
  console.log(`[auto-seed] Seeded ${seeded}/${blogPosts.length} blog posts`);
  return seeded;
}

/**
 * Run the auto-seed process.
 * Creates tables and seeds any entity type that has 0 rows.
 * Each entity type is checked independently, so partial seeding is supported.
 */
async function runAutoSeed(): Promise<void> {
  console.log('[auto-seed] Starting automatic database seeding...');

  // First, verify database connection is working
  const connTest = await testConnection();
  if (!connTest.ok) {
    const hasToken = !!process.env.DATABASE_AUTH_TOKEN;
    const errorMsg = !hasToken
      ? `DATABASE_AUTH_TOKEN is not set. Set it in Cloudflare Workers → Settings → Variables and Secrets.`
      : `Database connection failed: ${connTest.error}. Check DATABASE_URL and DATABASE_AUTH_TOKEN in Cloudflare Workers secrets.`;
    console.error('[auto-seed] ❌ Connection test failed:', errorMsg);
    _lastAutoSeedError = errorMsg;
    return;
  }

  try {
    // Step 1: Create all tables (idempotent — skips if exists)
    let tableErrors = 0;
    for (const sql of CREATE_TABLES_SQL) {
      try {
        await db.$executeRawUnsafe(sql);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes('already exists')) {
          console.warn('[auto-seed] Table creation warning:', msg.substring(0, 100));
          tableErrors++;
        }
      }
    }
    console.log('[auto-seed] Tables created successfully');

    // Step 2: Seed each entity type individually (only if empty)
    // This is the key fix: each type is checked separately, so if products
    // were seeded but blog posts failed, we'll still seed blog posts.
    await seedCategories();
    await seedBrands();
    await seedProducts();
    await seedBlogPosts();

    // Step 3: Verify all entity types have data
    const counts = await checkEntityCounts();
    if (counts.needsAnySeeding) {
      console.warn('[auto-seed] ⚠️ Some entity types are still empty after seeding:', {
        products: counts.productCount,
        categories: counts.categoryCount,
        brands: counts.brandCount,
        blogPosts: counts.blogPostCount,
      });
    } else {
      console.log('[auto-seed] ✅ All entity types have data — seeding complete');
      _autoSeedCompleted = true;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[auto-seed] ❌ Auto-seed failed:', msg);
    _lastAutoSeedError = msg;
  }
}

/**
 * Reset the auto-seed flag. Call this after manual seeding via the admin panel
 * so that the next request knows data is available.
 */
export function resetAutoSeedFlag(): void {
  _autoSeedCompleted = false;
}

/** Get the last auto-seed error (for diagnostics) */
let _lastAutoSeedError: string | null = null;
export function getLastAutoSeedError(): string | null {
  return _lastAutoSeedError;
}

/**
 * Ensure the database is seeded. Call this from API routes.
 * This function is idempotent — it only seeds entity types that have 0 rows.
 * It also prevents concurrent seeding from multiple requests.
 *
 * If the database connection fails, this does NOT set _autoSeedCompleted = true,
 * so the next request will try again.
 */
export async function ensureSeeded(): Promise<void> {
  // If all entity types are already populated, skip
  if (_autoSeedCompleted) return;

  // Prevent concurrent seeding
  if (_autoSeedPromise) {
    await _autoSeedPromise;
    return;
  }

  // Quick check: are all entity types populated?
  const counts = await checkEntityCounts();

  if (!counts.connectionOk) {
    // Connection failed — don't mark as completed so we retry next time
    _lastAutoSeedError = counts.error || 'Database connection failed';
    console.error('[auto-seed] Database connection failed, will retry on next request:', _lastAutoSeedError);
    return;
  }

  if (!counts.needsAnySeeding) {
    // All entity types have data
    _autoSeedCompleted = true;
    _lastAutoSeedError = null;
    return;
  }

  // Some entity types need seeding — run the full seed process
  console.log('[auto-seed] Some entity types are empty, running seed:', {
    products: counts.productCount,
    categories: counts.categoryCount,
    brands: counts.brandCount,
    blogPosts: counts.blogPostCount,
  });

  _autoSeedPromise = runAutoSeed();
  await _autoSeedPromise;
  _autoSeedPromise = null;

  // After seeding, check again
  const postCounts = await checkEntityCounts();
  if (!postCounts.needsAnySeeding && postCounts.connectionOk) {
    _autoSeedCompleted = true;
    _lastAutoSeedError = null;
  }
}
