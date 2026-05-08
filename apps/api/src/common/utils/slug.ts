/**
 * Tiny slugifier — accents stripped, lowercase, dashes only. Good enough for
 * artisan/tenant/product slugs. If a generated slug collides with an existing
 * one, callers append a numeric suffix via `appendSuffix` until unique.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Append "-N" suffix; if already suffixed, increment. */
export function appendSuffix(base: string, n: number): string {
  return `${base}-${n}`;
}

/** Pick the first slug that passes `isAvailable`, starting from base. */
export async function generateUniqueSlug(
  base: string,
  isAvailable: (s: string) => Promise<boolean>,
): Promise<string> {
  if (await isAvailable(base)) return base;
  for (let i = 2; i < 1000; i += 1) {
    const candidate = appendSuffix(base, i);
    if (await isAvailable(candidate)) return candidate;
  }
  throw new Error(`Could not find unique slug from "${base}" after 1000 tries`);
}
