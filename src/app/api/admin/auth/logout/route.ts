import { NextRequest, NextResponse } from 'next/server';
import { adminSecurity } from '@/lib/admin-security';

export const runtime = 'edge';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP.trim();
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token } = body;
    const cookieToken = request.cookies.get('gs_admin_token')?.value;
    const effectiveToken = token || cookieToken;

    const ip = getClientIP(request);
    if (effectiveToken) {
      adminSecurity.logout(effectiveToken, ip);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('gs_admin_token');
    return response;
  } catch {
    return NextResponse.json({ success: true });
  }
}
