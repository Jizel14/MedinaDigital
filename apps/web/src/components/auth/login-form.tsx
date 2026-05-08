'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

type ErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'VALIDATION_FAILED'
  | 'EMAIL_TAKEN'
  | 'INVALID_REGION'
  | 'INVALID_CATEGORY'
  | undefined;

function errorKeyFor(code: ErrorCode): string {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'errors.invalidCredentials';
    case 'EMAIL_TAKEN':
      return 'errors.emailTaken';
    case 'INVALID_REGION':
      return 'errors.invalidRegion';
    case 'INVALID_CATEGORY':
      return 'errors.invalidCategory';
    case 'VALIDATION_FAILED':
      return 'errors.validationFailed';
    default:
      return 'errors.generic';
  }
}

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = JSON.stringify({
      email: String(fd.get('email') ?? '').trim(),
      password: String(fd.get('password') ?? ''),
    });
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { code?: ErrorCode } | null;
      setError(t(errorKeyFor(data?.code)));
      return;
    }
    startTransition(() => {
      router.push('/dashboard');
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label={t('email')} name="email" type="email" required autoComplete="email" />
      <Field
        label={t('password')}
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        {t('submitLogin')}
      </button>
    </form>
  );
}

function Field(props: {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password';
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{props.label}</span>
      <input
        name={props.name}
        type={props.type}
        required={props.required}
        autoComplete={props.autoComplete}
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
      />
    </label>
  );
}
