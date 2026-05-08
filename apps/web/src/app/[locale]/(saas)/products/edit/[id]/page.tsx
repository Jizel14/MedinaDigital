import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { apiFetch } from '@/lib/auth/server';
import { ProductForm, type ProductInitial } from '@/components/saas/product-form';

interface Region {
  id: string;
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}
interface Category {
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}

interface FullProduct extends ProductInitial {
  id: string;
  slug: string;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('saas.products');

  const [productRes, regionsRes, categoriesRes] = await Promise.all([
    apiFetch<FullProduct>(`/api/me/products/${id}`),
    apiFetch<Region[]>('/api/regions'),
    apiFetch<Category[]>('/api/categories'),
  ]);
  if (!productRes.ok || !productRes.data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">{t('edit')}</h1>
      <ProductForm
        mode="edit"
        initial={productRes.data}
        regions={regionsRes.data ?? []}
        categories={categoriesRes.data ?? []}
      />
    </div>
  );
}
