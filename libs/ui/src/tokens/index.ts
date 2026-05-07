/**
 * Design tokens — TypeScript mirror of the CSS @theme variables defined in
 * apps/web/src/app/globals.css. Use these in JS-driven animations or inline
 * styles where CSS variables aren't directly accessible.
 *
 * Source of truth is the CSS file. If a token here drifts from the CSS,
 * the CSS wins (everything visual is rendered via CSS variables).
 */

export const colors = {
  clay: {
    50: '#FBF7F1',
    100: '#F5EFE6',
    200: '#EFE7DA',
    300: '#E8C8A0',
    400: '#D89E64',
    500: '#C77C3F',
    600: '#A85433',
    700: '#8B3A24',
    800: '#6B2A18',
    900: '#4A1D10',
  },
  ink: {
    50: '#F5F4F2',
    700: '#3D3833',
    900: '#2B2622',
    950: '#1A1612',
  },
  olive: {
    100: '#E5EBE7',
    300: '#88A89A',
    500: '#5A8470',
    700: '#3A6B5A',
    900: '#1F3A2D',
  },
} as const;

export const durations = {
  fast: 0.2,
  base: 0.4,
  slow: 0.8,
  hero: 1.6,
} as const;

export const easeMedina = [0.32, 0.08, 0.24, 1] as const;
