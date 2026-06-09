import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'edge';

// GET /api/reviews?productSlug=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get('productSlug');

  if (!productSlug) {
    return NextResponse.json(
      { error: 'productSlug query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const reviews = await db.userReview.findMany({
      where: { productSlug },
      orderBy: [{ helpful: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productSlug, author, rating, title, content, pros, cons } = body;

    if (!productSlug || !author || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: productSlug, author, rating, title, content' },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    if (author.trim().length < 2 || author.trim().length > 100) {
      return NextResponse.json(
        { error: 'Author name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (title.trim().length < 3 || title.trim().length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 200 characters' },
        { status: 400 }
      );
    }

    if (content.trim().length < 10 || content.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Content must be between 10 and 5000 characters' },
        { status: 400 }
      );
    }

    const review = await db.userReview.create({
      data: {
        productSlug,
        author: author.trim(),
        rating: ratingNum,
        title: title.trim(),
        content: content.trim(),
        pros: pros?.trim() || null,
        cons: cons?.trim() || null,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews/helpful - Mark a review as helpful
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId is required' },
        { status: 400 }
      );
    }

    const review = await db.userReview.update({
      where: { id: reviewId },
      data: { helpful: { increment: 1 } },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error updating review helpfulness:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
