import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function stringifyCategory(data: Record<string, unknown>) {
  return { ...data };
}

// GET /api/categories — List all categories
export async function GET() {
  try {
    const categories = await db.categoryDB.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories — Create a category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const requiredFields = ['slug', 'name', 'description', 'image'];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    const existing = await db.categoryDB.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 409 });
    }

    const stringified = stringifyCategory(body);

    const category = await db.categoryDB.create({
      data: {
        slug: String(stringified.slug ?? ''),
        name: String(stringified.name ?? ''),
        description: String(stringified.description ?? ''),
        image: String(stringified.image ?? ''),
        productCount: Number(stringified.productCount) || 0,
        featured: Boolean(stringified.featured),
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PATCH /api/categories — Update a category
// Body: { slug: string, ...updates }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, ...updates } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing required field: slug' }, { status: 400 });
    }

    const existing = await db.categoryDB.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const allowedFields = ['name', 'description', 'image', 'productCount', 'featured'];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    const category = await db.categoryDB.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/categories — Delete a category
// Body: { slug: string }
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing required field: slug' }, { status: 400 });
    }

    const existing = await db.categoryDB.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await db.categoryDB.delete({ where: { slug } });

    return NextResponse.json({ message: 'Category deleted successfully', slug });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
