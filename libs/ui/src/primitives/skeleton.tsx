import { cn } from '../lib/cn';

export interface SkeletonProps {
  className?: string;
  /** Aspect ratio shorthand for image-like skeletons. */
  aspect?: '1/1' | '4/3' | '3/4' | '16/9';
}

/**
 * Loading placeholder with shimmer animation in clay-200.
 * Respects prefers-reduced-motion via the global CSS rule in globals.css.
 */
export function Skeleton({ className, aspect }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative overflow-hidden bg-[color:var(--color-clay-200)]',
        aspect === '1/1' && 'aspect-square',
        aspect === '4/3' && 'aspect-[4/3]',
        aspect === '3/4' && 'aspect-[3/4]',
        aspect === '16/9' && 'aspect-video',
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[color:var(--color-clay-100)] to-transparent" />
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
