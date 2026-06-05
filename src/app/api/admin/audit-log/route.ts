import { NextRequest, NextResponse } from 'next/server';
import { adminSecurity } from '@/lib/admin-security';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP.trim();
  return 'unknown';
}

export async function GET(request: NextRequest) {
  try {
    // Validate session first
    const cookieToken = request.cookies.get('gs_admin_token')?.value;
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token');
    const effectiveToken = queryToken || cookieToken;

    if (!effectiveToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = getClientIP(request);
    const result = adminSecurity.validateSession(effectiveToken, ip);

    if (!result.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = parseInt(url.searchParams.get('limit') || '50');
    const logs = adminSecurity.getAuditLog(limit);

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
