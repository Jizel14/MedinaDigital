import { NextRequest } from 'next/server';
import { proxyMutation } from '@/lib/auth/proxy';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyMutation(`/api/me/products/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.text();
  return proxyMutation(`/api/me/products/${encodeURIComponent(id)}`, { method: 'PATCH', body });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyMutation(`/api/me/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
