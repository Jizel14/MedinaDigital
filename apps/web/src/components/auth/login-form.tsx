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
      {error && (
        <p className="rounded-md border border-[color:var(--color-clay-300)] bg-[color:var(--color-clay-50)] px-3 py-2 text-sm text-[color:var(--color-clay-800)]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-[color:var(--color-olive-700)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[color:var(--color-olive-900)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-olive-500)] disabled:opacity-60"
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
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-700)]">
        {props.label}
      </span>
      <input
        name={props.name}
        type={props.type}
        required={props.required}
        autoComplete={props.autoComplete}
        className="w-full rounded-md border border-[color:var(--color-border)] bg-white/80 px-3 py-2.5 text-sm text-[color:var(--color-ink-900)] shadow-[var(--shadow-soft)] transition focus:border-[color:var(--color-olive-500)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-olive-300)]/40"
      />
    </label>
  );
}
