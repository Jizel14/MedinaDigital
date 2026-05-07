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
  },
  experimental: {
    optimizePackageImports: ['@medina/ui', '@medina/product-components'],
  },
};

export default withNextIntl(nextConfig);
