'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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

interface TenantProfile {
  id: string;
  businessName: string;
  regionId: string;
  primaryCategorySlug: string;
  yearFounded: number | null;
  artisanCount: number;
  preferredLanguage: 'fr' | 'ar-TN';
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function TenantProfileForm({
  profile,
  regions,
  categories,
}: {
  profile: TenantProfile;
  regions: Region[];
  categories: Category[];
}) {
  const t = useTranslations('saas.profile');
  const tAuth = useTranslations('auth');
  const locale = useLocale() as Locale;
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('saving');
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      businessName: String(fd.get('businessName') ?? '').trim(),
      regionId: String(fd.get('regionId') ?? ''),
      primaryCategorySlug: String(fd.get('primaryCategorySlug') ?? ''),
      yearFounded: Number(fd.get('yearFounded') ?? 0) || null,
      artisanCount: Number(fd.get('artisanCount') ?? 1) || 1,
      preferredLanguage: String(fd.get('preferredLanguage') ?? 'fr') as 'fr' | 'ar-TN',
    };
    const res = await fetch('/api/me/tenant', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { code?: string } | null;
      setState('error');
      setError(data?.code ?? 'generic');
      return;
    }
    setState('saved');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field
        label={tAuth('businessName')}
        name="businessName"
        defaultValue={profile.businessName}
      />
      <Field
        label={tAuth('yearFounded')}
        name="yearFounded"
        type="number"
        defaultValue={profile.yearFounded ? String(profile.yearFounded) : ''}
        min={1900}
        max={2100}
      />
      <Field
        label={tAuth('artisanCount')}
        name="artisanCount"
        type="number"
        defaultValue={String(profile.artisanCount)}
        min={1}
        max={10000}
      />

      <Select
        label={tAuth('regionLabel')}
        name="regionId"
        defaultValue={profile.regionId}
        options={regions.map((r) => ({ value: r.id, label: r.name[locale] ?? r.name.fr }))}
      />
      <Select
        label={tAuth('categoryLabel')}
        name="primaryCategorySlug"
        defaultValue={profile.primaryCategorySlug}
        options={categories.map((c) => ({ value: c.slug, label: c.name[locale] ?? c.name.fr }))}
      />
      <Select
        label={t('preferredLanguage')}
        name="preferredLanguage"
        defaultValue={profile.preferredLanguage}
        options={[
          { value: 'fr', label: 'Français' },
          { value: 'ar-TN', label: 'العربية' },
        ]}
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === 'saving'}
          className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {state === 'saving' ? t('saving') : t('save')}
        </button>
        {state === 'saved' && <span className="text-sm text-green-700">{t('saved')}</span>}
        {state === 'error' && <span className="text-sm text-red-700">{error}</span>}
      </div>
    </form>
  );
}

function Field(props: {
  label: string;
  name: string;
  type?: 'text' | 'number';
  defaultValue?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? 'text'}
        defaultValue={props.defaultValue}
        min={props.min}
        max={props.max}
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
      />
    </label>
  );
}

function Select(props: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{props.label}</span>
      <select
        name={props.name}
        defaultValue={props.defaultValue}
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
