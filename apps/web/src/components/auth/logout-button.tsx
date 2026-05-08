'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function onClick() {
    await fetch('/api/auth/logout', { method: 'POST' });
    startTransition(() => {
      router.replace('/login');
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:border-stone-500 disabled:opacity-60"
    >
      Se déconnecter
    </button>
  );
}
