import type { Region, Locale } from '@medina/shared-types';
import { cn, StarOrnament } from '@medina/ui';

export interface RegionTagProps {
  region: Pick<Region, 'name'>;
  locale: Locale;
  /** Render as a link to /[locale]/search?region=… (caller wraps in Link). */
  className?: string;
  /** Hide the leading star ornament. */
  withoutStar?: boolean;
}

/**
 * Region marker with the signature star ornament leading. Uppercase
 * tracked label for visual continuity with category eyebrows on the
 * marketplace cards.
 */
export function RegionTag({ region, locale, className, withoutStar }: RegionTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]',
        className,
      )}
    >
      {!withoutStar && (
        <StarOrnament size={9} className="text-[color:var(--color-clay-600)] opacity-80" />
      )}
      <span>{region.name[locale]}</span>
    </span>
  );
}
