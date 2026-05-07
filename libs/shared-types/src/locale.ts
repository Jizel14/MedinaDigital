export const LOCALES = ['en', 'fr', 'ar-TN'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const RTL_LOCALES: ReadonlyArray<Locale> = ['ar-TN'];

export type Localized<T = string> = Record<Locale, T>;

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}
