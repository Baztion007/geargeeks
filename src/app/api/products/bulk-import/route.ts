import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const JSON_ARRAY_FIELDS = ['gallery', 'pros', 'cons', 'tags', 'bestFor', 'relatedProducts'] as const;
const JSON_OBJECT_FIELDS = ['features', 'ratingBreakdown', 'specifications'] as const;

function stringifyProduct(data: Record<string, unknown>) {
  const result = { ...data };
  for (const field of JSON_ARRAY_FIELDS) {
    const val = result[field];
    if (Array.isArray(val)) {
      result[field] = JSON.stringify(val);
    } else if (typeof val !== 'string') {
      result[field] = '[]';
    }
  }
  for (const field of JSON_OBJECT_FIELDS) {
    const val = result[field];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      result[field] = JSON.stringify(val);
    } else if (typeof val !== 'string') {
      result[field] = '{}';
    }
  }
  return result;
}

// Extract ASIN from various Amazon URL formats
function extractAsin(input: string): string | null {
  const trimmed = input.trim();

  // Direct ASIN (10-char alphanumeric starting with B)
  if (/^B[A-Z0-9]{9}$/.test(trimmed)) {
    return trimmed;
  }

  // Amazon URL patterns
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/ASIN\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1].toUpperCase();
  }

  // Check if it looks like an ASIN embedded in text
  const asinMatch = trimmed.match(/\b(B[A-Z0-9]{9})\b/i);
  if (asinMatch) return asinMatch[1].toUpperCase();

  return null;
}

// Generate a slug from a title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

interface BulkImportItem {
  input: string;
  asin?: string;
  title?: string;
  category?: string;
  categorySlug?: string;
  brand?: string;
  brandSlug?: string;
  merchant?: string;
  rating?: number;
  excerpt?: string;
}

// POST /api/products/bulk-import
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products, defaultCategory, defaultCategorySlug, defaultBrand, defaultBrandSlug, defaultMerchant } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    if (products.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 products per batch' }, { status: 400 });
    }

    const results: { success: boolean; asin: string; title?: string; slug?: string; error?: string }[] = [];

    for (const item of products) {
      try {
        const asin = extractAsin(item.input || item.asin || '');
        if (!asin) {
          results.push({ success: false, asin: item.input || 'unknown', error: 'Could not extract ASIN from input' });
          continue;
        }

        const title = item.title || `${asin} Product`;
        const category = item.category || defaultCategory || 'Uncategorized';
        const categorySlug = item.categorySlug || defaultCategorySlug || slugify(category);
        const brand = item.brand || defaultBrand || 'Unknown';
        const brandSlug = item.brandSlug || defaultBrandSlug || slugify(brand);
        const merchant = item.merchant || defaultMerchant || 'amazon';
        const slug = slugify(title) + '-' + asin.toLowerCase();

        // Check if product with this ASIN already exists
        const existing = await db.product.findFirst({ where: { asin } });
        if (existing) {
          results.push({ success: false, asin, title, slug: existing.slug as string, error: 'Product with this ASIN already exists' });
          continue;
        }

        const productData = {
          slug,
          title,
          image: `https://images-na.ssl-images-amazon.com/images/P/${asin}`,
          gallery: '[]',
          excerpt: item.excerpt || `Product review for ${title}`,
          category,
          categorySlug,
          subcategory: '',
          brand,
          brandSlug,
          features: '{}',
          pros: '[]',
          cons: '[]',
          rating: item.rating || 0,
          ratingBreakdown: '{}',
          asin,
          merchant,
          tags: '[]',
          authorSlug: 'alex-rivera',
          reviewStatus: 'draft',
          bestFor: '[]',
          summary: '',
          fullReview: '',
          whoIsItFor: '',
          whoShouldSkip: '',
          specifications: '{}',
          relatedProducts: '[]',
        };

        const product = await db.product.create({ data: productData });

        results.push({ success: true, asin, title, slug: product.slug as string });
      } catch (err) {
        const asin = item.asin || extractAsin(item.input || '') || 'unknown';
        results.push({ success: false, asin, title: item.title, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Imported ${succeeded} of ${products.length} products${failed > 0 ? ` (${failed} failed)` : ''}`,
      results,
      summary: { total: products.length, succeeded, failed },
    }, { status: succeeded > 0 ? 201 : 207 });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json({ error: 'Failed to process bulk import' }, { status: 500 });
  }
}
