import 'server-only';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, apiUrl } from './config';

/**
 * Proxy a browser request through to the NestJS API with the access token
 * attached from the httpOnly cookie. Returns a NextResponse mirroring the
 * upstream status + body. 204 returns are passed through cleanly.
 */
export async function proxyMutation(
  path: string,
  init: { method: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: string },
): Promise<NextResponse> {
  const c = await cookies();
  const access = c.get(ACCESS_COOKIE)?.value;
  const headers: Record<string, string> = {};
  if (init.body) headers['Content-Type'] = 'application/json';
  if (access) headers['Authorization'] = `Bearer ${access}`;

  const upstream = await fetch(`${apiUrl()}${path}`, {
    method: init.method,
    headers,
    body: init.body,
    cache: 'no-store',
  });

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  const text = await upstream.text();
  const json = text ? JSON.parse(text) : null;
  return NextResponse.json(json, { status: upstream.status });
}
