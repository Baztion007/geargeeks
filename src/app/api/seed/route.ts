import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/db';

// Use static imports instead of dynamic — more reliable on Cloudflare Workers
import { categories } from '@/data/categories';
import { brands } from '@/data/brands';
import { products } from '@/data/products';
import { blogPosts } from '@/data/blog-posts';

// Import auto-seed module to reset its flag after manual seeding
import { resetAutoSeedFlag } from '@/lib/auto-seed';

// ─── Table creation SQL (all tables needed by the app) ────────────────────────
// These run before any seeding to ensure the database schema exists.
// This is critical for fresh Turso databases where `prisma db push`
// hasn't been run yet.

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

// ─── Migration SQL: Add missing columns to existing tables ──────────────────────
// These ALTER TABLE statements add columns that may not exist on older databases.
// Each uses "ADD COLUMN" and will be skipped if the column already exists (Turso/libsql
// will throw "duplicate column name" which we catch and ignore).

const MIGRATION_SQL = [
  // Product table — columns added in later versions
  'ALTER TABLE Product ADD COLUMN affiliateUrl TEXT DEFAULT ""',
  'ALTER TABLE Product ADD COLUMN priceUrl TEXT DEFAULT ""',
  'ALTER TABLE Product ADD COLUMN subcategory TEXT DEFAULT ""',
  'ALTER TABLE Product ADD COLUMN bestFor TEXT DEFAULT "[]"',
  'ALTER TABLE Product ADD COLUMN summary TEXT DEFAULT ""',
  'ALTER TABLE Product ADD COLUMN fullReview TEXT DEFAULT ""',
  'ALTER TABLE Product ADD COLUMN whoIsItFor TEXT DEFAULT ""',
  'ALTER TABLE Product ADD COLUMN whoShouldSkip TEXT DEFAULT ""',
  'ALTER TABLE Product ADD COLUMN specifications TEXT DEFAULT "{}"',
  'ALTER TABLE Product ADD COLUMN relatedProducts TEXT DEFAULT "[]"',
  'ALTER TABLE Product ADD COLUMN authorSlug TEXT DEFAULT "alex-rivera"',
  'ALTER TABLE Product ADD COLUMN reviewStatus TEXT DEFAULT "new"',
  'ALTER TABLE Product ADD COLUMN gallery TEXT DEFAULT "[]"',
  'ALTER TABLE Product ADD COLUMN features TEXT DEFAULT "{}"',
  'ALTER TABLE Product ADD COLUMN pros TEXT DEFAULT "[]"',
  'ALTER TABLE Product ADD COLUMN cons TEXT DEFAULT "[]"',
  'ALTER TABLE Product ADD COLUMN ratingBreakdown TEXT DEFAULT "{}"',
  'ALTER TABLE Product ADD COLUMN tags TEXT DEFAULT "[]"',
  'ALTER TABLE Product ADD COLUMN asin TEXT DEFAULT ""',
  'ALTER TABLE Product ADD COLUMN merchant TEXT DEFAULT "amazon"',
  'ALTER TABLE Product ADD COLUMN publishedAt TEXT DEFAULT ""',
  'ALTER TABLE Product ADD COLUMN updatedAt TEXT DEFAULT ""',

  // BrandDB table
  'ALTER TABLE BrandDB ADD COLUMN founded TEXT',
  'ALTER TABLE BrandDB ADD COLUMN headquarters TEXT',
  'ALTER TABLE BrandDB ADD COLUMN website TEXT',
  'ALTER TABLE BrandDB ADD COLUMN categories TEXT DEFAULT "[]"',
  'ALTER TABLE BrandDB ADD COLUMN productCount INTEGER DEFAULT 0',

  // BlogPost table
  'ALTER TABLE BlogPost ADD COLUMN authorSlug TEXT DEFAULT ""',
  'ALTER TABLE BlogPost ADD COLUMN tags TEXT DEFAULT "[]"',
  'ALTER TABLE BlogPost ADD COLUMN readingTime INTEGER DEFAULT 5',

  // contact_messages table
  'ALTER TABLE contact_messages ADD COLUMN ip_address TEXT',
];

