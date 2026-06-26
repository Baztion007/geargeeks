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
  // Enriched fields (from auto-fetch)
  image?: string;
  description?: string;
  features?: string[];
  price?: string;
  ratingCount?: number;
  categoryGuess?: string;
  // Editorial fields (LLM-reasoned)
  overview?: string;
  whoIsItFor?: string;
  whoShouldSkip?: string;
  bestFor?: string[];
  pros?: string[];
  cons?: string[];
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

    const results: { success: boolean; asin: string; title?: string; slug?: string; brandCreated?: boolean; categoryCreated?: boolean; error?: string }[] = [];

    for (const item of products) {
      try {
        const asin = extractAsin(item.input || item.asin || '');
        if (!asin) {
          results.push({ success: false, asin: item.input || 'unknown', error: 'Could not extract ASIN from input' });
          continue;
        }

        const title = item.title || `${asin} Product`;
        const category = item.category || item.categoryGuess || defaultCategory || 'Uncategorized';
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

        // ── Auto-create category if it doesn't exist ───────────────────────
        // Skip "Uncategorized" to avoid polluting the catalog with junk categories.
        let categoryCreated = false;
        if (categorySlug && categorySlug !== 'uncategorized') {
          try {
            const existingCat = await db.categoryDB.findUnique({ where: { slug: categorySlug } });
            if (!existingCat) {
              await db.categoryDB.create({
                data: {
                  slug: categorySlug,
                  name: category,
                  description: `${category} products reviewed by GearGeekz`,
                  image: '',
                  productCount: 0,
                  featured: false,
                },
              });
              categoryCreated = true;
            }
          } catch (catErr) {
            // Non-fatal — continue with product creation even if category auto-create fails
            console.warn('Auto-create category failed:', catErr instanceof Error ? catErr.message : String(catErr));
          }
        }

        // ── Auto-create brand if it doesn't exist ──────────────────────────
        // Skip "Unknown" to avoid polluting the catalog with junk brands.
        let brandCreated = false;
        if (brandSlug && brand !== 'Unknown' && brand !== 'unknown') {
          try {
            const existingBrand = await db.brandDB.findUnique({ where: { slug: brandSlug } });
            if (!existingBrand) {
              await db.brandDB.create({
                data: {
                  slug: brandSlug,
                  name: brand,
                  logo: item.image || '',
                  description: `${brand} products reviewed by GearGeekz`,
                  categories: JSON.stringify(categorySlug ? [categorySlug] : []),
                  productCount: 0,
                },
              });
              brandCreated = true;
            }
          } catch (brandErr) {
            console.warn('Auto-create brand failed:', brandErr instanceof Error ? brandErr.message : String(brandErr));
          }
        }

        // Build features object from array (auto-fetch) — store as {highlight1: "...", highlight2: "..."}
        let featuresObj: Record<string, string> = {};
        if (Array.isArray(item.features) && item.features.length > 0) {
          item.features.forEach((f, i) => {
            featuresObj[`highlight${i + 1}`] = String(f).slice(0, 300);
          });
        }

        // Build excerpt: prefer description, fall back to features join, then default
        let excerpt = item.excerpt || '';
        if (!excerpt && item.description) {
          excerpt = item.description.slice(0, 200);
        } else if (!excerpt && item.overview) {
          excerpt = item.overview.slice(0, 200);
        } else if (!excerpt && item.features && item.features.length > 0) {
          excerpt = item.features.slice(0, 3).join(' · ').slice(0, 200);
        } else if (!excerpt) {
          excerpt = `Product review for ${title}`;
        }

        // Image: prefer enriched image, fall back to Amazon CDN
        const image = item.image || `https://images-na.ssl-images-amazon.com/images/P/${asin}`;

        // Tags: include category guess and price hint
        const tags: string[] = [];
        if (item.categoryGuess) tags.push(item.categoryGuess.toLowerCase());
        if (brand && brand !== 'Unknown') tags.push(brand.toLowerCase());
        if (asin) tags.push(asin.toLowerCase());
        if (Array.isArray(item.bestFor)) {
          item.bestFor.forEach(b => { if (typeof b === 'string' && b.trim()) tags.push(b.trim().toLowerCase()); });
        }

        // Specifications: include price & rating count if available
        const specifications: Record<string, string> = {};
        if (item.price) specifications['Price'] = `$${item.price}`;
        if (item.ratingCount) specifications['Rating Count'] = String(item.ratingCount);
        specifications['ASIN'] = asin;
        if (item.description) specifications['Description'] = item.description.slice(0, 200);

        // Editorial fields from auto-fetch LLM extraction
        const overview = (typeof item.overview === 'string' && item.overview.trim()) ? item.overview.trim().slice(0, 1500) : '';
        const whoIsItFor = (typeof item.whoIsItFor === 'string' && item.whoIsItFor.trim()) ? item.whoIsItFor.trim().slice(0, 800) : '';
        const whoShouldSkip = (typeof item.whoShouldSkip === 'string' && item.whoShouldSkip.trim()) ? item.whoShouldSkip.trim().slice(0, 800) : '';
        const bestForArr = Array.isArray(item.bestFor) ? item.bestFor.filter(b => typeof b === 'string' && b.trim()).slice(0, 8) : [];
        const prosArr = Array.isArray(item.pros) ? item.pros.filter(p => typeof p === 'string' && p.trim()).slice(0, 8) : [];
        const consArr = Array.isArray(item.cons) ? item.cons.filter(c => typeof c === 'string' && c.trim()).slice(0, 8) : [];

        // summary: prefer overview (richer), fall back to description, then excerpt
        const summary = overview || (item.description ? item.description.slice(0, 400) : '') || excerpt.slice(0, 400);

        // fullReview: use overview as the body if we have one (gives the product page content)
        const fullReview = overview || '';

        const productData = {
          slug,
          title,
          image,
          gallery: '[]',
          excerpt,
          category,
          categorySlug,
          subcategory: '',
          brand,
          brandSlug,
          features: JSON.stringify(featuresObj),
          pros: JSON.stringify(prosArr),
          cons: JSON.stringify(consArr),
          rating: item.rating || 0,
          ratingBreakdown: '{}',
          asin,
          merchant,
          tags: JSON.stringify(tags),
          authorSlug: 'alex-rivera',
          reviewStatus: 'draft',
          bestFor: JSON.stringify(bestForArr),
          summary,
          fullReview,
          whoIsItFor,
          whoShouldSkip,
          specifications: JSON.stringify(specifications),
          relatedProducts: '[]',
        };

        const product = await db.product.create({ data: productData });

        results.push({ success: true, asin, title, slug: product.slug as string, brandCreated, categoryCreated });
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
