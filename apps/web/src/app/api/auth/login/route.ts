import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '@/lib/auth/config';
import { setAuthCookies } from '@/lib/auth/cookies';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const upstream = await fetch(`${apiUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cache: 'no-store',
  });
  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }
  const { accessToken, refreshToken, ...rest } = data ?? {};
  const res = NextResponse.json(rest, { status: upstream.status });
  if (accessToken && refreshToken) setAuthCookies(res, { accessToken, refreshToken });
  return res;
}
