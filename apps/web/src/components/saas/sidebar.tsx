'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: '/dashboard' | '/profile' | '/products';
  labelKey: 'overview' | 'profile' | 'products';
}

const NAV: NavItem[] = [
  { href: '/dashboard', labelKey: 'overview' },
  { href: '/profile', labelKey: 'profile' },
  { href: '/products', labelKey: 'products' },
];

export function Sidebar({ email, role }: { email: string; role: 'artisan' | 'pme_owner' }) {
  const path = usePathname();
  const t = useTranslations('saas.nav');

  return (
    <aside className="hidden w-60 shrink-0 border-r border-stone-200 bg-stone-50 px-4 py-6 md:block">
      <div className="mb-8 px-2">
        <p className="text-xs uppercase tracking-wider text-stone-500">Médina Digital</p>
        <p className="mt-1 truncate text-sm font-medium text-stone-900">{email}</p>
        <p className="text-xs text-stone-500">
          {role === 'artisan' ? 'Artisan' : 'Coopérative / PME'}
        </p>
      </div>

      <nav>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm transition ${
                    active ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
