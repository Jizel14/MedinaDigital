import { getTranslations } from 'next-intl/server';
import type { Locale, Region } from '@medina/shared-types';
import { Container, StarOrnament } from '@medina/ui';
import { Link } from '@/i18n/navigation';

export interface RegionsStripProps {
  regions: Region[];
  locale: Locale;
}

export async function RegionsStrip({ regions, locale }: RegionsStripProps) {
  const t = await getTranslations({ locale });

  return (
    <section
      aria-labelledby="regions-heading"
      className="border-t border-[color:var(--color-border)] bg-[color:var(--color-clay-50)]"
    >
      <Container size="lg" className="py-16">
        <div className="mb-8 flex items-center gap-3">
          <StarOrnament size={12} className="text-[color:var(--color-clay-600)]" />
          <h2
            id="regions-heading"
            className="text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]"
          >
            {t('home.regionsTitle')}
          </h2>
        </div>

        <ul className="flex flex-wrap gap-3">
          {regions.map((r) => (
            <li key={r.slug}>
              <Link
                href={{ pathname: '/search', query: { region: r.slug } }}
                className="inline-flex items-center gap-2 border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-4 py-2 text-sm transition-all duration-[var(--duration-fast)] hover:border-[color:var(--color-clay-700)] hover:text-[color:var(--color-clay-700)]"
              >
                <StarOrnament size={9} className="text-[color:var(--color-clay-600)] opacity-70" />
                {r.name[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
