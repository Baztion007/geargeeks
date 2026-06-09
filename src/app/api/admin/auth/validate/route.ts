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
    const body = await request.json();
    const { token } = body;
    const cookieToken = request.cookies.get('gs_admin_token')?.value;
    const effectiveToken = token || cookieToken;

    if (!effectiveToken || typeof effectiveToken !== 'string') {
      return NextResponse.json(
        { valid: false, reason: 'No token provided' },
        { status: 401 }
      );
    }

    const ip = getClientIP(request);
    const result = await adminSecurity.validateSession(effectiveToken, ip);

    if (result.valid) {
      const response = NextResponse.json({
        valid: true,
        refreshedToken: result.refreshedToken,
      });

      // Refresh the cookie too
      if (result.refreshedToken) {
        response.cookies.set('gs_admin_token', result.refreshedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 4 * 60 * 60,
          path: '/',
        });
      }

      return response;
    }

    // Clear invalid cookies
    const response = NextResponse.json(
      { valid: false, reason: result.reason },
      { status: 401 }
    );
    response.cookies.delete('gs_admin_token');
    return response;
  } catch {
    return NextResponse.json(
      { valid: false, reason: 'Invalid request' },
      { status: 400 }
    );
  }
}
