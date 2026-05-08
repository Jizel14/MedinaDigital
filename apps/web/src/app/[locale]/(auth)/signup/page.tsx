import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SignupForm } from '@/components/auth/signup-form';
import { apiUrl } from '@/lib/auth/config';

interface Region {
  id: string;
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}

interface Category {
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}

async function loadOptions(): Promise<{ regions: Region[]; categories: Category[] }> {
  const [regionsRes, categoriesRes] = await Promise.all([
    fetch(`${apiUrl()}/api/regions`, { cache: 'no-store' }),
    fetch(`${apiUrl()}/api/categories`, { cache: 'no-store' }),
  ]);
  const regions: Region[] = regionsRes.ok ? await regionsRes.json() : [];
  const categories: Category[] = categoriesRes.ok ? await categoriesRes.json() : [];
  return { regions, categories };
}

export default async function SignupPage() {
  const t = await getTranslations('auth');
  const { regions, categories } = await loadOptions();

  return (
    <section>
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[color:var(--color-olive-700)]">
        Médina Digital
      </p>
      <h1 className="mb-8 text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-ink-900)] [font-family:var(--font-display)] italic">
        {t('signupTitle')}
      </h1>
      <SignupForm regions={regions} categories={categories} />
      <p className="mt-8 text-sm text-[color:var(--color-ink-700)]">
        {t('alreadyHaveAccount')}{' '}
        <Link
          href="/login"
          className="font-semibold text-[color:var(--color-olive-700)] underline underline-offset-4 transition-colors hover:text-[color:var(--color-olive-900)]"
        >
          {t('loginLink')}
        </Link>
      </p>
    </section>
  );
}
