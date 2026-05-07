import type { Locale } from '@medina/shared-types';
import { cn } from '@medina/ui';

export interface PriceDisplayProps {
  /** Price in EUR (used by default — Vague A targets European buyers). */
  priceEur: number;
  /** Price in TND (shown as secondary line in dashboard / on page produit). */
  priceTnd?: number;
  /** Locale used by Intl.NumberFormat for separators / currency placement. */
  locale: Locale;
  /** Show both currencies stacked (used on product page). */
  showBoth?: boolean;
  /** Visual size — large for product page, small for cards. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const localeMap: Record<Locale, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  'ar-TN': 'ar-TN',
};

function formatPrice(amount: number, currency: 'EUR' | 'TND', locale: Locale): string {
  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
    // Tunisia uses Latin digits even in arabic (skill i18n-tunisian).
    numberingSystem: 'latn',
  }).format(amount);
}

const sizeClass: Record<NonNullable<PriceDisplayProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function PriceDisplay({
  priceEur,
  priceTnd,
  locale,
  showBoth = false,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const eur = formatPrice(priceEur, 'EUR', locale);
  const tnd = priceTnd != null ? formatPrice(priceTnd, 'TND', locale) : null;

  if (showBoth && tnd) {
    return (
      <div className={cn('flex flex-col leading-tight', className)}>
        <span
          className={cn('font-semibold text-[color:var(--color-clay-700)]', sizeClass[size])}
          aria-label={`Price ${eur}`}
        >
          {eur}
        </span>
        <span className="text-xs text-[color:var(--color-muted)] mt-0.5">{tnd}</span>
      </div>
    );
  }

  return (
    <span
      className={cn('font-semibold text-[color:var(--color-clay-700)]', sizeClass[size], className)}
    >
      {eur}
    </span>
  );
}
