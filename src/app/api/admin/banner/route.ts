import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const banner = await db.banner.findFirst({ where: { active: true } });

    return NextResponse.json(banner || { id: '', text: '', active: false, link: null, createdAt: '', updatedAt: '' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { text, active, link } = await request.json();

    // Get the first banner or create one
    const existing = await db.banner.findFirst();
    let banner;

    if (existing) {
      banner = await db.banner.update({
        where: { id: existing.id },
        data: {
          ...(text !== undefined ? { text } : {}),
          ...(active !== undefined ? { active } : {}),
          ...(link !== undefined ? { link } : {}),
        },
      });
    } else {
      banner = await db.banner.create({
        data: {
          text: text || '',
          active: active ?? true,
          link: link || null,
        },
      });
    }

    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
