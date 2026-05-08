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

interface ArtisanProfile {
  id: string;
  name: string;
  yearsOfPractice: number;
  regionId: string;
  primaryCategorySlug: string;
  story: { en: string; fr: string; 'ar-TN': string };
  shortBio: { en: string; fr: string; 'ar-TN': string };
  isPublic: boolean;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function ArtisanProfileForm({
  profile,
  regions,
  categories,
}: {
  profile: ArtisanProfile;
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
      name: String(fd.get('name') ?? '').trim(),
      yearsOfPractice: Number(fd.get('yearsOfPractice') ?? 0),
      regionId: String(fd.get('regionId') ?? ''),
      primaryCategorySlug: String(fd.get('primaryCategorySlug') ?? ''),
      story: {
        fr: String(fd.get('story_fr') ?? ''),
        en: String(fd.get('story_en') ?? ''),
        'ar-TN': String(fd.get('story_ar') ?? ''),
      },
      shortBio: {
        fr: String(fd.get('shortBio_fr') ?? ''),
        en: String(fd.get('shortBio_en') ?? ''),
        'ar-TN': String(fd.get('shortBio_ar') ?? ''),
      },
      isPublic: fd.get('isPublic') === 'on',
    };
    const res = await fetch('/api/me/artisan', {
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
      <Field label={tAuth('artisanName')} name="name" defaultValue={profile.name} />
      <Field
        label={tAuth('yearsOfPractice')}
        name="yearsOfPractice"
        type="number"
        defaultValue={String(profile.yearsOfPractice)}
        min={0}
        max={80}
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

      <Textarea
        label={`${t('shortBio')} (FR)`}
        name="shortBio_fr"
        defaultValue={profile.shortBio.fr}
      />
      <Textarea
        label={`${t('shortBio')} (EN)`}
        name="shortBio_en"
        defaultValue={profile.shortBio.en}
      />
      <Textarea
        label={`${t('shortBio')} (AR-TN)`}
        name="shortBio_ar"
        defaultValue={profile.shortBio['ar-TN']}
        dir="rtl"
      />

      <Textarea
        label={`${t('story')} (FR)`}
        name="story_fr"
        defaultValue={profile.story.fr}
        rows={5}
      />
      <Textarea
        label={`${t('story')} (EN)`}
        name="story_en"
        defaultValue={profile.story.en}
        rows={5}
      />
      <Textarea
        label={`${t('story')} (AR-TN)`}
        name="story_ar"
        defaultValue={profile.story['ar-TN']}
        rows={5}
        dir="rtl"
      />

      <label className="flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 p-3">
        <input
          type="checkbox"
          name="isPublic"
          defaultChecked={profile.isPublic}
          className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
        />
        <span className="text-sm font-medium text-stone-800">{t('publicArtisan')}</span>
      </label>

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

function Textarea(props: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{props.label}</span>
      <textarea
        name={props.name}
        defaultValue={props.defaultValue}
        rows={props.rows ?? 3}
        dir={props.dir}
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
