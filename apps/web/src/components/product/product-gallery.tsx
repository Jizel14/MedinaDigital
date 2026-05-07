'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@medina/ui';

export interface ProductGalleryProps {
  photos: string[];
  alt: string;
}

export function ProductGallery({ photos, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const main = photos[active] ?? photos[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--color-clay-200)] [border-radius:var(--radius-sm)_var(--radius-sm)_var(--radius-xl)_var(--radius-sm)]">
        {main && (
          <Image
            src={main}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        )}
      </div>

      {photos.length > 1 && (
        <ul className="grid grid-cols-4 gap-2">
          {photos.map((p, i) => (
            <li key={p + i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden bg-[color:var(--color-clay-200)] transition-all duration-[var(--duration-fast)]',
                  i === active
                    ? 'ring-2 ring-offset-2 ring-[color:var(--color-clay-700)] ring-offset-[color:var(--color-bg)]'
                    : 'opacity-70 hover:opacity-100',
                )}
              >
                <Image src={p} alt="" fill sizes="100px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
