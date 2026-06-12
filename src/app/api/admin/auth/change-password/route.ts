import { NextRequest, NextResponse } from 'next/server';
import { adminSecurity } from '@/lib/admin-security';

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
    const { currentPassword, newPassword, token } = body;

    if (!currentPassword || !newPassword || !token) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate the admin session first
    const ip = getClientIP(request);
    const sessionCheck = await adminSecurity.validateSession(token, ip);
    if (!sessionCheck.valid) {
      return NextResponse.json(
        { success: false, error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const result = adminSecurity.changePassword(currentPassword, newPassword, ip);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
