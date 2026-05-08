import { getTranslations } from 'next-intl/server';
import { apiFetch } from '@/lib/auth/server';
import { ProductForm } from '@/components/saas/product-form';

interface Region {
  id: string;
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}
interface Category {
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}

export default async function NewProductPage() {
  const t = await getTranslations('saas.products');
  const [regionsRes, categoriesRes] = await Promise.all([
    apiFetch<Region[]>('/api/regions'),
    apiFetch<Category[]>('/api/categories'),
  ]);
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">{t('newProduct')}</h1>
      <ProductForm
        mode="create"
        regions={regionsRes.data ?? []}
        categories={categoriesRes.data ?? []}
      />
    </div>
  );
}
