/**
 * Centralised cookie/API config for SaaS auth.
 *
 * Tokens are kept in httpOnly cookies set by Next.js proxy routes. The browser
 * never sees them — JS in the browser cannot read them with document.cookie.
 */
export const ACCESS_COOKIE = 'medina_access';
export const REFRESH_COOKIE = 'medina_refresh';

export const ACCESS_COOKIE_MAX_AGE_S = 60 * 15; // 15 minutes (matches API JWT_ACCESS_TTL)
export const REFRESH_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

export function apiUrl(): string {
  return process.env.MEDINA_API_URL ?? 'http://localhost:4000';
}

export function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}
