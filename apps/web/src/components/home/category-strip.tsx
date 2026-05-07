import { getTranslations } from 'next-intl/server';
import type { Category, Locale } from '@medina/shared-types';
import { Container, StarOrnament } from '@medina/ui';
import { Link } from '@/i18n/navigation';

const ICON_FOR: Record<Category['iconKey'], string> = {
  pottery: 'M6 18 V10 Q6 6 12 6 Q18 6 18 10 V18 Z',
  loom: 'M5 6 H19 V8 H5 Z M5 11 H19 V13 H5 Z M5 16 H19 V18 H5 Z',
  awl: 'M12 4 L14 12 L12 14 L10 12 Z M12 14 V20',
  gem: 'M12 4 L18 10 L12 20 L6 10 Z M6 10 H18',
  chisel: 'M12 4 V14 L9 18 H15 L12 14',
};

export interface CategoryStripProps {
  categories: Category[];
  locale: Locale;
}

export async function CategoryStrip({ categories, locale }: CategoryStripProps) {
  const t = await getTranslations({ locale });

  return (
    <section
      aria-labelledby="categories-heading"
      className="border-y border-[color:var(--color-border)] bg-[color:var(--color-clay-50)]"
    >
      <Container size="lg" className="py-12 md:py-16">
        <div className="mb-8 flex items-center gap-3">
          <StarOrnament size={12} className="text-[color:var(--color-clay-600)]" />
          <h2
            id="categories-heading"
            className="text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]"
          >
            {t('home.categoriesTitle')}
          </h2>
        </div>

        <ul className="grid grid-cols-2 gap-px bg-[color:var(--color-border)] md:grid-cols-5">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={{ pathname: '/search', query: { category: c.slug } }}
                className="group flex h-full flex-col gap-3 bg-[color:var(--color-clay-50)] p-6 transition-colors duration-[var(--duration-fast)] hover:bg-[color:var(--color-clay-100)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  width={32}
                  height={32}
                  aria-hidden
                  className="text-[color:var(--color-clay-700)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-medina)] group-hover:scale-110"
                >
                  <path
                    d={ICON_FOR[c.iconKey]}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <h3
                  className="italic font-semibold text-[color:var(--color-ink-900)] transition-colors duration-[var(--duration-fast)] group-hover:text-[color:var(--color-clay-700)]"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}
                >
                  {c.name[locale]}
                </h3>
                <p className="text-sm text-[color:var(--color-ink-700)] line-clamp-2">
                  {c.description[locale]}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
