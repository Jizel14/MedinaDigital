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
    <aside className="hidden w-64 shrink-0 border-r border-[color:var(--color-border)] bg-white/60 px-4 py-6 backdrop-blur-xl md:block">
      <div className="mb-8 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-olive-700)]">
          Médina Digital
        </p>
        <p className="mt-2 truncate text-base font-semibold text-[color:var(--color-ink-900)] [font-family:var(--font-display)] italic">
          {email}
        </p>
        <p className="text-xs text-[color:var(--color-ink-700)]/75">
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
                  className={`block rounded-md px-3 py-2.5 text-sm transition ${
                    active
                      ? 'bg-[color:var(--color-olive-700)] text-white shadow-[var(--shadow-soft)]'
                      : 'text-[color:var(--color-ink-700)] hover:bg-[color:var(--color-olive-100)] hover:text-[color:var(--color-olive-900)]'
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
