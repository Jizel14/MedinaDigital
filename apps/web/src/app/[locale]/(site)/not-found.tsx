import { useTranslations } from 'next-intl';
import { Container, StarOrnament } from '@medina/ui';
import { Link } from '@/i18n/navigation';

export default function LocalisedNotFound() {
  const t = useTranslations('errors');

  return (
    <main>
      <Container size="sm" className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <StarOrnament size={36} className="mx-auto mb-6 text-[color:var(--color-clay-700)]" />
          <h1
            className="mb-4 italic"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-clay-700)',
            }}
          >
            {t('notFound')}
          </h1>
          <p className="mb-8 text-[color:var(--color-ink-700)]">{t('notFoundLead')}</p>
          <Link
            href="/"
            className="inline-block text-sm italic [font-family:var(--font-display)] font-semibold border-b border-[color:var(--color-ink-900)] pb-0.5 hover:text-[color:var(--color-clay-700)] hover:border-[color:var(--color-clay-700)] transition-colors duration-[var(--duration-fast)]"
          >
            {t('backHome')}
          </Link>
        </div>
      </Container>
    </main>
  );
}
