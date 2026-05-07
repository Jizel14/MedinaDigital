import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { Locale } from '@medina/shared-types';
import { Container, Divider, StarOrnament, Badge } from '@medina/ui';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getAllProducts, getTrustTagById, getProductBySlug, getRegionBySlug } from '@/lib/data';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return routing.locales.flatMap((locale) =>
    products.map((p) => ({ locale, trusttagId: p.trusttagId })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; trusttagId: string }>;
}): Promise<Metadata> {
  const { locale, trusttagId } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const tag = await getTrustTagById(trusttagId);
  if (!tag) return {};
  const t = await getTranslations({ locale, namespace: 'trusttag' });
  return { title: t('title') };
}

export default async function TrustTagPage({
  params,
}: {
  params: Promise<{ locale: Locale; trusttagId: string }>;
}) {
  const { locale, trusttagId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tag = await getTrustTagById(trusttagId);
  if (!tag) notFound();

  const products = await getAllProducts();
  const product = products.find((p) => p.trusttagId === trusttagId);
  if (!product) notFound();

  const [region, t] = await Promise.all([getRegionBySlug(tag.region), getTranslations({ locale })]);
  if (!region) notFound();

  const verifiedDate = new Date(tag.verifiedAt).toLocaleDateString(
    locale === 'ar-TN' ? 'fr-FR' : locale,
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <main>
      <Container size="md" className="py-16">
        {/* Header */}
        <header className="mb-12 text-center">
          <Badge tone="verified" className="mb-4">
            <StarOrnament size={10} />
            <span>{t('common.verified')}</span>
          </Badge>
          <p className="mb-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
            {t('trusttag.title')}
          </p>
          <h1
            className="italic"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-clay-700)',
            }}
          >
            {product.title[locale]}
          </h1>
          <p className="mt-3 text-sm text-[color:var(--color-muted)]">
            {t('trusttag.verifiedAt', { date: verifiedDate })}
          </p>
        </header>

        {/* Product hero */}
        <Link
          href={`/products/${product.slug}`}
          className="block focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[color:var(--color-clay-200)] [border-radius:var(--radius-sm)_var(--radius-sm)_var(--radius-xl)_var(--radius-sm)]">
            {product.photos[0] && (
              <Image
                src={product.photos[0]}
                alt={product.title[locale]}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                priority
              />
            )}
          </div>
        </Link>

        <Divider className="my-10" />

        {/* DPP grid */}
        <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-3">
          <div>
            <dt className="mb-1 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {t('product.origin')}
            </dt>
            <dd className="font-medium">
              {region.name[locale]}, {tag.countryOfOrigin}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {t('trusttag.carbonFootprint')}
            </dt>
            <dd className="font-medium tabular-nums">
              {tag.carbonFootprintKgCo2e != null
                ? `${tag.carbonFootprintKgCo2e} kg CO₂e`
                : t('trusttag.notMeasured')}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {t('trusttag.waterUsage')}
            </dt>
            <dd className="font-medium tabular-nums">
              {tag.waterUsageLiters != null
                ? `${tag.waterUsageLiters} L`
                : t('trusttag.notMeasured')}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {t('trusttag.energySource')}
            </dt>
            <dd className="font-medium capitalize">
              {tag.energySource ?? t('trusttag.notMeasured')}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {t('trusttag.lifetime')}
            </dt>
            <dd className="font-medium tabular-nums">
              {tag.expectedLifetimeYears != null
                ? `${tag.expectedLifetimeYears}+ y`
                : t('trusttag.notMeasured')}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              Batch
            </dt>
            <dd className="font-medium [font-family:var(--font-mono)] text-sm">
              {tag.batchId ?? '—'}
            </dd>
          </div>
        </dl>

        <Divider className="my-12" />

        {/* Materials */}
        <section>
          <h2 className="mb-4 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
            {t('product.materials')}
          </h2>
          <ul className="space-y-3">
            {tag.materials.map((m, i) => (
              <li key={i}>
                <div className="mb-1 flex items-baseline justify-between gap-4">
                  <span className="italic [font-family:var(--font-display)] font-semibold">
                    {m.name[locale]}
                  </span>
                  <span className="font-semibold text-[color:var(--color-clay-700)] tabular-nums">
                    {m.percentage}%
                  </span>
                </div>
                <div className="h-1 w-full bg-[color:var(--color-clay-200)]">
                  <div
                    className="h-full bg-[color:var(--color-clay-700)]"
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
                {m.origin && (
                  <p className="mt-1 text-xs text-[color:var(--color-muted)]">{m.origin}</p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <Divider className="my-12" />

        {/* Care + end-of-life */}
        <section className="space-y-8">
          <div>
            <h2 className="mb-3 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {t('trusttag.care')}
            </h2>
            <p className="leading-relaxed">{tag.careInstructions[locale]}</p>
          </div>

          {tag.repairOptions && (
            <div>
              <h2 className="mb-3 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                {t('trusttag.repair')}
              </h2>
              <p className="leading-relaxed">{tag.repairOptions[locale]}</p>
            </div>
          )}

          <div>
            <h2 className="mb-3 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {t('trusttag.endOfLife')}
            </h2>
            <p className="leading-relaxed">{tag.endOfLife[locale]}</p>
          </div>
        </section>

        {tag.certifications.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-3 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              Certifications
            </h2>
            <ul className="flex flex-wrap gap-2">
              {tag.certifications.map((c) => (
                <li
                  key={c}
                  className="inline-flex items-center gap-1.5 border border-[color:var(--color-border)] px-3 py-1 text-xs"
                >
                  <StarOrnament size={9} className="text-[color:var(--color-olive-700)]" />
                  {c}
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </main>
  );
}
