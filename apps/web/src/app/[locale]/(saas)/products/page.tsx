import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { apiFetch } from '@/lib/auth/server';
import { ProductDeleteButton } from '@/components/saas/product-delete-button';

interface MeProduct {
  id: string;
  slug: string;
  title: { en: string; fr: string; 'ar-TN': string };
  priceTnd: string;
  priceEur: string;
  photos: string[];
}

export default async function ProductsListPage() {
  const t = await getTranslations('saas.products');
  const res = await apiFetch<MeProduct[]>('/api/me/products');
  const products = res.data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <Link
          href="/products/new"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
        >
          + {t('newProduct')}
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-12 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-12 text-center text-sm text-stone-600">
          {t('empty')}
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-stone-200 rounded-lg border border-stone-200">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-4 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-stone-100">
                {p.photos[0] && (
                  <Image
                    src={p.photos[0]}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-stone-900">{p.title.fr || p.slug}</p>
                <p className="text-xs text-stone-500">
                  {p.priceTnd} TND · {p.priceEur} EUR
                </p>
              </div>
              <Link
                href={`/products/edit/${p.id}` as `/products/edit/${string}`}
                className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-800 hover:border-stone-500"
              >
                {t('edit')}
              </Link>
              <ProductDeleteButton
                id={p.id}
                confirmMessage={t('deleteConfirm')}
                label={t('delete')}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
