'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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

interface Material {
  name: { en: string; fr: string; 'ar-TN': string };
  percentage: number;
}

export interface ProductInitial {
  id?: string;
  slug?: string;
  categorySlug?: string;
  regionId?: string;
  title?: { en: string; fr: string; 'ar-TN': string };
  descriptionShort?: { en: string; fr: string; 'ar-TN': string };
  descriptionLong?: { en: string; fr: string; 'ar-TN': string };
  dimensions?: { lengthCm: number; widthCm: number; heightCm: number };
  weightG?: number;
  priceTnd?: string | number;
  priceEur?: string | number;
  photos?: string[];
  materials?: Array<{
    name: { en: string; fr: string; 'ar-TN': string };
    percentage: string | number;
  }>;
}

const EMPTY_LOCALIZED = { en: '', fr: '', 'ar-TN': '' };

export function ProductForm({
  initial,
  regions,
  categories,
  mode,
}: {
  initial?: ProductInitial;
  regions: Region[];
  categories: Category[];
  mode: 'create' | 'edit';
}) {
  const t = useTranslations('saas.products');
  const tForm = useTranslations('saas.products.form');
  const router = useRouter();
  const locale = useLocale() as Locale;

  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? ['']);
  const [materials, setMaterials] = useState<Material[]>(
    initial?.materials?.map((m) => ({ name: m.name, percentage: Number(m.percentage) })) ?? [
      { name: { ...EMPTY_LOCALIZED }, percentage: 100 },
    ],
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      slug: String(fd.get('slug') ?? '').trim(),
      categorySlug: String(fd.get('categorySlug') ?? ''),
      regionId: String(fd.get('regionId') ?? ''),
      title: {
        fr: String(fd.get('title_fr') ?? ''),
        en: String(fd.get('title_en') ?? ''),
        'ar-TN': String(fd.get('title_ar') ?? ''),
      },
      descriptionShort: {
        fr: String(fd.get('descShort_fr') ?? ''),
        en: String(fd.get('descShort_en') ?? ''),
        'ar-TN': String(fd.get('descShort_ar') ?? ''),
      },
      descriptionLong: {
        fr: String(fd.get('descLong_fr') ?? ''),
        en: String(fd.get('descLong_en') ?? ''),
        'ar-TN': String(fd.get('descLong_ar') ?? ''),
      },
      dimensions: {
        lengthCm: Number(fd.get('lengthCm') ?? 0),
        widthCm: Number(fd.get('widthCm') ?? 0),
        heightCm: Number(fd.get('heightCm') ?? 0),
      },
      weightG: Number(fd.get('weightG') ?? 0),
      priceTnd: Number(fd.get('priceTnd') ?? 0),
      priceEur: Number(fd.get('priceEur') ?? 0),
      photos: photos.map((p) => p.trim()).filter(Boolean),
      materials: materials.map((m) => ({
        name: m.name,
        percentage: Number(m.percentage),
      })),
    };

    const url = mode === 'create' ? '/api/me/products' : `/api/me/products/${initial?.id ?? ''}`;
    const res = await fetch(url, {
      method: mode === 'create' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { code?: string } | null;
      const code = data?.code;
      if (code === 'SLUG_TAKEN') setError(t('errors.slugTaken'));
      else if (code === 'MATERIALS_SUM_INVALID') setError(t('errors.materialsSumInvalid'));
      else setError(t('errors.generic'));
      setBusy(false);
      return;
    }
    router.push('/products');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field label={tForm('slug')} name="slug" defaultValue={initial?.slug} required />

      <LocalizedFieldset label={tForm('title')} prefix="title" defaults={initial?.title} />

      <Section title={tForm('descriptionShort')}>
        <LocalizedFieldset
          label={tForm('descriptionShort')}
          prefix="descShort"
          defaults={initial?.descriptionShort}
          textarea
        />
      </Section>

      <Section title={tForm('descriptionLong')}>
        <LocalizedFieldset
          label={tForm('descriptionLong')}
          prefix="descLong"
          defaults={initial?.descriptionLong}
          textarea
          rows={5}
        />
      </Section>

      <Select
        label="Région"
        name="regionId"
        defaultValue={initial?.regionId}
        options={regions.map((r) => ({ value: r.id, label: r.name[locale] ?? r.name.fr }))}
      />
      <Select
        label="Catégorie"
        name="categorySlug"
        defaultValue={initial?.categorySlug}
        options={categories.map((c) => ({ value: c.slug, label: c.name[locale] ?? c.name.fr }))}
      />

      <div className="grid grid-cols-3 gap-3">
        <Field
          label={tForm('lengthCm')}
          name="lengthCm"
          type="number"
          step="0.1"
          defaultValue={String(initial?.dimensions?.lengthCm ?? '')}
          required
        />
        <Field
          label={tForm('widthCm')}
          name="widthCm"
          type="number"
          step="0.1"
          defaultValue={String(initial?.dimensions?.widthCm ?? '')}
          required
        />
        <Field
          label={tForm('heightCm')}
          name="heightCm"
          type="number"
          step="0.1"
          defaultValue={String(initial?.dimensions?.heightCm ?? '')}
          required
        />
      </div>

      <Field
        label={tForm('weightG')}
        name="weightG"
        type="number"
        defaultValue={String(initial?.weightG ?? '')}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label={tForm('priceTnd')}
          name="priceTnd"
          type="number"
          step="0.01"
          defaultValue={String(initial?.priceTnd ?? '')}
          required
        />
        <Field
          label={tForm('priceEur')}
          name="priceEur"
          type="number"
          step="0.01"
          defaultValue={String(initial?.priceEur ?? '')}
          required
        />
      </div>

      <Section title={tForm('photos')}>
        <PhotosEditor photos={photos} onChange={setPhotos} />
      </Section>

      <Section title={tForm('materialsTitle')}>
        <MaterialsEditor materials={materials} onChange={setMaterials} tForm={tForm} />
      </Section>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {mode === 'create' ? tForm('submitCreate') : tForm('submitUpdate')}
        </button>
      </div>
    </form>
  );
}

