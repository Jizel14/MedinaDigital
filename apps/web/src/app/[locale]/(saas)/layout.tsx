import type { ReactNode } from 'react';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { currentUser } from '@/lib/auth/server';
import { Sidebar } from '@/components/saas/sidebar';
import { SmokyBg } from '@/components/saas/smoky-bg';

/**
 * SaaS-area layout: dashboard, profile, products. Requires sign-in. If the
 * user isn't signed in we send them to /login.
 */
export default async function SaasLayout({ children }: { children: ReactNode }) {
  const me = await currentUser();
  if (!me) {
    const locale = await getLocale();
    redirect({ href: '/login', locale });
  }
  return (
    <div className="relative min-h-screen text-[color:var(--color-ink-900)]">
      <SmokyBg />
      <div className="flex min-h-screen">
        <Sidebar email={me!.user.email} role={me!.user.role} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
