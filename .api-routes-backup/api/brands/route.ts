import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// JSON array fields that need parsing for brands
const BRAND_JSON_ARRAY_FIELDS = ['categories'] as const;

function parseBrand(raw: Record<string, unknown>) {
  const parsed = { ...raw };

  for (const field of BRAND_JSON_ARRAY_FIELDS) {
    const val = parsed[field] as string;
    try {
      parsed[field] = JSON.parse(val || '[]');
    } catch {
      parsed[field] = [];
    }
  }

  return parsed;
}

function stringifyBrand(data: Record<string, unknown>): Record<string, string | number | null> {
  const result: Record<string, string | number | null> = {};

  for (const [key, val] of Object.entries(data)) {
    if (BRAND_JSON_ARRAY_FIELDS.includes(key as typeof BRAND_JSON_ARRAY_FIELDS[number])) {
      if (Array.isArray(val)) {
        result[key] = JSON.stringify(val);
      } else if (typeof val === 'string') {
        result[key] = val;
      } else {
        result[key] = '[]';
      }
    } else {
      result[key] = (val as string | number | null) ?? null;
    }
  }

  return result;
}

// GET /api/brands — List all brands
export async function GET() {
  try {
    const brands = await db.brandDB.findMany({
      orderBy: { name: 'asc' },
    });

    const parsed = brands.map((b) => parseBrand(b as unknown as Record<string, unknown>));

    return NextResponse.json({ brands: parsed });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

// POST /api/brands — Create a brand
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const requiredFields = ['slug', 'name', 'logo', 'description'];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    const existing = await db.brandDB.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Brand with this slug already exists' }, { status: 409 });
    }

    const stringified = stringifyBrand(body);

    const brand = await db.brandDB.create({
      data: {
        slug: String(stringified.slug ?? ''),
        name: String(stringified.name ?? ''),
        logo: String(stringified.logo ?? ''),
        description: String(stringified.description ?? ''),
        founded: typeof stringified.founded === 'string' ? stringified.founded : null,
        headquarters: typeof stringified.headquarters === 'string' ? stringified.headquarters : null,
        website: typeof stringified.website === 'string' ? stringified.website : null,
        categories: String(stringified.categories || '[]'),
        productCount: Number(stringified.productCount) || 0,
      },
    });

    return NextResponse.json({ brand: parseBrand(brand as unknown as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}

// PATCH /api/brands — Update a brand
// Body: { slug: string, ...updates }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, ...updates } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing required field: slug' }, { status: 400 });
    }

    const existing = await db.brandDB.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const stringified = stringifyBrand(updates);

    const allowedFields = ['name', 'logo', 'description', 'founded', 'headquarters', 'website', 'categories', 'productCount'];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (stringified[field] !== undefined) {
        updateData[field] = stringified[field];
      }
    }

    const brand = await db.brandDB.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json({ brand: parseBrand(brand as unknown as Record<string, unknown>) });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

// DELETE /api/brands — Delete a brand
// Body: { slug: string }
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing required field: slug' }, { status: 400 });
    }

    const existing = await db.brandDB.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    await db.brandDB.delete({ where: { slug } });

    return NextResponse.json({ message: 'Brand deleted successfully', slug });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
