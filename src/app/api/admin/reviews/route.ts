import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const reviews = await db.review.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Fetch product names for each review
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const product = await db.product.findUnique({
          where: { id: review.productId },
          select: { name: true },
        });
        return {
          ...review,
          productName: product?.name,
        };
      })
    );

    return NextResponse.json({ reviews: enrichedReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
