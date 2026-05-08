import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage() {
  const t = await getTranslations('auth');
  return (
    <section>
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[color:var(--color-olive-700)]">
        Médina Digital
      </p>
      <h1 className="mb-8 text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-ink-900)] [font-family:var(--font-display)] italic">
        {t('loginTitle')}
      </h1>
      <LoginForm />
      <p className="mt-8 text-sm text-[color:var(--color-ink-700)]">
        {t('noAccountYet')}{' '}
        <Link
          href="/signup"
          className="font-semibold text-[color:var(--color-olive-700)] underline underline-offset-4 transition-colors hover:text-[color:var(--color-olive-900)]"
        >
          {t('signupLink')}
        </Link>
      </p>
    </section>
  );
}
