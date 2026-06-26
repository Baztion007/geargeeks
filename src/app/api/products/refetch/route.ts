import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/products/refetch
 *
 * Re-runs the auto-fetch pipeline on an EXISTING product (by slug or ASIN) and
 * updates its fields with freshly-extracted data from Amazon.
 *
 * Use case: products added before the hybrid regex+LLM extraction was shipped
 * have empty Overview / Who Is It For / Pros / Cons / etc. This endpoint lets
 * the admin "re-fetch" them to populate the missing fields without re-creating
 * the product (preserves slug, publishedAt, reviewStatus, authorSlug).
 *
 * Body: { slug?: string, asin?: string, overwrite?: boolean }
 *   - slug OR asin required (slug preferred — identifies the exact product)
 *   - overwrite: if true, overwrite ALL fields. If false (default), only fill
 *     EMPTY fields (preserves any manual edits the admin made).
 *
 * Returns the updated product.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, asin: asinParam, overwrite = false } = body;

    if (!slug && !asinParam) {
      return NextResponse.json({ error: 'Provide slug or asin to identify the product' }, { status: 400 });
    }

    // Find the existing product
    let existing;
    if (slug) {
      existing = await db.product.findUnique({ where: { slug } });
    }
    if (!existing && asinParam) {
      existing = await db.product.findFirst({ where: { asin: asinParam } });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const asin = (existing.asin as string) || asinParam;
    if (!asin) {
      return NextResponse.json({ error: 'Product has no ASIN — cannot re-fetch' }, { status: 400 });
    }

    // ── Step 1: Call the auto-fetch logic ────────────────────────────────────
    // We reuse the auto-fetch route by importing its extraction logic via an
    // internal HTTP call (keeps the extraction code in one place).
    const baseUrl = req.nextUrl.origin || 'http://localhost:3000';
    const fetchRes = await fetch(`${baseUrl}/api/products/auto-fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: [`https://www.amazon.com/dp/${asin}`] }),
    });
    const fetchData = await fetchRes.json();

    if (!fetchRes.ok || !fetchData.results?.[0]?.success) {
      const errMsg = fetchData.results?.[0]?.error || fetchData.error || 'Auto-fetch failed';
      return NextResponse.json({ error: `Re-fetch failed: ${errMsg}` }, { status: 502 });
    }

    const fetched = fetchData.results[0];

    // ── Step 2: Build the update payload ─────────────────────────────────────
    // Helper: check if an existing field is "empty" (so we know whether to fill it)
    const isEmpty = (val: unknown): boolean => {
      if (val === null || val === undefined) return true;
      if (typeof val === 'string') return val.trim() === '' || val.trim() === '[]' || val.trim() === '{}';
      if (Array.isArray(val)) return val.length === 0;
      if (typeof val === 'object') return Object.keys(val as object).length === 0;
      if (typeof val === 'number') return val === 0;
      return false;
    };

    // Parse existing JSON string fields so isEmpty works correctly
    const parseJson = (val: unknown, fallback: unknown): unknown => {
      if (typeof val !== 'string') return val ?? fallback;
      try { return JSON.parse(val); } catch { return fallback; }
    };
    const existingFeatures = parseJson(existing.features, {});
    const existingPros = parseJson(existing.pros, []);
    const existingCons = parseJson(existing.cons, []);
    const existingBestFor = parseJson(existing.bestFor, []);
    const existingSpecs = parseJson(existing.specifications, {});
    const existingTags = parseJson(existing.tags, []);

    // Build features object from array
    const featuresObj: Record<string, string> = {};
    if (Array.isArray(fetched.features)) {
      fetched.features.forEach((f: string, i: number) => {
        featuresObj[`highlight${i + 1}`] = String(f).slice(0, 300);
      });
    }

    // Specifications: merge price + ratingCount + description
    const specifications: Record<string, string> = { ...(overwrite ? {} : (existingSpecs as Record<string, string>)) };
    if (fetched.price && (overwrite || !specifications['Price'])) {
      specifications['Price'] = `$${fetched.price}`;
    }
    if (fetched.ratingCount && (overwrite || !specifications['Rating Count'])) {
      specifications['Rating Count'] = String(fetched.ratingCount);
    }
    if (fetched.description && (overwrite || !specifications['Description'])) {
      specifications['Description'] = fetched.description.slice(0, 200);
    }
    specifications['ASIN'] = asin;

    // Tags: merge existing with new
    const tagsArr: string[] = overwrite ? [] : (existingTags as string[]);
    if (fetched.categoryGuess && !tagsArr.includes(fetched.categoryGuess.toLowerCase())) {
      tagsArr.push(fetched.categoryGuess.toLowerCase());
    }
    if (fetched.brand && !tagsArr.includes(fetched.brand.toLowerCase())) {
      tagsArr.push(fetched.brand.toLowerCase());
    }
    if (Array.isArray(fetched.bestFor)) {
      fetched.bestFor.forEach((b: string) => {
        const tag = b.trim().toLowerCase();
        if (tag && !tagsArr.includes(tag)) tagsArr.push(tag);
      });
    }

    // Build update data — only set fields that are empty OR when overwrite=true
    const shouldSet = (existingVal: unknown, newVal: unknown): boolean => {
      if (newVal === undefined || newVal === null) return false;
      if (typeof newVal === 'string' && newVal.trim() === '') return false;
      if (Array.isArray(newVal) && newVal.length === 0) return false;
      return overwrite || isEmpty(existingVal);
    };

    const overview = fetched.overview || fetched.description || '';
    const updateData: Record<string, unknown> = {};

    if (shouldSet(existing.title, fetched.title)) updateData.title = fetched.title;
    if (shouldSet(existing.brand, fetched.brand)) {
      updateData.brand = fetched.brand;
      updateData.brandSlug = slugify(fetched.brand);
    }
    if (shouldSet(existing.image, fetched.image)) updateData.image = fetched.image;
    if (shouldSet(existing.rating, fetched.rating)) updateData.rating = fetched.rating;
    if (shouldSet(existing.category, fetched.categoryGuess)) {
      updateData.category = fetched.categoryGuess;
      updateData.categorySlug = slugify(fetched.categoryGuess);
    }
    if (shouldSet(existingFeatures, featuresObj) && Object.keys(featuresObj).length > 0) {
      updateData.features = JSON.stringify(featuresObj);
    }
    if (shouldSet(existingPros, fetched.pros) && Array.isArray(fetched.pros)) {
      updateData.pros = JSON.stringify(fetched.pros);
    }
    if (shouldSet(existingCons, fetched.cons) && Array.isArray(fetched.cons)) {
      updateData.cons = JSON.stringify(fetched.cons);
    }
    if (shouldSet(existingBestFor, fetched.bestFor) && Array.isArray(fetched.bestFor)) {
      updateData.bestFor = JSON.stringify(fetched.bestFor);
    }
    if (shouldSet(existing.summary, overview)) updateData.summary = overview;
    if (shouldSet(existing.fullReview, overview)) updateData.fullReview = overview;
    if (shouldSet(existing.whoIsItFor, fetched.whoIsItFor)) updateData.whoIsItFor = fetched.whoIsItFor;
    if (shouldSet(existing.whoShouldSkip, fetched.whoShouldSkip)) updateData.whoShouldSkip = fetched.whoShouldSkip;
    if (shouldSet(existing.excerpt, fetched.description)) {
      updateData.excerpt = (fetched.description || overview).slice(0, 200);
    }
    updateData.specifications = JSON.stringify(specifications);
    updateData.tags = JSON.stringify(tagsArr);

    // ── Step 3: Auto-create brand/category if they don't exist (like bulk-import) ─
    if (updateData.brandSlug && updateData.brand) {
      try {
        const brandSlug = updateData.brandSlug as string;
        const brandName = updateData.brand as string;
        const existingBrand = await db.brandDB.findUnique({ where: { slug: brandSlug } });
        if (!existingBrand) {
          await db.brandDB.create({
            data: {
              slug: brandSlug,
              name: brandName,
              logo: (updateData.image as string) || '',
              description: `${brandName} products reviewed by GearGeekz`,
              categories: JSON.stringify(updateData.categorySlug ? [updateData.categorySlug] : []),
              productCount: 0,
            },
          });
        }
      } catch (e) {
        console.warn('Re-fetch: auto-create brand failed:', e instanceof Error ? e.message : String(e));
      }
    }
    if (updateData.categorySlug && updateData.category) {
      try {
        const catSlug = updateData.categorySlug as string;
        const catName = updateData.category as string;
        if (catSlug !== 'uncategorized') {
          const existingCat = await db.categoryDB.findUnique({ where: { slug: catSlug } });
          if (!existingCat) {
            await db.categoryDB.create({
              data: {
                slug: catSlug,
                name: catName,
                description: `${catName} products reviewed by GearGeekz`,
                image: '',
                productCount: 0,
                featured: false,
              },
            });
          }
        }
      } catch (e) {
        console.warn('Re-fetch: auto-create category failed:', e instanceof Error ? e.message : String(e));
      }
    }

    // ── Step 4: Update the product ───────────────────────────────────────────
    const updated = await db.product.update({
      where: { slug: existing.slug as string },
      data: updateData,
    });

    const fieldsUpdated = Object.keys(updateData).filter(k => k !== 'specifications' && k !== 'tags');

    return NextResponse.json({
      success: true,
      message: `Re-fetched and updated ${fieldsUpdated.length} field(s)${overwrite ? ' (overwrite mode)' : ' (empty-fields-only mode)'}`,
      product: parseProduct(updated as Record<string, unknown>),
      fieldsUpdated,
      fetchedData: {
        title: fetched.title,
        brand: fetched.brand,
        image: fetched.image,
        price: fetched.price,
        rating: fetched.rating,
        ratingCount: fetched.ratingCount,
        featuresCount: fetched.features?.length || 0,
        prosCount: fetched.pros?.length || 0,
        consCount: fetched.cons?.length || 0,
        bestForCount: fetched.bestFor?.length || 0,
        hasOverview: !!fetched.overview,
        hasWhoIsItFor: !!fetched.whoIsItFor,
        hasWhoShouldSkip: !!fetched.whoShouldSkip,
        blocked: fetched.blocked,
        warning: fetched.warning,
      },
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('Re-fetch error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Re-fetch failed: ${msg}` }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function parseProduct(raw: Record<string, unknown>) {
  const parsed = { ...raw };
  const arrayFields = ['gallery', 'pros', 'cons', 'tags', 'bestFor', 'relatedProducts'];
  const objFields = ['features', 'ratingBreakdown', 'specifications'];
  for (const f of arrayFields) {
    if (typeof parsed[f] === 'string') {
      try { parsed[f] = JSON.parse(parsed[f] as string); } catch { parsed[f] = []; }
    }
  }
  for (const f of objFields) {
    if (typeof parsed[f] === 'string') {
      try { parsed[f] = JSON.parse(parsed[f] as string); } catch { parsed[f] = {}; }
    }
  }
  return parsed;
}
