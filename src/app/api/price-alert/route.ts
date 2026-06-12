import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productSlug, targetPrice } = body;

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!productSlug || typeof productSlug !== 'string') {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      );
    }

    if (!targetPrice || typeof targetPrice !== 'string') {
      return NextResponse.json(
        { error: 'Target price is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedSlug = productSlug.trim();

    // Validate email format
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate target price is a number
    const priceValue = parseFloat(targetPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(priceValue) || priceValue <= 0) {
      return NextResponse.json(
        { error: 'Please provide a valid target price' },
        { status: 400 }
      );
    }

    // Check for duplicate alert (same email + product)
    const existing = await db.priceAlert.findUnique({
      where: {
        email_productSlug: {
          email: trimmedEmail,
          productSlug: trimmedSlug,
        },
      },
    });

    if (existing) {
      // Update target price if alert already exists
      if (!existing.active) {
        await db.priceAlert.update({
          where: { id: existing.id as string },
          data: { active: 1, targetPrice },
        });
        return NextResponse.json(
          { message: 'Your price alert has been reactivated with the new target price.' },
          { status: 200 }
        );
      }
      // Update target price for existing active alert
      await db.priceAlert.update({
        where: { id: existing.id as string },
        data: { targetPrice },
      });
      return NextResponse.json(
        { message: 'Your price alert target has been updated.' },
        { status: 200 }
      );
    }

    // Create new price alert
    await db.priceAlert.create({
      data: {
        email: trimmedEmail,
        productSlug: trimmedSlug,
        targetPrice,
      },
    });

    return NextResponse.json(
      { message: 'Price alert created successfully! We\'ll notify you when the price drops.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Price alert creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const alerts = await db.priceAlert.findMany({
      where: {
        email: trimmedEmail,
        active: 1,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Price alert fetch error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