// GET /api/seed — Diagnostics: check current DB status
export async function GET() {
  const info: Record<string, unknown> = {};

  info.env = {
    dbUrl: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 40)}...` : 'NOT SET',
    hasAuthToken: !!process.env.DATABASE_AUTH_TOKEN,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const productCount = await db.product.count();
    info.products = { count: productCount };
  } catch (e) {
    info.products = { error: e instanceof Error ? e.message : String(e) };
  }

  try {
    const categoryCount = await db.categoryDB.count();
    info.categories = { count: categoryCount };
  } catch (e) {
    info.categories = { error: e instanceof Error ? e.message : String(e) };
  }

  try {
    const brandCount = await db.brandDB.count();
    info.brands = { count: brandCount };
  } catch (e) {
    info.brands = { error: e instanceof Error ? e.message : String(e) };
  }

  try {
    const blogCount = await db.blogPost.count();
    info.blogPosts = { count: blogCount };
  } catch (e) {
    info.blogPosts = { error: e instanceof Error ? e.message : String(e) };
  }

  // Check if Product table has key columns (affiliateUrl, priceUrl)
  try {
    const testProduct = await db.product.findMany({ take: 1 });
    if (testProduct.length > 0) {
      const p = testProduct[0];
      info.productColumns = {
        hasAffiliateUrl: 'affiliateUrl' in p,
        hasPriceUrl: 'priceUrl' in p,
        hasSubcategory: 'subcategory' in p,
        hasBestFor: 'bestFor' in p,
        hasSummary: 'summary' in p,
      };
    }
  } catch (e) {
    info.productColumns = { error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json(info, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

// POST /api/seed — Seed database from TypeScript data files
// Query params: ?force=true to force reseed | ?reset=true to drop & recreate tables first
export async function POST(req: NextRequest) {
  const errors: string[] = [];
  const migrationResults: string[] = [];

  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    const reset = searchParams.get('reset') === 'true';

    // ─── Step 0 (optional): Drop and recreate all tables ──────────────────────────
    // Use ?reset=true to completely wipe the database and start fresh.
    // This is useful when the schema is corrupted or missing columns can't be added.
    if (reset) {
      const DROP_TABLES_SQL = [
        'DROP TABLE IF EXISTS Product',
        'DROP TABLE IF EXISTS CategoryDB',
        'DROP TABLE IF EXISTS BrandDB',
        'DROP TABLE IF EXISTS BlogPost',
        'DROP TABLE IF EXISTS contact_messages',
        'DROP TABLE IF EXISTS NewsletterSubscriber',
        'DROP TABLE IF EXISTS UserReview',
        'DROP TABLE IF EXISTS PriceAlert',
        'DROP TABLE IF EXISTS AffiliateMerchantConfig',
        'DROP TABLE IF EXISTS AffiliateGlobalSettings',
      ];
      for (const sql of DROP_TABLES_SQL) {
        try {
          await db.$executeRawUnsafe(sql);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`Drop table warning: ${msg.substring(0, 100)}`);
        }
      }
      migrationResults.push('All tables dropped for full reset');
    }

    // ─── Step 1: Ensure all tables exist ────────────────────────────────────────
    for (const sql of CREATE_TABLES_SQL) {
      try {
        await db.$executeRawUnsafe(sql);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('Error creating table:', msg);
        errors.push(`Table creation warning: ${msg.substring(0, 100)}`);
      }
    }

    // ─── Step 1.5: Run migrations — add missing columns ─────────────────────────
    // If any migrations succeed (meaning columns were missing), we do an
    // automatic reset+reseed because ALTER TABLE alone doesn't fix existing
    // data that was inserted without those columns, and UPDATE queries
    // referencing new columns would fail on rows that don't have them.
    let needsFullReset = false;
    for (const sql of MIGRATION_SQL) {
      try {
        await db.$executeRawUnsafe(sql);
        // If it succeeded, the column was actually missing → schema was outdated
        const match = sql.match(/ALTER TABLE (\w+) ADD COLUMN (\w+)/);
        if (match) {
          migrationResults.push(`Added ${match[2]} to ${match[1]}`);
          needsFullReset = true;
        }
      } catch (e) {
        // "duplicate column name" or "already exists" is expected if column exists
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes('duplicate column') && !msg.includes('already exists')) {
          console.error('Migration error:', msg);
        }
      }
    }

    // If migrations were needed, auto-reset to ensure clean data
    if (needsFullReset && !reset) {
      console.log('Schema was outdated (migrations applied). Auto-resetting tables for clean data...');
      const DROP_TABLES_SQL = [
        'DROP TABLE IF EXISTS Product',
        'DROP TABLE IF EXISTS CategoryDB',
        'DROP TABLE IF EXISTS BrandDB',
        'DROP TABLE IF EXISTS BlogPost',
        'DROP TABLE IF EXISTS contact_messages',
        'DROP TABLE IF EXISTS NewsletterSubscriber',
        'DROP TABLE IF EXISTS UserReview',
        'DROP TABLE IF EXISTS PriceAlert',
        'DROP TABLE IF EXISTS AffiliateMerchantConfig',
        'DROP TABLE IF EXISTS AffiliateGlobalSettings',
      ];
      for (const sql of DROP_TABLES_SQL) {
        try { await db.$executeRawUnsafe(sql); } catch { /* ok */ }
      }
      // Recreate tables with the correct schema
      for (const sql of CREATE_TABLES_SQL) {
        try { await db.$executeRawUnsafe(sql); } catch { /* ok */ }
      }
      migrationResults.push('Auto-reset: tables dropped and recreated for schema consistency');
    }

    const result = {
      products: { seeded: 0, skipped: 0, errors: 0 },
      categories: { seeded: 0, skipped: 0, errors: 0 },
      brands: { seeded: 0, skipped: 0, errors: 0 },
      blogPosts: { seeded: 0, skipped: 0, errors: 0 },
    };

    // ─── Step 2: Seed categories ────────────────────────────────────────────────
    try {
      const existingCategories = await db.categoryDB.findMany();
      const existingCategorySlugs = new Set(existingCategories.map((c) => c.slug as string));

      for (const category of categories) {
        if (!force && existingCategorySlugs.has(category.slug)) {
          result.categories.skipped++;
          continue;
        }

        try {
          if (existingCategorySlugs.has(category.slug)) {
            await db.categoryDB.update({
              where: { slug: category.slug },
              data: {
                name: category.name,
                description: category.description,
                image: category.image,
                productCount: category.productCount,
                featured: category.featured ? 1 : 0,
              },
            });
          } else {
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
          }
          result.categories.seeded++;
        } catch (error) {
          console.error(`Error seeding category ${category.slug}:`, error);
          result.categories.errors++;
          errors.push(`Category ${category.slug}: ${error instanceof Error ? error.message?.substring(0, 80) : String(error)}`);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      errors.push(`Categories query failed: ${error instanceof Error ? error.message?.substring(0, 80) : String(error)}`);
    }

    // ─── Step 3: Seed brands ────────────────────────────────────────────────────
    try {
      const existingBrands = await db.brandDB.findMany();
      const existingBrandSlugs = new Set(existingBrands.map((b) => b.slug as string));

      for (const brand of brands) {
        if (!force && existingBrandSlugs.has(brand.slug)) {
          result.brands.skipped++;
          continue;
        }

        try {
          const brandData = {
            slug: brand.slug,
            name: brand.name,
            logo: brand.logo,
            description: brand.description,
            founded: brand.founded || null,
            headquarters: brand.headquarters || null,
            website: brand.website || null,
            categories: JSON.stringify(brand.categories || []),
            productCount: brand.productCount,
          };

          if (existingBrandSlugs.has(brand.slug)) {
            await db.brandDB.update({
              where: { slug: brand.slug },
              data: brandData,
            });
          } else {
            await db.brandDB.create({
              data: brandData,
            });
          }
          result.brands.seeded++;
        } catch (error) {
          console.error(`Error seeding brand ${brand.slug}:`, error);
          result.brands.errors++;
          errors.push(`Brand ${brand.slug}: ${error instanceof Error ? error.message?.substring(0, 80) : String(error)}`);
        }
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      errors.push(`Brands query failed: ${error instanceof Error ? error.message?.substring(0, 80) : String(error)}`);
    }

    // ─── Step 4: Seed products ──────────────────────────────────────────────────
    try {
      const existingProducts = await db.product.findMany();
      const existingProductSlugs = new Set(existingProducts.map((p) => p.slug as string));

      for (const product of products) {
        if (!force && existingProductSlugs.has(product.slug)) {
          result.products.skipped++;
          continue;
        }

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

          if (existingProductSlugs.has(product.slug)) {
            const { slug, ...updateData } = productData;
            await db.product.update({
              where: { slug: slug as string },
              data: updateData,
            });
          } else {
            await db.product.create({ data: productData });
          }
          result.products.seeded++;
        } catch (error) {
          console.error(`Error seeding product ${product.slug}:`, error);
          result.products.errors++;
          errors.push(`Product ${product.slug}: ${error instanceof Error ? error.message?.substring(0, 80) : String(error)}`);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      errors.push(`Products query failed: ${error instanceof Error ? error.message?.substring(0, 80) : String(error)}`);
    }

    // ─── Step 5: Seed blog posts ────────────────────────────────────────────────
    try {
      const existingBlogPosts = await db.blogPost.findMany();
      const existingBlogSlugs = new Set(existingBlogPosts.map((p) => p.slug as string));

      for (const post of blogPosts) {
        if (!force && existingBlogSlugs.has(post.slug)) {
          result.blogPosts.skipped++;
          continue;
        }

        try {
          const postData = {
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
          };

          if (existingBlogSlugs.has(post.slug)) {
            const { slug, ...updateData } = postData;
            await db.blogPost.update({
              where: { slug },
              data: updateData,
            });
          } else {
            await db.blogPost.create({ data: postData });
          }
          result.blogPosts.seeded++;
        } catch (error) {
          console.error(`Error seeding blog post ${post.slug}:`, error);
          result.blogPosts.errors++;
          errors.push(`BlogPost ${post.slug}: ${error instanceof Error ? error.message?.substring(0, 80) : String(error)}`);
        }
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      errors.push(`BlogPosts query failed: ${error instanceof Error ? error.message?.substring(0, 80) : String(error)}`);
    }

    // Reset auto-seed flag so the next API request knows data is available
    resetAutoSeedFlag();

    return NextResponse.json({
      message: 'Seed completed',
      result,
      migrations: migrationResults.length > 0 ? migrationResults : undefined,
      totalSeeded: result.products.seeded + result.categories.seeded + result.brands.seeded + result.blogPosts.seeded,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({
      error: 'Failed to seed database',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      dbUrl: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : 'NOT SET',
      hasAuthToken: !!process.env.DATABASE_AUTH_TOKEN,
      env: process.env.NODE_ENV,
      migrationsRun: migrationResults,
      earlierWarnings: errors.length > 0 ? errors : undefined,
    }, { status: 500 });
  }
}
