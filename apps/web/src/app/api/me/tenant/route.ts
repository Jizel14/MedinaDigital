import { NextRequest } from 'next/server';
import { proxyMutation } from '@/lib/auth/proxy';

export async function GET() {
  return proxyMutation('/api/me/tenant', { method: 'GET' });
}

export async function PATCH(req: NextRequest) {
  const body = await req.text();
  return proxyMutation('/api/me/tenant', { method: 'PATCH', body });
}
