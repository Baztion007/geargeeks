import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// JSON array fields that need parsing for blog posts
const BLOG_JSON_ARRAY_FIELDS = ['tags'] as const;

function parseBlogPost(raw: Record<string, unknown>) {
  const parsed = { ...raw };
  for (const field of BLOG_JSON_ARRAY_FIELDS) {
    const val = parsed[field];
    if (typeof val === 'string') {
      try {
        parsed[field] = JSON.parse(val || '[]');
      } catch {
        parsed[field] = [];
      }
    } else if (!Array.isArray(val)) {
      parsed[field] = [];
    }
  }
  return parsed;
}

function stringifyBlogData(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  for (const field of BLOG_JSON_ARRAY_FIELDS) {
    if (result[field] !== undefined) {
      if (Array.isArray(result[field])) {
        result[field] = JSON.stringify(result[field]);
      } else if (typeof result[field] !== 'string') {
        result[field] = '[]';
      }
    }
  }
  return result;
}

// Ensure BlogPost table exists (auto-creates on first request)
let _blogTableEnsured = false;
async function ensureBlogTable() {
  if (_blogTableEnsured) return;
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS BlogPost (
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
      )
    `);
    _blogTableEnsured = true;
  } catch (e) {
    console.error('Error creating BlogPost table:', e);
    _blogTableEnsured = true; // Don't retry on every request
  }
}

// GET /api/blog — List all blog posts
export async function GET(req: NextRequest) {
  try {
    await ensureBlogTable();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');
    const limit = Number(searchParams.get('limit')) || 0;

    if (slug) {
      const post = await db.blogPost.findUnique({ where: { slug } });
      if (!post) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json({ post: parseBlogPost(post as Record<string, unknown>) }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    let posts;
    try {
      posts = await db.blogPost.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { publishedAt: 'desc' },
        take: limit > 0 ? limit : undefined,
      });
    } catch {
      // Fallback: orderBy may fail if column doesn't exist yet
      console.warn('Blog query with orderBy failed, trying without');
      posts = await db.blogPost.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        take: limit > 0 ? limit : undefined,
      });
    }

    const parsed = posts.map((p) => parseBlogPost(p as Record<string, unknown>));

    return NextResponse.json({ posts: parsed }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('no such table') || errorMessage.includes('does not exist')) {
      return NextResponse.json({ posts: [] }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// POST /api/blog — Create a blog post
export async function POST(req: NextRequest) {
  try {
    await ensureBlogTable();
    const body = await req.json();

    const requiredFields = ['slug', 'title', 'content', 'category'];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    // Check for duplicate slug
    const existing = await db.blogPost.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Blog post with this slug already exists' }, { status: 409 });
    }

    const data = stringifyBlogData({
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt || '',
      image: body.image || '',
      category: body.category,
      content: body.content,
      authorSlug: body.authorSlug || 'alex-rivera',
      tags: body.tags || [],
      readingTime: body.readingTime || estimateReadingTime(body.content),
    });

    const post = await db.blogPost.create({ data });

    return NextResponse.json({ post: parseBlogPost(post as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}

// PATCH /api/blog — Update a blog post
export async function PATCH(req: NextRequest) {
  try {
    await ensureBlogTable();
    const body = await req.json();
    const { slug, ...updates } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing required field: slug' }, { status: 400 });
    }

    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const data = stringifyBlogData({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    if (updates.content && !updates.readingTime) {
      data.readingTime = estimateReadingTime(updates.content);
    }

    const allowedFields = ['title', 'excerpt', 'image', 'category', 'content', 'publishedAt', 'authorSlug', 'tags', 'readingTime', 'updatedAt'];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const post = await db.blogPost.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json({ post: parseBlogPost(post as Record<string, unknown>) });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE /api/blog — Delete a blog post
export async function DELETE(req: NextRequest) {
  try {
    await ensureBlogTable();
    const body = await req.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing required field: slug' }, { status: 400 });
    }

    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    await db.blogPost.delete({ where: { slug } });

    return NextResponse.json({ message: 'Blog post deleted successfully', slug });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}

function estimateReadingTime(content: string): number {
  if (!content) return 5;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
