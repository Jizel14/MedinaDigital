import { getTranslations } from 'next-intl/server';
import type { Locale } from '@medina/shared-types';
import { CATEGORY_SLUGS, type CategorySlug } from '@medina/shared-types';
import { Container, Logo } from '@medina/ui';
import { Link } from '@/i18n/navigation';
import { currentUser } from '@/lib/auth/server';
import { LocaleSwitcher } from './locale-switcher';

const NAV_KEY: Record<CategorySlug, string> = {
  ceramics: 'nav.ceramics',
  textile: 'nav.textile',
  leather: 'nav.leather',
  jewelry: 'nav.jewelry',
  wood: 'nav.wood',
};

export async function SiteHeader({ locale }: { locale: Locale }) {
  const [t, me] = await Promise.all([getTranslations({ locale }), currentUser()]);

  return (
    <header
      className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/85 backdrop-blur"
      role="banner"
    >
      <Container size="lg" className="flex items-center justify-between gap-6 py-4">
        <Link
          href="/"
          aria-label={t('metadata.siteName')}
          className="focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Logo variant="lockup" />
        </Link>

        <nav aria-label={t('nav.shop')} className="hidden items-center gap-7 text-sm md:flex">
          <Link
            href="/search"
            className="text-[color:var(--color-ink-900)] hover:text-[color:var(--color-clay-700)] transition-colors duration-[var(--duration-fast)] [font-family:var(--font-display)] italic font-semibold"
          >
            {t('nav.shop')}
          </Link>
          {CATEGORY_SLUGS.map((slug) => (
            <Link
              key={slug}
              href={{ pathname: '/search', query: { category: slug } }}
              className="text-[color:var(--color-ink-700)] hover:text-[color:var(--color-clay-700)] transition-colors duration-[var(--duration-fast)]"
            >
              {t(NAV_KEY[slug])}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="hidden text-sm text-[color:var(--color-ink-700)] hover:text-[color:var(--color-clay-700)] md:inline transition-colors duration-[var(--duration-fast)]"
          >
            {t('nav.about')}
          </Link>
          {me ? (
            <Link
              href="/dashboard"
              className="rounded-md border border-[color:var(--color-ink-900)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-ink-900)] transition-colors duration-[var(--duration-fast)] hover:bg-[color:var(--color-ink-900)] hover:text-white"
            >
              {t('saas.nav.overview')}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-[color:var(--color-ink-900)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-ink-900)] transition-colors duration-[var(--duration-fast)] hover:bg-[color:var(--color-ink-900)] hover:text-white"
            >
              {t('auth.loginTitle')}
            </Link>
          )}
          <LocaleSwitcher />
        </div>
      </Container>
    </header>
  );
}
