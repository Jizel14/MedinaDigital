import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Locale } from '@medina/shared-types';
import { Container, Tag, Divider, StarOrnament } from '@medina/ui';
import {
  ArtisanQuote,
  PriceDisplay,
  ProductCard,
  RegionTag,
  TrustTagBadge,
} from '@medina/product-components';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import {
  getAllProducts,
  getProductBySlug,
  getArtisanById,
  getRegionBySlug,
  getRelatedProducts,
} from '@/lib/data';
import { ProductGallery } from '@/components/product/product-gallery';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title[locale],
    description: product.descriptionShort[locale],
    openGraph: {
      images: product.photos.length > 0 ? [product.photos[0]!] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [artisan, region, related, t] = await Promise.all([
    getArtisanById(product.artisanId),
    getRegionBySlug(product.region),
    getRelatedProducts(product.id, 4),
    getTranslations({ locale }),
  ]);

  if (!artisan || !region) notFound();

  // Pre-resolve regions for related products (can't await inside .map JSX).
  const relatedWithRegions = await Promise.all(
    related.map(async (p) => ({ product: p, region: await getRegionBySlug(p.region) })),
  );

  const totalMaterialPct = product.materials.reduce((s, m) => s + m.percentage, 0);

  return (
    <main>
      <Container size="lg" className="py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[color:var(--color-muted)]">
          <Link href="/search" className="hover:text-[color:var(--color-clay-700)]">
            {t('search.title')}
          </Link>
          <span aria-hidden> · </span>
          <Link
            href={{ pathname: '/search', query: { category: product.category } }}
            className="hover:text-[color:var(--color-clay-700)]"
          >
            {t(`nav.${product.category}` as 'nav.ceramics')}
          </Link>
        </nav>

        <div className="grid gap-12 md:grid-cols-2">
          <ProductGallery photos={product.photos} alt={product.title[locale]} />

          <div>
            <RegionTag region={region} locale={locale} />
            <h1
              className="mt-2 italic"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-4xl)',
                lineHeight: 1.05,
                color: 'var(--color-ink-900)',
              }}
            >
              {product.title[locale]}
            </h1>
            <p className="mt-3 text-[color:var(--color-ink-700)]">
              {product.descriptionShort[locale]}
            </p>

            <div className="mt-8 flex items-center gap-6">
              <PriceDisplay
                priceEur={product.priceEur}
                priceTnd={product.priceTnd}
                locale={locale}
                size="lg"
                showBoth
              />
              <TrustTagBadge trusttagId={product.trusttagId} locale={locale} variant="detailed" />
            </div>

            <Divider className="my-10" />

            <section>
              <h2 className="mb-3 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                {t('product.story')}
              </h2>
              <p className="leading-relaxed text-[color:var(--color-ink-900)]">
                {product.story[locale]}
              </p>
              <p className="mt-6 leading-relaxed text-[color:var(--color-ink-700)]">
                {product.descriptionLong[locale]}
              </p>
            </section>

            <Divider className="my-10" />

            <section>
              <h2 className="mb-4 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                {t('product.materials')}
              </h2>
              <ul className="space-y-2">
                {product.materials.map((m, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4">
                    <span className="italic [font-family:var(--font-display)]">
                      {m.name[locale]}
                    </span>
                    <span className="font-semibold text-[color:var(--color-clay-700)] tabular-nums">
                      {m.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[color:var(--color-muted)]">Σ {totalMaterialPct}%</p>
            </section>

            <Divider className="my-10" />

            <section className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="mb-1 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  {t('product.dimensions')}
                </p>
                <p className="font-medium">
                  {product.dimensions.lengthCm} × {product.dimensions.widthCm} ×{' '}
                  {product.dimensions.heightCm} cm
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  {t('product.weight')}
                </p>
                <p className="font-medium">{product.weightG} g</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  {t('product.origin')}
                </p>
                <p className="font-medium">{region.name[locale]}, TN</p>
              </div>
            </section>

            {product.customRequest && (
              <div className="mt-10">
                <Tag tone="olive">
                  <StarOrnament size={9} /> Custom request
                </Tag>
              </div>
            )}
          </div>
        </div>
      </Container>

      <Divider />

      <Container size="lg" className="pb-16">
        <ArtisanQuote
          artisan={artisan}
          region={region}
          locale={locale}
          href={`/${locale}/artisans/${artisan.slug}`}
        />
      </Container>

      {related.length > 0 && (
        <Container size="lg" className="pb-20">
          <h2 className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
            <StarOrnament size={11} className="text-[color:var(--color-clay-600)]" />
            {t('product.related')}
          </h2>
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {relatedWithRegions.map(({ product: p, region: r }) =>
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
      )}
    </main>
  );
}
