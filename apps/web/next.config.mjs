import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  },
};

export default withNextIntl(nextConfig);
