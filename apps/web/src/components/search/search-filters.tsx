'use client';

import { useTransition, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Category, Region, Locale, CategorySlug, RegionSlug } from '@medina/shared-types';
import {
  cn,
  StarOrnament,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@medina/ui';

export interface SearchFiltersProps {
  categories: Category[];
  regions: Region[];
  locale: Locale;
}

const ALL = '__all__';

/**
 * Filter sidebar for /search. State is held in URL params (`category`, `region`,
 * `sort`) so links are shareable, back works, and SSG remains compatible —
 * the actual filtering happens client-side over the SSG-rendered grid.
 */
export function SearchFilters({ categories, regions, locale }: SearchFiltersProps) {
  const t = useTranslations();
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const currentCategory = sp.get('category') ?? ALL;
  const currentRegion = sp.get('region') ?? ALL;
  const currentSort = sp.get('sort') ?? 'newest';

  const setParam = useCallback(
    (key: 'category' | 'region' | 'sort', value: string) => {
      const next = new URLSearchParams(sp.toString());
      if (value === ALL || (key === 'sort' && value === 'newest')) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      });
    },
    [sp, router, pathname],
  );

  const reset = () => {
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  const hasActive = currentCategory !== ALL || currentRegion !== ALL || currentSort !== 'newest';

  return (
    <aside aria-label={t('search.filters')} className="sticky top-24 self-start space-y-6 text-sm">
      <div className="flex items-center gap-2">
        <StarOrnament size={11} className="text-[color:var(--color-clay-600)]" />
        <h2 className="text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          {t('search.filters')}
        </h2>
        {hasActive && (
          <button
            type="button"
            onClick={reset}
            className="ms-auto text-xs italic [font-family:var(--font-display)] font-semibold text-[color:var(--color-clay-700)] hover:underline"
          >
            ×
          </button>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          {t('search.category')}
        </label>
        <SelectRoot value={currentCategory} onValueChange={(v) => setParam('category', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>—</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug as CategorySlug}>
                {c.name[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          {t('search.region')}
        </label>
        <SelectRoot value={currentRegion} onValueChange={(v) => setParam('region', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>—</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r.slug} value={r.slug as RegionSlug}>
                {r.name[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          {t('search.sort')}
        </label>
        <SelectRoot value={currentSort} onValueChange={(v) => setParam('sort', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('search.sortNewest')}</SelectItem>
            <SelectItem value="price-asc">{t('search.sortPriceAsc')}</SelectItem>
            <SelectItem value="price-desc">{t('search.sortPriceDesc')}</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>
    </aside>
  );
}

/** Re-export so SearchPage can re-derive filters from URL. */
export const SEARCH_PARAM_NAMES = ['category', 'region', 'sort'] as const;
