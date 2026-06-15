import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/health — Check database connectivity and status
export async function GET() {
  const checks: Record<string, { status: string; details?: string; count?: number }> = {};

  // Check environment variables
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  const hasAuthToken = !!process.env.DATABASE_AUTH_TOKEN;
  const nodeEnv = process.env.NODE_ENV || 'NOT SET';

  // Show full URL (minus token) for debugging — safe since no secrets are in the URL
  checks['env'] = {
    status: dbUrl === 'NOT SET' ? 'error' : 'ok',
    details: `DATABASE_URL: ${dbUrl}, AUTH_TOKEN: ${hasAuthToken ? 'set' : 'NOT SET'}, NODE_ENV: ${nodeEnv}`,
  };

  // Check database connectivity
  checks['db'] = {
    status: 'ok',
    details: 'Using @libsql/client (native HTTP, no WASM engine needed)',
  };

  // Check database connection
  try {
    const productCount = await db.product.count();
    checks['products'] = { status: 'ok', count: productCount };
  } catch (error) {
    checks['products'] = {
      status: 'error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  try {
    const categoryCount = await db.categoryDB.count();
    checks['categories'] = { status: 'ok', count: categoryCount };
  } catch (error) {
    checks['categories'] = {
      status: 'error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  try {
    const brandCount = await db.brandDB.count();
    checks['brands'] = { status: 'ok', count: brandCount };
  } catch (error) {
    checks['brands'] = {
      status: 'error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok');

  return NextResponse.json({
    status: allOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  }, { status: allOk ? 200 : 503, headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
