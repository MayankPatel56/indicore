import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;

    // Find the review to get product ID
    const review = await db.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Delete the review
    await db.review.delete({
      where: { id },
    });

    // Recalculate product rating and review count
    const reviews = await db.review.findMany({
      where: { productId: review.productId },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await db.product.update({
      where: { id: review.productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      },
    });

    return NextResponse.json({
      message: 'Review deleted successfully',
      productRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
