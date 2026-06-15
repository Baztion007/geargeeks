import { NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/db';

// GET /api/health — Check database connectivity and status
export async function GET() {
  const checks: Record<string, { status: string; details?: string; count?: number; latencyMs?: number }> = {};

  // Check environment variables
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  const hasAuthToken = !!process.env.DATABASE_AUTH_TOKEN;
  const nodeEnv = process.env.NODE_ENV || 'NOT SET';
  const isFileDb = dbUrl.startsWith('file:');
  const isTurso = !isFileDb && dbUrl !== 'NOT SET';

  // Mask the URL for security
  const maskedUrl = isFileDb
    ? dbUrl
    : dbUrl === 'NOT SET'
      ? 'NOT SET'
      : dbUrl.substring(0, 35) + '...';

  checks['env'] = {
    status: dbUrl === 'NOT SET' ? 'error' : 'ok',
    details: `DATABASE_URL: ${maskedUrl} (${isFileDb ? 'local SQLite' : isTurso ? 'Turso remote' : 'unknown'}), AUTH_TOKEN: ${hasAuthToken ? 'set' : 'NOT SET'}, NODE_ENV: ${nodeEnv}`,
  };

  // Test actual database connection
  const connTest = await testConnection();
  checks['connection'] = {
    status: connTest.ok ? 'ok' : 'error',
    details: connTest.ok
      ? `Connected successfully${connTest.latencyMs ? ` (${connTest.latencyMs}ms)` : ''}`
      : `Connection failed: ${connTest.error}`,
    latencyMs: connTest.latencyMs,
  };

  // Check data counts (only if connection is ok)
  if (connTest.ok) {
    try {
      const productCount = await db.product.count();
      checks['products'] = { status: productCount > 0 ? 'ok' : 'warning', count: productCount, details: productCount === 0 ? 'No products — database may need seeding' : undefined };
    } catch (error) {
      checks['products'] = {
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    try {
      const categoryCount = await db.categoryDB.count();
      checks['categories'] = { status: categoryCount > 0 ? 'ok' : 'warning', count: categoryCount };
    } catch (error) {
      checks['categories'] = {
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    try {
      const brandCount = await db.brandDB.count();
      checks['brands'] = { status: brandCount > 0 ? 'ok' : 'warning', count: brandCount };
    } catch (error) {
      checks['brands'] = {
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    try {
      const blogCount = await db.blogPost.count();
      checks['blogPosts'] = { status: blogCount > 0 ? 'ok' : 'warning', count: blogCount };
    } catch (error) {
      checks['blogPosts'] = {
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const hasWarnings = Object.values(checks).some((c) => c.status === 'warning');

  return NextResponse.json({
    status: allOk ? 'healthy' : hasWarnings ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  }, { status: allOk || hasWarnings ? 200 : 503, headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
