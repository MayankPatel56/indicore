import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { userId: token },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId,
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
      }))
    );
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
