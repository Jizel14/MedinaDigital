import type { SVGProps } from 'react';
import { cn } from '../lib/cn';

export interface StarOrnamentProps extends Omit<SVGProps<SVGSVGElement>, 'tone'> {
  /** Pixel size; defaults to inherit via 1em. */
  size?: number | string;
  /** Stroke or fill mode. Filled is the default; outline is used for hairlines. */
  variant?: 'filled' | 'outline';
}

/**
 * Eight-pointed star inspired by Tunisian zellige tiling.
 * The signature ornament — used in dividers, badges, hero piece.
 *
 * Color is driven by `currentColor` so a parent can swap palette via
 * `text-clay-700`, `text-olive-700`, etc.
 */
export function StarOrnament({
  size = '1em',
  variant = 'filled',
  className,
  ...rest
}: StarOrnamentProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      focusable={false}
      className={cn('inline-block', className)}
      {...rest}
    >
      {/* 8-branch star: alternating outer (12) and inner radii (8.4) along 16 angles */}
      <path
        d="M12 0.5 L13.7 8.3 L19.5 4.5 L15.7 10.3 L23.5 12 L15.7 13.7 L19.5 19.5 L13.7 15.7 L12 23.5 L10.3 15.7 L4.5 19.5 L8.3 13.7 L0.5 12 L8.3 10.3 L4.5 4.5 L10.3 8.3 Z"
        fill={variant === 'filled' ? 'currentColor' : 'none'}
        stroke={variant === 'outline' ? 'currentColor' : 'none'}
        strokeWidth={variant === 'outline' ? 1 : 0}
        strokeLinejoin="round"
      />
    </svg>
  );
}
