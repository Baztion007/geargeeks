import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminSecurity } from '@/lib/admin-security';

// Rate limiting: max 3 messages per IP per hour (kept in-memory for perf)
const contactRateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_MESSAGES_PER_HOUR = 3;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP.trim();
  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = contactRateLimit.get(ip);

  if (!record || record.resetAt < now) {
    contactRateLimit.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (record.count >= MAX_MESSAGES_PER_HOUR) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = getClientIP(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please try again later.' },
        { status: 429 }
      );
    }

    // Store message in the database
    await db.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: (subject || '').trim(),
        message: message.trim(),
        ipAddress: ip,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We\'ll get back to you as soon as possible.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// GET endpoint for admin to retrieve messages (protected by admin session)
export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    const cookieToken = request.cookies.get('gs_admin_token')?.value;
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token');
    const effectiveToken = queryToken || cookieToken;

    if (!effectiveToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : realIP?.trim()) || 'unknown';
    const result = await adminSecurity.validateSession(effectiveToken, ip);

    if (!result.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Fetch messages from database, newest first
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const total = await db.contactMessage.count();

    // Don't expose IPs via API
    const safeMessages = messages.map(({ ipAddress, ...rest }) => rest);

    return NextResponse.json({
      messages: safeMessages,
      total,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// PATCH endpoint to mark a message as read/unread
export async function PATCH(request: NextRequest) {
  try {
    // Validate admin session
    const cookieToken = request.cookies.get('gs_admin_token')?.value;
    if (!cookieToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : realIP?.trim()) || 'unknown';
    const authResult = await adminSecurity.validateSession(cookieToken, ip);
    if (!authResult.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const updated = await db.contactMessage.update({
      where: { id },
      data: { isRead: isRead === undefined ? true : isRead },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// DELETE endpoint to remove a message
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin session
    const cookieToken = request.cookies.get('gs_admin_token')?.value;
    if (!cookieToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : realIP?.trim()) || 'unknown';
    const authResult = await adminSecurity.validateSession(cookieToken, ip);
    if (!authResult.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    await db.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
