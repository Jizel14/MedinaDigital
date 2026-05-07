import type { SVGProps } from 'react';
import { cn } from '../lib/cn';

export interface ZelligePatternProps extends SVGProps<SVGSVGElement> {
  /** Tile size in pixels. Repeats via CSS background or by tiling the parent. */
  size?: number;
  /** Background tint opacity (0-1). The motif itself uses currentColor. */
  opacity?: number;
}

/**
 * 64x64 repeatable tile inspired by zellige geometric tiling.
 * Use as a `<pattern>` background or as a standalone accent block.
 *
 * Drawn as a single repeat unit: a central 8-branch star surrounded by
 * 4 quadrant arcs, all in `currentColor`. Strokes are hair-thin so the
 * pattern reads as texture, not as a hard motif.
 */
export function ZelligePattern({
  size = 64,
  opacity = 0.18,
  className,
  ...rest
}: ZelligePatternProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden
      focusable={false}
      className={cn('inline-block', className)}
      style={{ opacity }}
      {...rest}
    >
      {/* Central 8-branch star, 16px outer radius */}
      <path
        d="M32 16 L34.3 26.4 L42 21.4 L37 29.1 L47.4 31.4 L37 33.7 L42 41.4 L34.3 36.4 L32 46.8 L29.7 36.4 L22 41.4 L27 33.7 L16.6 31.4 L27 29.1 L22 21.4 L29.7 26.4 Z"
        fill="currentColor"
      />
      {/* Quarter arcs in each corner — give the rotational rhythm of zellige */}
      <path
        d="M0 32 A32 32 0 0 1 32 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.7"
      />
      <path
        d="M64 32 A32 32 0 0 0 32 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.7"
      />
      <path
        d="M0 32 A32 32 0 0 0 32 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.7"
      />
      <path
        d="M64 32 A32 32 0 0 1 32 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.7"
      />
    </svg>
  );
}
