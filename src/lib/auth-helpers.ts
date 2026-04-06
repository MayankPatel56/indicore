import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export function getToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.replace('Bearer ', '');
}

export async function getAuthUser(request: NextRequest) {
  const token = getToken(request);
  if (!token) return null;
  const user = await db.user.findUnique({ where: { id: token } });
  if (!user) return null;
  return user;
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return { error: 'Unauthorized', status: 401 };
  return { user };
}

export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth;
  if (auth.user.role !== 'admin') return { error: 'Forbidden', status: 403 };
  return { user: auth.user };
}
