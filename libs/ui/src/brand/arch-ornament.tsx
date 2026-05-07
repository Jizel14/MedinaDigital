import type { SVGProps } from 'react';
import { cn } from '../lib/cn';

export interface ArchOrnamentProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * A small mashrabiya-inspired arch silhouette — used to "open a door"
 * onto an artisan profile. Symbolic, not literal — abstracted as a
 * pointed horseshoe outline plus a small inner arch.
 */
export function ArchOrnament({ size = 48, className, ...rest }: ArchOrnamentProps) {
  return (
    <svg
      viewBox="0 0 48 64"
      width={size}
      height={size}
      aria-hidden
      focusable={false}
      className={cn('inline-block', className)}
      {...rest}
    >
      {/* Outer pointed arch */}
      <path
        d="M2 64 L2 28 Q2 4 24 4 Q46 4 46 28 L46 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Inner arch (smaller, offset) */}
      <path
        d="M10 64 L10 32 Q10 14 24 14 Q38 14 38 32 L38 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.55"
      />
      {/* Tip */}
      <circle cx="24" cy="2" r="1.4" fill="currentColor" />
    </svg>
  );
}
