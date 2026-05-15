import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch reviews for the product
    const reviews = await db.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rating, userName, comment } = body;

    // Validate input
    if (!rating || !userName || !comment) {
      return NextResponse.json(
        { error: 'Rating, name, and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create review
    const review = await db.review.create({
      data: {
        productId: id,
        userName: userName.trim(),
        rating: Math.round(rating),
        comment: comment.trim(),
      },
    });

    // Recalculate product rating and review count
    const allReviews = await db.review.findMany({
      where: { productId: id },
    });

    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    await db.product.update({
      where: { id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({
      review: {
        id: review.id,
        productId: review.productId,
        userId: review.userId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      },
      productRating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
