import { NextResponse } from 'next/server';
import { testConnection, db } from '@/lib/db';
import { getLastAutoSeedError } from '@/lib/auto-seed';

/**
 * GET /api/db-status — Lightweight database connection status check.
 *
 * Returns a simple, structured response that the frontend can use to
 * determine if the database is reachable and has data.
 *
 * This is separate from /api/health and /api/debug — it's designed
 * for the frontend to call and show actionable error messages.
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  const hasAuthToken = !!process.env.DATABASE_AUTH_TOKEN;
  const isFileDb = dbUrl.startsWith('file:');
  const isTurso = !isFileDb && dbUrl !== 'NOT SET';

  // Test the actual connection
  const connTest = await testConnection();

  const status: Record<string, unknown> = {
    connected: connTest.ok,
    databaseType: isFileDb ? 'local' : isTurso ? 'turso' : 'unknown',
    latencyMs: connTest.latencyMs,
  };

  if (!connTest.ok) {
    // Connection failed — provide specific, actionable error info
    const errorMsg = connTest.error || 'Unknown error';
    const is401 = errorMsg.includes('401') || errorMsg.includes('Unauthorized');
    const is403 = errorMsg.includes('403') || errorMsg.includes('Forbidden');
    const isNetwork = errorMsg.includes('ECONNREFUSED') || errorMsg.includes('fetch failed') ||
      errorMsg.includes('ENOTFOUND') || errorMsg.includes('timeout');

    status['error'] = errorMsg;
    status['errorType'] = is401 ? 'auth' : is403 ? 'forbidden' : isNetwork ? 'network' : 'unknown';
    status['autoSeedError'] = getLastAutoSeedError();

    if (is401 || is403) {
      status['action'] = 'update_token';
      status['instructions'] = isTurso
        ? 'The DATABASE_AUTH_TOKEN in Cloudflare Workers secrets does not match the Turso database token. Steps to fix: 1) Go to Turso dashboard → your database → Tokens → Create a new token. 2) Copy the token value. 3) Go to Cloudflare Dashboard → Workers & Pages → geargeekz → Settings → Variables and Secrets. 4) Update DATABASE_AUTH_TOKEN with the new token. 5) Redeploy the Worker.'
        : 'Database authentication failed. Check your DATABASE_URL and DATABASE_AUTH_TOKEN environment variables.';
      status['tokenStatus'] = hasAuthToken ? 'set_but_invalid' : 'not_set';
    } else if (isNetwork) {
      status['action'] = 'check_url';
      status['instructions'] = 'Cannot reach the database server. Check that DATABASE_URL is correct and the database server is running.';
    } else {
      status['action'] = 'check_config';
      status['instructions'] = 'Database connection failed with an unexpected error. Check DATABASE_URL and DATABASE_AUTH_TOKEN in your deployment environment.';
    }

    return NextResponse.json(status, {
      status: 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }

  // Connection is OK — check if we have data
  try {
    const productCount = await db.product.count();
    status['hasData'] = productCount > 0;
    status['productCount'] = productCount;

    if (productCount === 0) {
      status['action'] = 'seed';
      status['instructions'] = 'Database is connected but empty. The auto-seed should populate it on the next request, or visit /api/seed to seed manually.';
    }
  } catch (e) {
    status['hasData'] = false;
    status['dataError'] = e instanceof Error ? e.message : String(e);
    status['action'] = 'seed';
    status['instructions'] = 'Database is connected but tables may not exist. Try seeding the database.';
  }

  return NextResponse.json(status, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
