'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import type { Locale } from '@medina/shared-types';

interface Region {
  id: string;
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}

interface Category {
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
}

type Role = 'artisan' | 'pme_owner';

type ErrorCode =
  | 'EMAIL_TAKEN'
  | 'INVALID_REGION'
  | 'INVALID_CATEGORY'
  | 'VALIDATION_FAILED'
  | undefined;

function errorKeyFor(code: ErrorCode): string {
  switch (code) {
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

export function SignupForm({ regions, categories }: { regions: Region[]; categories: Category[] }) {
  const t = useTranslations('auth');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [role, setRole] = useState<Role>('artisan');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const email = String(fd.get('email') ?? '').trim();
    const password = String(fd.get('password') ?? '');
    const regionId = String(fd.get('regionId') ?? '');
    const categorySlug = String(fd.get('primaryCategorySlug') ?? '');

    const payload =
      role === 'artisan'
        ? {
            email,
            password,
            role,
            artisan: {
              name: String(fd.get('artisanName') ?? '').trim(),
              regionId,
              primaryCategorySlug: categorySlug,
              yearsOfPractice: Number(fd.get('yearsOfPractice') ?? 0),
            },
          }
        : {
            email,
            password,
            role,
            tenant: {
              businessName: String(fd.get('businessName') ?? '').trim(),
              regionId,
              primaryCategorySlug: categorySlug,
              yearFounded: Number(fd.get('yearFounded') ?? 0) || undefined,
              artisanCount: Number(fd.get('artisanCount') ?? 1) || 1,
            },
          };

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
      <fieldset className="rounded-md border border-[color:var(--color-border)] bg-white/40 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-700)]">
          {t('roleLabel')}
        </legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <RoleRadio value="artisan" current={role} onSelect={setRole} label={t('roleArtisan')} />
          <RoleRadio
            value="pme_owner"
            current={role}
            onSelect={setRole}
            label={t('rolePmeOwner')}
          />
        </div>
      </fieldset>

      <Field label={t('email')} name="email" type="email" required autoComplete="email" />
      <Field
        label={t('password')}
        name="password"
        type="password"
        required
        autoComplete="new-password"
        minLength={8}
      />

      {role === 'artisan' && (
        <>
          <Field label={t('artisanName')} name="artisanName" type="text" required />
          <Field
            label={t('yearsOfPractice')}
            name="yearsOfPractice"
            type="number"
            required
            min={0}
            max={80}
          />
        </>
      )}

      {role === 'pme_owner' && (
        <>
          <Field label={t('businessName')} name="businessName" type="text" required />
          <Field label={t('yearFounded')} name="yearFounded" type="number" min={1900} max={2100} />
          <Field label={t('artisanCount')} name="artisanCount" type="number" min={1} max={10000} />
        </>
      )}

      <Select
        label={t('regionLabel')}
        name="regionId"
        required
        options={regions.map((r) => ({ value: r.id, label: r.name[locale] ?? r.name.fr }))}
      />
      <Select
        label={t('categoryLabel')}
        name="primaryCategorySlug"
        required
        options={categories.map((c) => ({
          value: c.slug,
          label: c.name[locale] ?? c.name.fr,
        }))}
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
        {t('submitSignup')}
      </button>
    </form>
  );
}

function RoleRadio({
  value,
  current,
  onSelect,
  label,
}: {
  value: Role;
  current: Role;
  onSelect: (r: Role) => void;
  label: string;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={active}
      className={`rounded-md border px-3 py-2.5 text-sm font-medium transition ${
        active
          ? 'border-[color:var(--color-olive-700)] bg-[color:var(--color-olive-700)] text-white shadow-[var(--shadow-soft)]'
          : 'border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-ink-900)] hover:border-[color:var(--color-olive-500)] hover:bg-white'
      }`}
    >
      {label}
    </button>
  );
}

function Field(props: {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  autoComplete?: string;
  min?: number;
  max?: number;
  minLength?: number;
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
        min={props.min}
        max={props.max}
        minLength={props.minLength}
        className="w-full rounded-md border border-[color:var(--color-border)] bg-white/80 px-3 py-2.5 text-sm text-[color:var(--color-ink-900)] shadow-[var(--shadow-soft)] transition focus:border-[color:var(--color-olive-500)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-olive-300)]/40"
      />
    </label>
  );
}

function Select(props: {
  label: string;
  name: string;
  required?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-700)]">
        {props.label}
      </span>
      <select
        name={props.name}
        required={props.required}
        defaultValue=""
        className="w-full rounded-md border border-[color:var(--color-border)] bg-white/80 px-3 py-2.5 text-sm text-[color:var(--color-ink-900)] shadow-[var(--shadow-soft)] transition focus:border-[color:var(--color-olive-500)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-olive-300)]/40"
      >
        <option value="" disabled />
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
