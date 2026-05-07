'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Locale, Product, Region } from '@medina/shared-types';
import { ProductCard } from '@medina/product-components';

export interface ResultsGridProps {
  products: Product[];
  regionsBySlug: Record<string, Region>;
  locale: Locale;
}

/**
 * Filters & sorts the product list reactively from URL params. Read-only —
 * filter state lives in the URL and is owned by SearchFilters.
 */
export function ResultsGrid({ products, regionsBySlug, locale }: ResultsGridProps) {
  const sp = useSearchParams();
  const t = useTranslations();

  const filtered = useMemo(() => {
    const category = sp.get('category');
    const region = sp.get('region');
    const sort = sp.get('sort') ?? 'newest';

    let out = products;
    if (category) out = out.filter((p) => p.category === category);
    if (region) out = out.filter((p) => p.region === region);

    switch (sort) {
      case 'price-asc':
        out = [...out].sort((a, b) => a.priceEur - b.priceEur);
        break;
      case 'price-desc':
        out = [...out].sort((a, b) => b.priceEur - a.priceEur);
        break;
      default:
        out = [...out].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    }
    return out;
  }, [sp, products]);

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[color:var(--color-muted)] italic [font-family:var(--font-display)]">
          {t('search.noResults')}
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
        {t('search.resultsCount', { count: filtered.length })}
      </p>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const region = regionsBySlug[p.region];
          if (!region) return null;
          return (
            <li key={p.id}>
              <ProductCard
                product={p}
                region={region}
                locale={locale}
                href={`/${locale}/products/${p.slug}`}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
