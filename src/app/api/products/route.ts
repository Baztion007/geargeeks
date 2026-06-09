import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'edge';

// JSON string fields that need parsing when reading from DB
const JSON_ARRAY_FIELDS = ['gallery', 'pros', 'cons', 'tags', 'bestFor', 'relatedProducts'] as const;
const JSON_OBJECT_FIELDS = ['features', 'ratingBreakdown', 'specifications'] as const;

type JSONArrayField = (typeof JSON_ARRAY_FIELDS)[number];
type JSONObjectField = (typeof JSON_OBJECT_FIELDS)[number];

function parseProduct(raw: Record<string, unknown>) {
  const parsed = { ...raw };

  for (const field of JSON_ARRAY_FIELDS) {
    const val = parsed[field] as string;
    try {
      parsed[field] = JSON.parse(val || '[]');
    } catch {
      parsed[field] = [];
    }
  }

  for (const field of JSON_OBJECT_FIELDS) {
    const val = parsed[field] as string;
    try {
      parsed[field] = JSON.parse(val || '{}');
    } catch {
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
      // SQLite doesn't support full-text search natively via Prisma,
      // so we use contains for basic search
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { tags: { contains: search } },
        { brand: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const products = await db.product.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.product.count({ where });

    const parsed = products.map((p) => parseProduct(p as unknown as Record<string, unknown>));

    return NextResponse.json({ products: parsed, total, limit, offset });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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
        publishedAt: typeof body.publishedAt === 'string' ? new Date(body.publishedAt) : undefined,
      },
    });

    return NextResponse.json(parseProduct(product as unknown as Record<string, unknown>), { status: 201 });
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
      'rating', 'ratingBreakdown', 'asin', 'merchant', 'tags',
      'authorSlug', 'reviewStatus', 'bestFor', 'summary', 'fullReview',
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

    return NextResponse.json(parseProduct(product as unknown as Record<string, unknown>));
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
