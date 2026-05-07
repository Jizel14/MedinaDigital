'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { LOCALES, type Locale } from '@medina/shared-types';
import { cn } from '@medina/ui';

const LABEL: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  'ar-TN': 'AR',
};

/**
 * Three-letter locale switcher displayed in the header. Active locale is
 * underlined in clay. Click swaps the locale on the same path.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const params = useParams<{ locale: Locale }>();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const current = params.locale;

  return (
    <div
      className={cn('inline-flex items-center gap-1 text-xs font-medium', className)}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((loc, i) => (
        <span key={loc} className="inline-flex items-center">
          {i > 0 && (
            <span className="px-1 opacity-40" aria-hidden>
              ·
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              startTransition(() => {
                router.replace(pathname, { locale: loc });
              })
            }
            aria-current={loc === current ? 'true' : undefined}
            className={cn(
              'px-1 transition-colors duration-[var(--duration-fast)]',
              'tracking-[var(--tracking-label)]',
              loc === current
                ? 'text-[color:var(--color-clay-700)] border-b-2 border-[color:var(--color-clay-700)]'
                : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-ink-900)]',
            )}
          >
            {LABEL[loc]}
          </button>
        </span>
      ))}
    </div>
  );
}
