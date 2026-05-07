import { getTranslations } from 'next-intl/server';
import type { Locale, Product, Region } from '@medina/shared-types';
import { Container, StarOrnament } from '@medina/ui';
import { ProductCard } from '@medina/product-components';
import { Link } from '@/i18n/navigation';

export interface FeaturedProductsProps {
  products: Product[];
  regionsBySlug: Record<string, Region>;
  locale: Locale;
}

export async function FeaturedProducts({ products, regionsBySlug, locale }: FeaturedProductsProps) {
  const t = await getTranslations({ locale });

  return (
    <section aria-labelledby="featured-heading">
      <Container size="lg" className="py-20 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              <StarOrnament size={11} className="text-[color:var(--color-clay-600)]" />
              {t('home.featuredTitle')}
            </p>
            <h2
              id="featured-heading"
              className="italic"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-3xl)',
                color: 'var(--color-ink-900)',
              }}
            >
              {t('home.featuredTitle')}
            </h2>
          </div>
          <Link
            href="/search"
            className="hidden text-sm italic [font-family:var(--font-display)] font-semibold border-b border-[color:var(--color-ink-900)] pb-0.5 hover:text-[color:var(--color-clay-700)] hover:border-[color:var(--color-clay-700)] transition-colors duration-[var(--duration-fast)] md:inline-block"
          >
            {t('common.viewAll')}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {products.map((p) => {
            const region = regionsBySlug[p.region];
            if (!region) return null;
            return (
              <ProductCard
                key={p.id}
                product={p}
                region={region}
                locale={locale}
                href={`/${locale}/products/${p.slug}`}
              />
            );
          })}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/search"
            className="inline-block text-sm italic [font-family:var(--font-display)] font-semibold border-b border-[color:var(--color-ink-900)] pb-0.5"
          >
            {t('common.viewAll')}
          </Link>
        </div>
      </Container>
    </section>
  );
}
