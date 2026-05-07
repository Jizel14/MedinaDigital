import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * On Windows, OneDrive locks files in `.next/cache` while Next's webpack workers
 * try to write them, which surfaces as "Jest worker child process exceptions".
 *
 * Mitigation: keep the dist dir under node_modules (which OneDrive ignores by
 * default) instead of the project root. Next.js requires distDir to be a path
 * relative to the cwd, so an absolute path can't be used directly.
 *
 * Combined with the experimental flags below (no parallel build workers), this
 * keeps dev runs stable on OneDrive-synced repos.
 */
const cacheDir = 'node_modules/.cache/next-medina';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: cacheDir,
  transpilePackages: [
    '@medina/ui',
    '@medina/product-components',
    '@medina/shared-types',
    '@medina/i18n',
  ],
  images: {
    formats: ['image/webp'],
    // Allow SVG seed placeholders. Disable when real raster photos replace them.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ['@medina/ui', '@medina/product-components'],
    // Disable parallel build worker forks — they trigger 'Jest worker child
    // process exceptions' on Windows + OneDrive even with distDir relocated.
    webpackBuildWorker: false,
    parallelServerBuildTraces: false,
    parallelServerCompiles: false,
  },
};

export default withNextIntl(nextConfig);
