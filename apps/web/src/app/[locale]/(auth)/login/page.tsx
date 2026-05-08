import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage() {
  const t = await getTranslations('auth');
  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">{t('loginTitle')}</h1>
      <LoginForm />
      <p className="mt-6 text-sm text-stone-600">
        {t('noAccountYet')}{' '}
        <Link href="/signup" className="font-semibold text-stone-900 underline underline-offset-4">
          {t('signupLink')}
        </Link>
      </p>
    </section>
  );
}
