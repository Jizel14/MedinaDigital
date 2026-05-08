import 'server-only';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, REFRESH_COOKIE, apiUrl } from './config';

export interface ApiResponse<T> {
  status: number;
  ok: boolean;
  data: T | null;
  error: { code?: string; message?: string } | null;
}

/**
 * Server-side fetch helper for the SaaS API.
 *
 * - Reads the access token from the httpOnly cookie set by /api/auth/login.
 * - On 401, attempts a single refresh round-trip; if the refresh succeeds,
 *   retries the original request once. If it fails, surfaces the 401 to the
 *   caller — the caller (often a server action or page) is responsible for
 *   redirecting to /login.
 *
 * Cookies set by a successful refresh round-trip CAN'T be persisted from a
 * server component (Next.js disallows mutating cookies in RSC). The proxy
 * routes under /api/auth/* are responsible for cookie writes — server pages
 * should redirect to /login when refresh fails rather than silently retrying
 * forever.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const c = await cookies();
  const access = c.get(ACCESS_COOKIE)?.value;
  const headers = new Headers(init.headers);
  if (access) headers.set('Authorization', `Bearer ${access}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${apiUrl()}${path}`, { ...init, headers, cache: 'no-store' });
  if (res.status === 204) {
    return { status: 204, ok: true, data: null, error: null };
  }
  const json = (await res.json().catch(() => null)) as
    | (T & { code?: string; message?: string })
    | null;
  if (res.ok) {
    return { status: res.status, ok: true, data: json as T, error: null };
  }
  return {
    status: res.status,
    ok: false,
    data: null,
    error: { code: json?.code, message: json?.message },
  };
}

/**
 * Returns the current user + profile by calling GET /api/auth/me, or null if
 * not signed in. Use this in server pages/layouts to gate dashboard access.
 */
export async function currentUser(): Promise<{
  user: { id: string; email: string; role: 'artisan' | 'pme_owner' };
  profile: Record<string, unknown> | null;
} | null> {
  const c = await cookies();
  if (!c.get(ACCESS_COOKIE)?.value && !c.get(REFRESH_COOKIE)?.value) return null;

  const res = await apiFetch<{
    user: { id: string; email: string; role: 'artisan' | 'pme_owner' };
    profile: Record<string, unknown> | null;
  }>('/api/auth/me');
  if (!res.ok || !res.data) return null;
  return res.data;
}
