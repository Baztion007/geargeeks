import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/seed — Seed database from TypeScript data files
// Query param: ?force=true to force reseed even if data exists
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    // Use dynamic imports to avoid loading large data files at compile time
    const { categories } = await import('@/data/categories');
    const { brands } = await import('@/data/brands');
    const { products } = await import('@/data/products');

    const result = {
      products: { seeded: 0, skipped: 0, errors: 0 },
      categories: { seeded: 0, skipped: 0, errors: 0 },
      brands: { seeded: 0, skipped: 0, errors: 0 },
    };

    // Seed categories
    const existingCategories = await db.categoryDB.findMany();
    const existingCategorySlugs = new Set(existingCategories.map((c) => c.slug));

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
              featured: category.featured ?? false,
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
              featured: category.featured ?? false,
            },
          });
        }
        result.categories.seeded++;
      } catch (error) {
        console.error(`Error seeding category ${category.slug}:`, error);
        result.categories.errors++;
      }
    }

    // Seed brands
    const existingBrands = await db.brandDB.findMany();
    const existingBrandSlugs = new Set(existingBrands.map((b) => b.slug));

    for (const brand of brands) {
      if (!force && existingBrandSlugs.has(brand.slug)) {
        result.brands.skipped++;
        continue;
      }

      try {
        if (existingBrandSlugs.has(brand.slug)) {
          await db.brandDB.update({
            where: { slug: brand.slug },
            data: {
              name: brand.name,
              logo: brand.logo,
              description: brand.description,
              founded: brand.founded || null,
              headquarters: brand.headquarters || null,
              website: brand.website || null,
              categories: JSON.stringify(brand.categories || []),
              productCount: brand.productCount,
            },
          });
        } else {
          await db.brandDB.create({
            data: {
              slug: brand.slug,
              name: brand.name,
              logo: brand.logo,
              description: brand.description,
              founded: brand.founded || null,
              headquarters: brand.headquarters || null,
              website: brand.website || null,
              categories: JSON.stringify(brand.categories || []),
              productCount: brand.productCount,
            },
          });
        }
        result.brands.seeded++;
      } catch (error) {
        console.error(`Error seeding brand ${brand.slug}:`, error);
        result.brands.errors++;
      }
    }

    // Seed products
    const existingProducts = await db.product.findMany();
    const existingProductSlugs = new Set(existingProducts.map((p) => p.slug));

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
          publishedAt: product.publishedAt ? new Date(product.publishedAt) : new Date(),
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
      }
    }

    return NextResponse.json({
      message: 'Seed completed',
      result,
      totalSeeded: result.products.seeded + result.categories.seeded + result.brands.seeded,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
