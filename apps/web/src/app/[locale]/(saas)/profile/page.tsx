import { getTranslations } from 'next-intl/server';
import { apiFetch, currentUser } from '@/lib/auth/server';
import { ArtisanProfileForm } from '@/components/saas/artisan-profile-form';
import { TenantProfileForm } from '@/components/saas/tenant-profile-form';

interface Region {
  id: string;
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}

interface Category {
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}

interface ArtisanProfile {
  id: string;
  name: string;
  yearsOfPractice: number;
  regionId: string;
  primaryCategorySlug: string;
  story: { en: string; fr: string; 'ar-TN': string };
  shortBio: { en: string; fr: string; 'ar-TN': string };
  isPublic: boolean;
}

interface TenantProfile {
  id: string;
  businessName: string;
  regionId: string;
  primaryCategorySlug: string;
  yearFounded: number | null;
  artisanCount: number;
  preferredLanguage: 'fr' | 'ar-TN';
}

export default async function ProfilePage() {
  const me = await currentUser();
  if (!me) return null;
  const t = await getTranslations('saas.profile');

  const [regionsRes, categoriesRes] = await Promise.all([
    apiFetch<Region[]>('/api/regions'),
    apiFetch<Category[]>('/api/categories'),
  ]);
  const regions = regionsRes.data ?? [];
  const categories = categoriesRes.data ?? [];

  if (me.user.role === 'artisan') {
    const profileRes = await apiFetch<ArtisanProfile>('/api/me/artisan');
    if (!profileRes.data) return null;
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">{t('titleArtisan')}</h1>
        <ArtisanProfileForm profile={profileRes.data} regions={regions} categories={categories} />
      </div>
    );
  }

  const profileRes = await apiFetch<TenantProfile>('/api/me/tenant');
  if (!profileRes.data) return null;
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">{t('titleTenant')}</h1>
      <TenantProfileForm profile={profileRes.data} regions={regions} categories={categories} />
    </div>
  );
}
