import { StarOrnament } from './star-ornament';
import { cn } from '../lib/cn';

export interface DividerOrnamentProps {
  className?: string;
  /** Hide the central star — keeps just the two hairlines. */
  withoutStar?: boolean;
}

/**
 * Horizontal divider with a centered zellige star — used between sections
 * to add the signature without shouting. Lines are hair-thin and end
 * before the star to leave breathing space.
 */
export function DividerOrnament({ className, withoutStar = false }: DividerOrnamentProps) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn(
        'flex items-center justify-center gap-3 text-[color:var(--color-clay-600)]',
        className,
      )}
    >
      <span
        className="h-px flex-1 max-w-[160px]"
        style={{ background: 'currentColor', opacity: 0.45 }}
      />
      {!withoutStar && <StarOrnament size={14} className="opacity-90" />}
      <span
        className="h-px flex-1 max-w-[160px]"
        style={{ background: 'currentColor', opacity: 0.45 }}
      />
    </div>
  );
}
