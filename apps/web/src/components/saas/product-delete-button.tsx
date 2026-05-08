'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';

export function ProductDeleteButton({
  id,
  confirmMessage,
  label,
}: {
  id: string;
  confirmMessage: string;
  label: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function onClick() {
    if (!window.confirm(confirmMessage)) return;
    const res = await fetch(`/api/me/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      startTransition(() => {
        router.refresh();
      });
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:border-red-500 disabled:opacity-60"
    >
      {label}
    </button>
  );
}
