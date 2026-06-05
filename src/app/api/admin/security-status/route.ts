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
    const ip = getClientIP(request);
    const loginStatus = adminSecurity.getLoginStatus(ip);
    const ipAllowed = adminSecurity.isIPAllowed(ip);

    return NextResponse.json({
      ip,
      ipAllowed,
      loginAttempts: loginStatus.attempts,
      locked: loginStatus.locked,
      lockoutRemainingMs: loginStatus.remainingMs,
      maxAttempts: 5,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
