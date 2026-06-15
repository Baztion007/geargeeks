import { NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/db';

/**
 * GET /api/debug — Comprehensive diagnostic endpoint for debugging Cloudflare deployment issues.
 * This endpoint shows detailed information about:
 * - Environment configuration
 * - Database connection status
 * - Table existence and schema
 * - Data counts
 * - Auto-seed status
 *
 * This is intentionally verbose to help diagnose issues on Cloudflare Workers.
 */
export async function GET() {
  const info: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    runtime: typeof process !== 'undefined' ? 'node' : 'edge',
    nodeEnv: process.env.NODE_ENV,
  };

  // ─── Environment Variables ──────────────────────────────────────
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  const hasAuthToken = !!process.env.DATABASE_AUTH_TOKEN;
  const isFileDb = dbUrl.startsWith('file:');
  const isTurso = !isFileDb && dbUrl !== 'NOT SET';

  info['env'] = {
    DATABASE_URL: dbUrl === 'NOT SET' ? 'NOT SET' : (isFileDb ? dbUrl : dbUrl.substring(0, 40) + '...'),
    DATABASE_URL_type: isFileDb ? 'local SQLite file' : isTurso ? 'Turso remote' : 'unknown',
    DATABASE_AUTH_TOKEN: hasAuthToken ? 'set (hidden)' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  };

  // ─── Database Connection Test ───────────────────────────────────
  const connTest = await testConnection();
  info['connection'] = {
    ok: connTest.ok,
    url: connTest.url,
    latencyMs: connTest.latencyMs,
    error: connTest.error,
  };

  if (!connTest.ok) {
    // Can't do anything else if connection fails
    return NextResponse.json(info, { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }

  // ─── Table Existence Check ──────────────────────────────────────
  const tables = ['Product', 'CategoryDB', 'BrandDB', 'BlogPost', 'contact_messages',
    'NewsletterSubscriber', 'UserReview', 'PriceAlert', 'AffiliateMerchantConfig',
    'AffiliateGlobalSettings'];

  const tableStatus: Record<string, unknown> = {};
  for (const table of tables) {
    try {
      const result = await db.$queryRaw(`SELECT COUNT(*) as cnt FROM ${table}`);
      const count = Number((result as Record<string, unknown>[])[0]?.cnt ?? -1);
      tableStatus[table] = { exists: true, count };
    } catch (e) {
      tableStatus[table] = { exists: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
  info['tables'] = tableStatus;

  // ─── Product Schema Check ──────────────────────────────────────
  try {
    const sampleProduct = await db.product.findMany({ take: 1 });
    if (sampleProduct.length > 0) {
      const p = sampleProduct[0];
      info['productSchema'] = {
        columns: Object.keys(p),
        hasAffiliateUrl: 'affiliateUrl' in p,
        hasPriceUrl: 'priceUrl' in p,
        hasSubcategory: 'subcategory' in p,
        hasBestFor: 'bestFor' in p,
        hasSummary: 'summary' in p,
        hasFullReview: 'fullReview' in p,
        hasAsin: 'asin' in p,
        hasMerchant: 'merchant' in p,
        sampleSlug: p.slug,
      };
    } else {
      info['productSchema'] = { note: 'No products in database — cannot check schema' };
    }
  } catch (e) {
    info['productSchema'] = { error: e instanceof Error ? e.message : String(e) };
  }

  // ─── Data Summary ──────────────────────────────────────────────
  info['summary'] = {
    products: (tableStatus.Product as Record<string, unknown>)?.count ?? 'error',
    categories: (tableStatus.CategoryDB as Record<string, unknown>)?.count ?? 'error',
    brands: (tableStatus.BrandDB as Record<string, unknown>)?.count ?? 'error',
    blogPosts: (tableStatus.BlogPost as Record<string, unknown>)?.count ?? 'error',
  };

  return NextResponse.json(info, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
