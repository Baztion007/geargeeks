import { NextRequest, NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/db';
import { ensureSeeded } from '@/lib/auto-seed';

// JSON string fields that need parsing when reading from DB
const JSON_ARRAY_FIELDS = ['gallery', 'pros', 'cons', 'tags', 'bestFor', 'relatedProducts'] as const;
const JSON_OBJECT_FIELDS = ['features', 'ratingBreakdown', 'specifications'] as const;

function parseProduct(raw: Record<string, unknown>) {
  const parsed = { ...raw };

  for (const field of JSON_ARRAY_FIELDS) {
    const val = parsed[field];
    if (Array.isArray(val)) continue;
    if (typeof val === 'string') {
      try {
        parsed[field] = JSON.parse(val || '[]');
      } catch {
        parsed[field] = [];
      }
    } else {
      parsed[field] = [];
    }
  }

  for (const field of JSON_OBJECT_FIELDS) {
    const val = parsed[field];
    if (val && typeof val === 'object' && !Array.isArray(val)) continue;
    if (typeof val === 'string') {
      try {
        parsed[field] = JSON.parse(val || '{}');
      } catch {
        parsed[field] = {};
      }
    } else {
      parsed[field] = {};
    }
  }

  return parsed;
}

function stringifyProduct(data: Record<string, unknown>) {
  const result = { ...data };

  for (const field of JSON_ARRAY_FIELDS) {
    const val = result[field];
    if (Array.isArray(val)) {
      result[field] = JSON.stringify(val);
    } else if (typeof val === 'string') {
      // already a string, keep it
    } else {
      result[field] = '[]';
    }
  }

  for (const field of JSON_OBJECT_FIELDS) {
    const val = result[field];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      result[field] = JSON.stringify(val);
    } else if (typeof val === 'string') {
      // already a string, keep it
    } else {
      result[field] = '{}';
    }
  }

  return result;
}

