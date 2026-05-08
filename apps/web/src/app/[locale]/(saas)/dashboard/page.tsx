import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { apiFetch, currentUser } from '@/lib/auth/server';
import { LogoutButton } from '@/components/auth/logout-button';

interface ProductSummary {
  id: string;
  slug: string;
}

export default async function DashboardPage() {
  const me = await currentUser();
  if (!me) return null;
  const t = await getTranslations('saas.dashboard');

  const productsRes = await apiFetch<ProductSummary[]>('/api/me/products');
  const products = productsRes.data ?? [];

  const profile = me.profile as Record<string, unknown> | null;
  const profileName =
    me.user.role === 'artisan'
      ? ((profile?.['name'] as string | undefined) ?? me.user.email)
      : ((profile?.['businessName'] as string | undefined) ?? me.user.email);
  const isPublic = me.user.role === 'artisan' ? Boolean(profile?.['isPublic']) : false;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('title', { name: profileName })}
        </h1>
        <LogoutButton />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card label={t('products')} value={products.length.toString()}>
          <Link
            href="/products"
            className="mt-3 inline-flex text-sm font-medium text-stone-900 underline underline-offset-4"
          >
            {t('manageProducts')} →
          </Link>
        </Card>

        {me.user.role === 'artisan' && (
          <Card label={t('isPublic')} value={isPublic ? t('yes') : t('no')}>
            <Link
              href="/profile"
              className="mt-3 inline-flex text-sm font-medium text-stone-900 underline underline-offset-4"
            >
              {t('manageProfile')} →
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-6">
      <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {children}
    </div>
  );
}
