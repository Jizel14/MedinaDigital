import type { Locale } from '@medina/shared-types';
import { Badge, StarOrnament, cn } from '@medina/ui';

export interface TrustTagBadgeProps {
  trusttagId: string;
  locale: Locale;
  /** Compact: just the verified pill. Detailed: pill + 'View passport' link. */
  variant?: 'compact' | 'detailed';
  className?: string;
}

const labels: Record<Locale, { verified: string; viewPassport: string }> = {
  en: { verified: 'Verified', viewPassport: 'View digital passport' },
  fr: { verified: 'Vérifié', viewPassport: 'Voir le passeport numérique' },
  'ar-TN': { verified: 'محقق', viewPassport: 'شوف الباسبور الرقمي' },
};

export function TrustTagBadge({
  trusttagId,
  locale,
  variant = 'compact',
  className,
}: TrustTagBadgeProps) {
  const { verified, viewPassport } = labels[locale];
  const href = `/${locale}/t/${trusttagId}`;

  if (variant === 'compact') {
    return (
      <Badge tone="verified" className={className}>
        <StarOrnament size={9} />
        <span>{verified}</span>
      </Badge>
    );
  }

  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center gap-3 group',
        'text-[color:var(--color-ink-900)]',
        'transition-colors duration-[var(--duration-fast)]',
        className,
      )}
    >
      <Badge tone="verified">
        <StarOrnament size={9} />
        <span>{verified}</span>
      </Badge>
      <span className="text-sm italic [font-family:var(--font-display)] font-semibold border-b border-[color:var(--color-ink-900)] group-hover:text-[color:var(--color-clay-700)] group-hover:border-[color:var(--color-clay-700)] pb-0.5">
        {viewPassport}
      </span>
    </a>
  );
}
