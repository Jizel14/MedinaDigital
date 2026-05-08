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
      className="rounded-md border border-[color:var(--color-border)] bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--color-ink-700)] backdrop-blur-sm transition hover:border-[color:var(--color-olive-500)] hover:text-[color:var(--color-olive-900)] disabled:opacity-60"
    >
      Se déconnecter
    </button>
  );
}
