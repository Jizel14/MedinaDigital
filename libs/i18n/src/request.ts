import { LOCALES, DEFAULT_LOCALE, type Locale } from '@medina/shared-types';

export function isLocale(value: string | undefined): value is Locale {
  return typeof value === 'string' && (LOCALES as ReadonlyArray<string>).includes(value);
}

export function resolveLocale(input: string | undefined): Locale {
  return isLocale(input) ? input : DEFAULT_LOCALE;
}

/**
 * Loads messages JSON for a locale. Used by next-intl getRequestConfig in apps/web.
 * The JSON files live alongside this module so they are bundled with the lib.
 */
export async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  switch (locale) {
    case 'en':
      return (await import('../messages/en.json', { with: { type: 'json' } })).default;
    case 'fr':
      return (await import('../messages/fr.json', { with: { type: 'json' } })).default;
    case 'ar-TN':
      return (await import('../messages/ar-TN.json', { with: { type: 'json' } })).default;
    default:
      return (await import('../messages/en.json', { with: { type: 'json' } })).default;
  }
}
