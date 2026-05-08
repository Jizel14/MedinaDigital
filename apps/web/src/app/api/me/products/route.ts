import { NextRequest } from 'next/server';
import { proxyMutation } from '@/lib/auth/proxy';

export async function GET() {
  return proxyMutation('/api/me/products', { method: 'GET' });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyMutation('/api/me/products', { method: 'POST', body });
}
