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
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">{t('signupTitle')}</h1>
      <SignupForm regions={regions} categories={categories} />
      <p className="mt-6 text-sm text-stone-600">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="font-semibold text-stone-900 underline underline-offset-4">
          {t('loginLink')}
        </Link>
      </p>
    </section>
  );
}
