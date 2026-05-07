import type { MetadataRoute } from 'next';
import { LOCALES } from '@medina/shared-types';
import { getAllProducts, getAllArtisans } from '@/lib/data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, artisans] = await Promise.all([getAllProducts(), getAllArtisans()]);

  const staticPaths = ['', '/search', '/about'];
  const productPaths = products.map((p) => `/products/${p.slug}`);
  const artisanPaths = artisans.map((a) => `/artisans/${a.slug}`);
  const trustTagPaths = products.map((p) => `/t/${p.trusttagId}`);

  const allPaths = [...staticPaths, ...productPaths, ...artisanPaths, ...trustTagPaths];

  return allPaths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : path.startsWith('/products') ? 0.8 : 0.5,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])),
      },
    })),
  );
}
