import type { ReactNode } from 'react';

/**
 * Root layout — passthrough only. The real <html lang dir> tags are rendered
 * inside app/[locale]/layout.tsx (where the locale is known) and inside
 * not-found.tsx (which lives outside [locale]).
 *
 * This file exists because Next.js requires a root layout in app/.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
