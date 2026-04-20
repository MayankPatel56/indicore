import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await db.wishlist.findMany({
      where: { userId: token },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
            stock: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const safeParseImages = (images: string): string[] => {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    return NextResponse.json(
      wishlist
        .filter((w) => w.product) // skip wishlist items with deleted products
        .map((w) => ({
          id: w.id,
          userId: w.userId,
          productId: w.productId,
          createdAt: w.createdAt.toISOString(),
          product: {
            ...w.product!,
            images: safeParseImages(w.product!.images),
          },
        }))
    );
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Upsert - ignore if already wishlisted
    const wishlist = await db.wishlist.upsert({
      where: { userId_productId: { userId: token, productId } },
      create: { userId: token, productId },
      update: {},
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
            stock: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
    });

    let images: string[] = [];
    try {
      const parsed = JSON.parse(wishlist.product.images);
      images = Array.isArray(parsed) ? parsed : [];
    } catch {
      // ignore parse error
    }
    return NextResponse.json({
      id: wishlist.id,
      userId: wishlist.userId,
      productId: wishlist.productId,
      createdAt: wishlist.createdAt.toISOString(),
      product: { ...wishlist.product, images },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db.wishlist.deleteMany({
      where: { userId: token, productId },
    });

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
