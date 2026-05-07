import type { HTMLAttributes } from 'react';

/**
 * Hide content visually but keep it accessible to assistive tech.
 * Uses the standard CSS recipe (clip + 1px box) — works everywhere.
 */
export function VisuallyHidden({ children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
