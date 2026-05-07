import Image from 'next/image';
import type { Artisan, Region, Locale } from '@medina/shared-types';
import { ArchOrnament, cn } from '@medina/ui';

export interface ArtisanQuoteProps {
  artisan: Artisan;
  region: Pick<Region, 'name'>;
  locale: Locale;
  /** Optional href to fiche artisan (e.g. /[locale]/artisans/[slug]). */
  href?: string;
  className?: string;
}

const labels: Record<Locale, { meet: string; yearsLabel: (n: number) => string }> = {
  en: { meet: 'Meet', yearsLabel: (n) => `${n} years of practice` },
  fr: { meet: 'Découvrir', yearsLabel: (n) => `${n} ans de métier` },
  'ar-TN': { meet: 'اعرف', yearsLabel: (n) => `${n} سنة في الصنعة` },
};

/**
 * Editorial inset on a product page: portrait + arch ornament + 1-2 lines
 * of bio + 'Meet [Name]' link. The arch evokes opening a door onto the
 * artisan's workshop without being literal.
 */
export function ArtisanQuote({ artisan, region, locale, href, className }: ArtisanQuoteProps) {
  const { meet, yearsLabel } = labels[locale];
  const bio = artisan.shortBio[locale];

  const card = (
    <article
      className={cn(
        'flex items-start gap-5 p-6 bg-[color:var(--color-clay-100)]',
        '[border-radius:var(--radius-sm)_var(--radius-sm)_var(--radius-xl)_var(--radius-sm)]',
        className,
      )}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[color:var(--color-clay-200)]">
        <Image
          src={artisan.portrait}
          alt={artisan.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <ArchOrnament size={20} className="text-[color:var(--color-clay-600)]" />
          <span className="text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
            {region.name[locale]} · {yearsLabel(artisan.yearsOfPractice)}
          </span>
        </div>
        <h3
          className="italic font-semibold text-[color:var(--color-ink-900)] mb-2"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}
        >
          {artisan.name}
        </h3>
        <p className="text-sm leading-relaxed text-[color:var(--color-ink-700)]">{bio}</p>
        {href && (
          <span className="mt-3 inline-block text-sm italic [font-family:var(--font-display)] font-semibold border-b border-[color:var(--color-ink-900)] pb-0.5">
            {meet} {artisan.name}
          </span>
        )}
      </div>
    </article>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 hover:[&_h3]:text-[color:var(--color-clay-700)]"
      >
        {card}
      </a>
    );
  }
  return card;
}
