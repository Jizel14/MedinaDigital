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
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-olive-700)]">
            Médina Digital
          </p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-ink-900)] [font-family:var(--font-display)] italic">
            {t('title', { name: profileName })}
          </h1>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Card label={t('products')} value={products.length.toString()}>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-olive-700)] transition-colors hover:text-[color:var(--color-olive-900)]"
          >
            {t('manageProducts')} <span aria-hidden>→</span>
          </Link>
        </Card>

        {me.user.role === 'artisan' && (
          <Card label={t('isPublic')} value={isPublic ? t('yes') : t('no')} accent={isPublic}>
            <Link
              href="/profile"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-olive-700)] transition-colors hover:text-[color:var(--color-olive-900)]"
            >
              {t('manageProfile')} <span aria-hidden>→</span>
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
  accent,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 p-6 shadow-[var(--shadow-card)] backdrop-blur-xl transition-shadow hover:shadow-[var(--shadow-lift)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-olive-700)]">
        {label}
      </p>
      <p
        className={`mt-3 text-5xl font-semibold leading-none tracking-tight [font-family:var(--font-display)] italic ${
          accent ? 'text-[color:var(--color-olive-700)]' : 'text-[color:var(--color-ink-900)]'
        }`}
      >
        {value}
      </p>
      {children}
    </div>
  );
}
