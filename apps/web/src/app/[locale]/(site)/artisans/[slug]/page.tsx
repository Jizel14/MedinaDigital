import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { Locale } from '@medina/shared-types';
import { Container, Divider, StarOrnament, ArchOrnament } from '@medina/ui';
import { ProductCard, RegionTag } from '@medina/product-components';
import { routing } from '@/i18n/routing';
import {
  getAllArtisans,
  getArtisanBySlug,
  getProductsByArtisan,
  getRegionBySlug,
} from '@/lib/data';

export async function generateStaticParams() {
  const artisans = await getAllArtisans();
  return routing.locales.flatMap((locale) => artisans.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const artisan = await getArtisanBySlug(slug);
  if (!artisan) return {};
  return {
    title: artisan.name,
    description: artisan.shortBio[locale],
    openGraph: { images: [artisan.portrait] },
  };
}

export default async function ArtisanPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const artisan = await getArtisanBySlug(slug);
  if (!artisan) notFound();

  const [region, products, t] = await Promise.all([
    getRegionBySlug(artisan.region),
    getProductsByArtisan(artisan.id),
    getTranslations({ locale }),
  ]);
  if (!region) notFound();

  // Pre-resolve regions for product cards.
  const productsWithRegions = await Promise.all(
    products.map(async (p) => ({ product: p, region: await getRegionBySlug(p.region) })),
  );

  return (
    <main>
      <Container size="lg" className="py-16">
        <div className="grid gap-12 md:grid-cols-[280px_1fr]">
          <div>
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[color:var(--color-clay-200)] [border-radius:var(--radius-sm)_var(--radius-sm)_var(--radius-xl)_var(--radius-sm)]">
              <Image
                src={artisan.portrait}
                alt={artisan.name}
                fill
                sizes="(max-width: 768px) 100vw, 280px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <RegionTag region={region} locale={locale} />
            <h1
              className="mt-2 italic"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-4xl)',
                color: 'var(--color-clay-700)',
              }}
            >
              {artisan.name}
            </h1>
            <p className="mt-2 text-sm uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {artisan.yearsOfPractice}{' '}
              {locale === 'fr'
                ? 'ans de métier'
                : locale === 'en'
                  ? 'years of practice'
                  : 'سنة في الصنعة'}
            </p>

            <div className="mt-8">
              <ArchOrnament size={36} className="text-[color:var(--color-clay-600)] mb-4" />
              <p className="leading-relaxed text-[color:var(--color-ink-900)] whitespace-pre-line">
                {artisan.story[locale]}
              </p>
            </div>
          </div>
        </div>
      </Container>

      <Divider />

      <Container size="lg" className="pb-20">
        <h2 className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          <StarOrnament size={11} className="text-[color:var(--color-clay-600)]" />
          {t('product.related')}
        </h2>
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {productsWithRegions.map(({ product: p, region: r }) =>
            r ? (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  region={r}
                  locale={locale}
                  href={`/${locale}/products/${p.slug}`}
                />
              </li>
            ) : null,
          )}
        </ul>
      </Container>
    </main>
  );
}
