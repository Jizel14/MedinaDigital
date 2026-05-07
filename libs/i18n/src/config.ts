import { LOCALES, DEFAULT_LOCALE, type Locale, isRTL } from '@medina/shared-types';

export const i18nConfig = {
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeCookie: 'NEXT_LOCALE',
  localeDetection: true,
} as const;

export function getDir(locale: Locale): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

export function getHtmlLang(locale: Locale): string {
  // ar-TN → 'ar-TN' (BCP 47 compliant)
  return locale;
}

export { LOCALES, DEFAULT_LOCALE, type Locale };
