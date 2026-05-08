import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, apiUrl } from '@/lib/auth/config';
import { clearAuthCookies } from '@/lib/auth/cookies';

export async function POST() {
  const c = await cookies();
  const access = c.get(ACCESS_COOKIE)?.value;
  if (access) {
    await fetch(`${apiUrl()}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access}` },
      cache: 'no-store',
    }).catch(() => null);
  }
  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
