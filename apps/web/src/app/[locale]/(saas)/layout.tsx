import type { ReactNode } from 'react';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { currentUser } from '@/lib/auth/server';

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
  return <main className="min-h-screen bg-white text-stone-900">{children}</main>;
}