// GET /api/products — List all products (with optional filters)
// Query params: ?category=travel-gear&brand=anker&search=query&limit=20&offset=0
export async function GET(req: NextRequest) {
  try {
    // Auto-seed: If database is empty (first deployment), seed it automatically
    await ensureSeeded();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: Record<string, unknown> = {};

    if (category) {
      where.categorySlug = category;
    }
    if (brand) {
      where.brandSlug = brand;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { tags: { contains: search } },
        { brand: { contains: search } },
        { category: { contains: search } },
      ];
    }

    let products;
    let total;
    try {
      products = await db.product.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      });
      total = await db.product.count({ where });
    } catch (dbError) {
      // Fallback: ORDER BY publishedAt may fail if column doesn't exist yet (migration pending)
      console.warn('Products query with orderBy failed, trying without orderBy:', dbError instanceof Error ? dbError.message : String(dbError));
      try {
        products = await db.product.findMany({ where, take: limit, skip: offset });
        total = await db.product.count({ where });
      } catch (fallbackError) {
        // Both queries failed — this is a real database connection issue
        const errMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error('Products query failed completely:', errMsg);

        // Test connection to give better diagnostics
        const connTest = await testConnection();
        const dbUrl = process.env.DATABASE_URL || 'NOT SET';
        const hasToken = !!process.env.DATABASE_AUTH_TOKEN;

        return NextResponse.json({
          products: [],
          total: 0,
          error: 'Database query failed',
          diagnostics: {
            dbUrl: dbUrl === 'NOT SET' ? 'NOT SET' : dbUrl.substring(0, 40) + '...',
            authTokenSet: hasToken,
            connectionOk: connTest.ok,
            connectionError: connTest.error,
            hint: !hasToken ? 'DATABASE_AUTH_TOKEN is not set — check Cloudflare Workers secrets' :
                  !connTest.ok ? `Connection test failed: ${connTest.error}` :
                   'Database connected but query failed — tables may not exist. Try /api/seed',
          },
        }, { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } });
      }
    }

    // Products are already parsed by db.ts parseProductRow, but do an extra pass
    // for safety in case any fields weren't parsed
    const parsed = products.map((p) => parseProduct(p as Record<string, unknown>));

    return NextResponse.json({ products: parsed, total, limit, offset }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching products:', errMsg);

    // Test connection for better error message
    const connTest = await testConnection();
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const hasToken = !!process.env.DATABASE_AUTH_TOKEN;

    return NextResponse.json({
      error: 'Failed to fetch products',
      diagnostics: {
        dbUrl: dbUrl === 'NOT SET' ? 'NOT SET' : dbUrl.substring(0, 40) + '...',
        authTokenSet: hasToken,
        connectionOk: connTest.ok,
        connectionError: connTest.error,
        hint: !hasToken ? 'DATABASE_AUTH_TOKEN is not set — check Cloudflare Workers secrets' :
              !connTest.ok ? `Connection test failed: ${connTest.error}` :
               'Unexpected error — check server logs',
      },
    }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}

// POST /api/products — Create a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const requiredFields = ['slug', 'title', 'image', 'excerpt', 'category', 'categorySlug', 'brand', 'brandSlug'];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await db.product.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 409 });
    }

    const stringified = stringifyProduct(body);

    const product = await db.product.create({
      data: {
        slug: String(stringified.slug ?? ''),
        title: String(stringified.title ?? ''),
        image: String(stringified.image ?? ''),
        gallery: String(stringified.gallery || '[]'),
        excerpt: String(stringified.excerpt ?? ''),
        category: String(stringified.category ?? ''),
        categorySlug: String(stringified.categorySlug ?? ''),
        subcategory: String(stringified.subcategory ?? ''),
        brand: String(stringified.brand ?? ''),
        brandSlug: String(stringified.brandSlug ?? ''),
        features: String(stringified.features || '{}'),
        pros: String(stringified.pros || '[]'),
        cons: String(stringified.cons || '[]'),
        rating: Number(stringified.rating) || 0,
        ratingBreakdown: String(stringified.ratingBreakdown || '{}'),
        asin: String(stringified.asin ?? ''),
        merchant: String(stringified.merchant ?? 'amazon'),
        affiliateUrl: String(stringified.affiliateUrl ?? ''),
        priceUrl: String(stringified.priceUrl ?? ''),
        tags: String(stringified.tags || '[]'),
        authorSlug: String(stringified.authorSlug ?? 'alex-rivera'),
        reviewStatus: String(stringified.reviewStatus ?? 'new'),
        bestFor: String(stringified.bestFor || '[]'),
        summary: String(stringified.summary ?? ''),
        fullReview: String(stringified.fullReview ?? ''),
        whoIsItFor: String(stringified.whoIsItFor ?? ''),
        whoShouldSkip: String(stringified.whoShouldSkip ?? ''),
        specifications: String(stringified.specifications || '{}'),
        relatedProducts: String(stringified.relatedProducts || '[]'),
        publishedAt: typeof body.publishedAt === 'string' ? new Date(body.publishedAt).toISOString() : undefined,
      },
    });

    return NextResponse.json(parseProduct(product as Record<string, unknown>), { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PATCH /api/products — Update a product
// Body: { slug: string, ...updates }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, ...updates } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing required field: slug' }, { status: 400 });
    }

    const existing = await db.product.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const stringified = stringifyProduct(updates);

    // Build update data only with provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'title', 'image', 'gallery', 'excerpt', 'category', 'categorySlug',
      'subcategory', 'brand', 'brandSlug', 'features', 'pros', 'cons',
      'rating', 'ratingBreakdown', 'asin', 'merchant', 'affiliateUrl', 'priceUrl',
      'tags', 'authorSlug', 'reviewStatus', 'bestFor', 'summary', 'fullReview',
      'whoIsItFor', 'whoShouldSkip', 'specifications', 'relatedProducts',
    ];

    for (const field of allowedFields) {
      if (stringified[field] !== undefined) {
        updateData[field] = stringified[field];
      }
    }

    const product = await db.product.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json(parseProduct(product as Record<string, unknown>));
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products — Delete a product
// Body: { slug: string }
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing required field: slug' }, { status: 400 });
    }

    const existing = await db.product.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.product.delete({ where: { slug } });

    return NextResponse.json({ message: 'Product deleted successfully', slug });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
