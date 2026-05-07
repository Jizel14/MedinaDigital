import { Cormorant_Garamond, Work_Sans, Amiri, Tajawal } from 'next/font/google';

/**
 * Display serif (latin) — Cormorant Garamond, italic 500/600 used for titles.
 * Loaded via next/font, self-hosted at build time.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['italic', 'normal'],
  display: 'swap',
  variable: '--font-cormorant',
});

/**
 * Body sans-serif (latin).
 */
export const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-work-sans',
});

/**
 * Display serif (arabic) — Amiri, calligraphic.
 */
export const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-amiri',
});

/**
 * Body sans-serif (arabic) — Tajawal, modern legible.
 */
export const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-tajawal',
});

/** All four font CSS variable class names, joined for the html element. */
export const fontVariables = [
  cormorant.variable,
  workSans.variable,
  amiri.variable,
  tajawal.variable,
].join(' ');
