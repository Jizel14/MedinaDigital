import type { ReactNode } from 'react';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { currentUser } from '@/lib/auth/server';
import { SmokyBg } from '@/components/saas/smoky-bg';

/**
 * Auth-area layout (signup, login). If the user is already signed in we send
 * them to the dashboard rather than letting them re-authenticate.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const me = await currentUser();
  if (me) {
    const locale = await getLocale();
    redirect({ href: '/dashboard', locale });
  }
  return (
    <main className="relative min-h-screen text-[color:var(--color-ink-900)]">
      <SmokyBg />
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 p-8 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
