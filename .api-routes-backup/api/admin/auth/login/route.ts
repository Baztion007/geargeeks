import { NextRequest, NextResponse } from 'next/server';
import { adminSecurity } from '@/lib/admin-security';

function getClientIP(request: NextRequest): string {
  // Check common proxy headers first
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const ip = getClientIP(request);
    const result = await adminSecurity.login(password, ip);

    if (result.success) {
      const response = NextResponse.json({
        success: true,
        token: result.token,
      });

      // Set token as httpOnly cookie as well for defense in depth
      response.cookies.set('gs_admin_token', result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 60, // 4 hours
        path: '/',
      });

      return response;
    }

    const statusCode = result.lockoutRemainingMs ? 429 : 401;
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        lockoutRemainingMs: result.lockoutRemainingMs,
      },
      { status: statusCode }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
