import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/db';

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

// POST /api/seed — Seed database from TypeScript data files
// Query param: ?force=true to force reseed even if data exists
export async function POST(req: NextRequest) {
  const errors: string[] = [];

  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

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

    // ─── Step 2: Load seed data ─────────────────────────────────────────────────
    const { categories } = await import('@/data/categories');
    const { brands } = await import('@/data/brands');
    const { products } = await import('@/data/products');
    const { blogPosts } = await import('@/data/blog-posts');

    const result = {
      products: { seeded: 0, skipped: 0, errors: 0 },
      categories: { seeded: 0, skipped: 0, errors: 0 },
      brands: { seeded: 0, skipped: 0, errors: 0 },
      blogPosts: { seeded: 0, skipped: 0, errors: 0 },
    };

    // ─── Step 3: Seed categories ────────────────────────────────────────────────
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

    // ─── Step 4: Seed brands ────────────────────────────────────────────────────
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

    // ─── Step 5: Seed products ──────────────────────────────────────────────────
    try {
      const existingProducts = await db.product.findMany();
      const existingProductSlugs = new Set(existingProducts.map((p) => p.slug as string));

      for (const product of products) {
        if (!force && existingProductSlugs.has(product.slug)) {
          result.products.skipped++;
          continue;
        }

        try {
          const productData = {
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
              where: { slug },
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

    // ─── Step 6: Seed blog posts ────────────────────────────────────────────────
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

    return NextResponse.json({
      message: 'Seed completed',
      result,
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
      earlierWarnings: errors.length > 0 ? errors : undefined,
    }, { status: 500 });
  }
}
