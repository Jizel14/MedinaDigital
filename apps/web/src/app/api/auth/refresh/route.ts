import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { REFRESH_COOKIE, apiUrl } from '@/lib/auth/config';
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies';

/**
 * Browser-callable refresh route. Reads the httpOnly refresh cookie, sends it
 * to NestJS, and writes back the rotated token pair as cookies. The browser
 * never sees the raw tokens.
 */
export async function POST() {
  const c = await cookies();
  const refresh = c.get(REFRESH_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ code: 'REFRESH_REVOKED' }, { status: 401 });
  }
  const upstream = await fetch(`${apiUrl()}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
    cache: 'no-store',
  });
  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    const fail = NextResponse.json(data, { status: upstream.status });
    clearAuthCookies(fail);
    return fail;
  }
  const { accessToken, refreshToken } = data ?? {};
  const res = NextResponse.json({ ok: true });
  if (accessToken && refreshToken) setAuthCookies(res, { accessToken, refreshToken });
  return res;
}
