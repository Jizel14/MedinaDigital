import type { ReactNode } from 'react';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { currentUser } from '@/lib/auth/server';

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
    <main className="min-h-screen bg-stone-50 px-4 py-12 text-stone-900">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </main>
  );
}
