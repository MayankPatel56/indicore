import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { items, address, paymentMethod, couponCode } = await request.json();

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 });
    }

    // Validate products and calculate totals
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 400 });
    }

    // Check stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product?.name || 'product'}` },
          { status: 400 }
        );
      }
    }

    let subtotal = 0;
    const orderItemsData = items.map((item: { productId: string; quantity: number }) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      return {
        productId: product.id,
        productName: product.name,
        productImage: JSON.parse(product.images)[0] || '',
        quantity: item.quantity,
        price: product.price,
      };
    });

    // Calculate discount
    let discount = 0;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.active) {
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          // expired
        } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          // exceeded
        } else if (coupon.minOrder && subtotal < coupon.minOrder) {
          // below min order
        } else {
          if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.discount) / 100;
          } else {
            discount = coupon.discount;
          }
          await db.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const shipping = subtotal >= 999 ? 0 : 99;
    const total = Math.max(0, subtotal - discount + shipping);

    // Generate order number
    const orderNumber = 'LC' + Date.now().toString(36).toUpperCase();

    // Create order with items in a transaction-like sequence
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: auth.user.id,
        status: 'pending',
        total,
        subtotal,
        discount,
        shipping,
        addressSnapshot: JSON.stringify(address),
        paymentMethod,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    // Decrease stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        addressSnapshot: order.addressSnapshot,
        paymentMethod: order.paymentMethod,
        items: order.items.map((i) => ({
          id: i.id,
          orderId: i.orderId,
          productId: i.productId,
          productName: i.productName,
          productImage: i.productImage,
          quantity: i.quantity,
          price: i.price,
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.orderNumber = { contains: search };

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { items: true, user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId,
        user: o.user,
        status: o.status,
        total: o.total,
        subtotal: o.subtotal,
        discount: o.discount,
        shipping: o.shipping,
        addressSnapshot: o.addressSnapshot,
        paymentMethod: o.paymentMethod,
        items: o.items.map((i) => ({
          id: i.id,
          orderId: i.orderId,
          productId: i.productId,
          productName: i.productName,
          productImage: i.productImage,
          quantity: i.quantity,
          price: i.price,
        })),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