function PhotosEditor({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {photos.map((p, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={p}
            onChange={(e) => {
              const next = [...photos];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder="/images/seed/placeholder.svg"
            className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
          />
          <button
            type="button"
            onClick={() => onChange(photos.filter((_, j) => j !== i))}
            className="rounded-md border border-stone-300 px-3 text-sm text-stone-700 hover:border-stone-500"
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...photos, ''])}
        className="rounded-md border border-dashed border-stone-300 px-3 py-1.5 text-xs text-stone-600 hover:border-stone-500"
      >
        + URL
      </button>
    </div>
  );
}

function MaterialsEditor({
  materials,
  onChange,
  tForm,
}: {
  materials: Material[];
  onChange: (next: Material[]) => void;
  tForm: ReturnType<typeof useTranslations>;
}) {
  const sum = materials.reduce((a, m) => a + Number(m.percentage || 0), 0);
  return (
    <div className="space-y-3">
      {materials.map((m, i) => (
        <div key={i} className="grid grid-cols-12 gap-2">
          <input
            value={m.name.fr}
            onChange={(e) => updateAt(i, { name: { ...m.name, fr: e.target.value } })}
            placeholder={`${tForm('materialName')} (FR)`}
            className="col-span-4 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
          />
          <input
            value={m.name.en}
            onChange={(e) => updateAt(i, { name: { ...m.name, en: e.target.value } })}
            placeholder={`${tForm('materialName')} (EN)`}
            className="col-span-4 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="0.01"
            value={m.percentage}
            onChange={(e) => updateAt(i, { percentage: Number(e.target.value) })}
            placeholder="%"
            className="col-span-3 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(materials.filter((_, j) => j !== i))}
            className="col-span-1 rounded-md border border-stone-300 text-sm text-stone-700 hover:border-stone-500"
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChange([...materials, { name: { ...EMPTY_LOCALIZED }, percentage: 0 }])}
          className="rounded-md border border-dashed border-stone-300 px-3 py-1.5 text-xs text-stone-600 hover:border-stone-500"
        >
          + {tForm('addMaterial')}
        </button>
        <span
          className={`text-xs font-medium ${
            Math.abs(sum - 100) <= 0.5 ? 'text-green-700' : 'text-red-700'
          }`}
        >
          Σ {sum.toFixed(2)} %
        </span>
      </div>
    </div>
  );

  function updateAt(i: number, patch: Partial<Material>) {
    onChange(materials.map((m, j) => (i === j ? { ...m, ...patch } : m)));
  }
}

function LocalizedFieldset({
  label,
  prefix,
  defaults,
  textarea = false,
  rows = 2,
}: {
  label: string;
  prefix: string;
  defaults?: { en: string; fr: string; 'ar-TN': string };
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {textarea ? (
        <>
          <textarea
            name={`${prefix}_fr`}
            defaultValue={defaults?.fr}
            placeholder="FR"
            rows={rows}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm"
          />
          <textarea
            name={`${prefix}_en`}
            defaultValue={defaults?.en}
            placeholder="EN"
            rows={rows}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm"
          />
          <textarea
            name={`${prefix}_ar`}
            defaultValue={defaults?.['ar-TN']}
            placeholder="AR-TN"
            dir="rtl"
            rows={rows}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm"
          />
        </>
      ) : (
        <>
          <input
            name={`${prefix}_fr`}
            defaultValue={defaults?.fr}
            placeholder="FR"
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm"
          />
          <input
            name={`${prefix}_en`}
            defaultValue={defaults?.en}
            placeholder="EN"
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm"
          />
          <input
            name={`${prefix}_ar`}
            defaultValue={defaults?.['ar-TN']}
            placeholder="AR-TN"
            dir="rtl"
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm"
          />
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-stone-200 p-4">
      <legend className="px-1 text-sm font-semibold text-stone-800">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field(props: {
  label: string;
  name: string;
  type?: 'text' | 'number';
  step?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? 'text'}
        step={props.step}
        defaultValue={props.defaultValue}
        required={props.required}
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
        defaultValue={props.defaultValue ?? ''}
        required
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
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
