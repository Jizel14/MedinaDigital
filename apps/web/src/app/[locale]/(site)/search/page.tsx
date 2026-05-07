import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Locale, Region } from '@medina/shared-types';
import { Container, StarOrnament } from '@medina/ui';
import { routing } from '@/i18n/routing';
import { getAllProducts, getCategories, getRegions } from '@/lib/data';
import { SearchFilters } from '@/components/search/search-filters';
import { ResultsGrid } from '@/components/search/results-grid';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'search' });
  return { title: t('title') };
}

export default async function SearchPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [products, categories, regions] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getRegions(),
  ]);

  const regionsBySlug = regions.reduce<Record<string, Region>>((acc, r) => {
    acc[r.slug] = r;
    return acc;
  }, {});

  const t = await getTranslations({ locale, namespace: 'search' });

  return (
    <main>
      <Container size="lg" className="py-16">
        <header className="mb-12">
          <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
            <StarOrnament size={11} className="text-[color:var(--color-clay-600)]" />
            Médina Digital
          </p>
          <h1
            className="italic"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-4xl)',
              color: 'var(--color-clay-700)',
              letterSpacing: 'var(--tracking-display)',
            }}
          >
            {t('title')}
          </h1>
        </header>

        <div className="grid gap-12 md:grid-cols-[220px_1fr]">
          <SearchFilters categories={categories} regions={regions} locale={locale} />
          <div>
            <ResultsGrid products={products} regionsBySlug={regionsBySlug} locale={locale} />
          </div>
        </div>
      </Container>
    </main>
  );
}
