import { getTranslations } from 'next-intl/server';
import type { Locale } from '@medina/shared-types';
import { Container, Logo, DividerOrnament } from '@medina/ui';
import { Link } from '@/i18n/navigation';

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="mt-24 border-t border-[color:var(--color-border)] bg-[color:var(--color-clay-50)]"
    >
      <Container size="lg" className="py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Logo variant="lockup" />
            <p className="mt-4 max-w-sm text-sm text-[color:var(--color-ink-700)]">
              {t('footer.tagline')}
            </p>
          </div>

          <nav aria-label={t('nav.shop')} className="text-sm">
            <p className="mb-3 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {t('nav.shop')}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/search"
                  className="hover:text-[color:var(--color-clay-700)] transition-colors duration-[var(--duration-fast)]"
                >
                  {t('search.title')}
                </Link>
              </li>
              <li>
                <Link
                  href={{ pathname: '/search', query: { category: 'ceramics' } }}
                  className="hover:text-[color:var(--color-clay-700)] transition-colors duration-[var(--duration-fast)]"
                >
                  {t('nav.ceramics')}
                </Link>
              </li>
              <li>
                <Link
                  href={{ pathname: '/search', query: { category: 'textile' } }}
                  className="hover:text-[color:var(--color-clay-700)] transition-colors duration-[var(--duration-fast)]"
                >
                  {t('nav.textile')}
                </Link>
              </li>
              <li>
                <Link
                  href={{ pathname: '/search', query: { category: 'leather' } }}
                  className="hover:text-[color:var(--color-clay-700)] transition-colors duration-[var(--duration-fast)]"
                >
                  {t('nav.leather')}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t('footer.legal')} className="text-sm">
            <p className="mb-3 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              {t('footer.legal')}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="hover:text-[color:var(--color-clay-700)] transition-colors duration-[var(--duration-fast)]"
                >
                  {t('nav.about')}
                </Link>
              </li>
              <li className="text-[color:var(--color-muted)]">{t('footer.terms')}</li>
              <li className="text-[color:var(--color-muted)]">{t('footer.privacy')}</li>
              <li className="text-[color:var(--color-muted)]">{t('footer.imprint')}</li>
            </ul>
          </nav>
        </div>

        <DividerOrnament className="my-12" />

        <p className="text-center text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          © {year} · {t('metadata.siteName')} · Tunis
        </p>
      </Container>
    </footer>
  );
}
