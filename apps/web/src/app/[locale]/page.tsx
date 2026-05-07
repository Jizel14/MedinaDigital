import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Locale } from '@medina/shared-types';
import { routing } from '@/i18n/routing';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tMeta = await getTranslations('metadata');

  return (
    <main className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          {tMeta('siteName')}
        </p>
        <h1
          className="mb-8 italic"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-5xl)',
            lineHeight: 1.05,
            letterSpacing: 'var(--tracking-display)',
            color: 'var(--color-clay-700)',
          }}
        >
          {t('heroTitle')}
        </h1>
        <p
          className="max-w-2xl text-[color:var(--color-ink-700)]"
          style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 1.55 }}
        >
          {t('heroLead', { count: 8, products: 18 })}
        </p>

        <div className="mt-16 flex items-center gap-6 text-sm text-[color:var(--color-muted)]">
          <span>Phase 3 · scaffolding</span>
          <span aria-hidden>·</span>
          <span>Tokens, fonts, i18n routing OK</span>
        </div>
      </div>
    </main>
  );
}
