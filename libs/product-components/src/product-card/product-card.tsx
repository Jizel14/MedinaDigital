'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import type { Product, Region, Locale } from '@medina/shared-types';
import { Card, CardImage, CardBody, CardTitle, cardLift, imageZoom, cn } from '@medina/ui';
import { PriceDisplay } from '../price-display/price-display';
import { RegionTag } from '../region-tag/region-tag';
import { TrustTagBadge } from '../trusttag-badge/trusttag-badge';

export interface ProductCardProps {
  product: Product;
  region: Pick<Region, 'name'>;
  locale: Locale;
  /** Show the verified badge. Defaults to true. */
  verified?: boolean;
  className?: string;
  /** Render as anchor (Link wraps caller-side in apps/web). */
  href?: string;
}

/**
 * Product card used on home (featured), search results, related cross-sell.
 * Hover lifts the card and zooms the photo subtly. Title in Cormorant
 * italic, price in clay-700, region as eyebrow.
 */
export function ProductCard({
  product,
  region,
  locale,
  verified = true,
  className,
  href,
}: ProductCardProps) {
  const title = product.title[locale];
  const firstPhoto = product.photos[0] ?? '/images/seed/placeholder.svg';

  const inner = (
    <motion.div initial="rest" whileHover="hover" animate="rest" variants={cardLift}>
      <Card className={cn('cursor-pointer overflow-hidden', className)}>
        <CardImage>
          <motion.div
            variants={imageZoom}
            className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-clay-200)]"
          >
            <Image
              src={firstPhoto}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover"
            />
          </motion.div>
        </CardImage>
        <CardBody>
          <RegionTag region={region} locale={locale} />
          <CardTitle className="mt-1">{title}</CardTitle>
          <div className="mt-3 flex items-center justify-between gap-2">
            <PriceDisplay priceEur={product.priceEur} locale={locale} size="sm" />
            {verified && <TrustTagBadge trusttagId={product.trusttagId} locale={locale} />}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block focus-visible:outline-2 focus-visible:outline-offset-4">
        {inner}
      </a>
    );
  }
  return inner;
}
