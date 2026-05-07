import { StarOrnament } from './star-ornament';
import { cn } from '../lib/cn';

export type LogoVariant = 'lockup' | 'lockup-vertical' | 'mark' | 'wordmark';

export interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /** When true, links the logo to "/" via an anchor — caller controls href otherwise. */
  asLink?: boolean;
}

/**
 * Médina Digital logo. Phase A is a placeholder Cormorant italic wordmark
 * with a small zellige mark. The structural component stays — only the
 * inner SVG/text gets swapped when the real logo is designed.
 *
 *   - lockup           : mark + wordmark, horizontal (default)
 *   - lockup-vertical  : mark above wordmark, for tight headers / favicons
 *   - mark             : zellige star alone, for favicons / app icons
 *   - wordmark         : "Médina" alone, when context already says brand
 */
export function Logo({ variant = 'lockup', className, asLink = false }: LogoProps) {
  const wordmark = (
    <span
      className="leading-none"
      style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-display)',
      }}
    >
      Médina
    </span>
  );

  const mark = <StarOrnament size="0.85em" className="text-[color:var(--color-clay-700)]" />;

  let content;
  if (variant === 'mark') {
    content = (
      <span className={cn('inline-flex text-[color:var(--color-clay-700)] text-[24px]', className)}>
        <StarOrnament size="1em" />
      </span>
    );
  } else if (variant === 'wordmark') {
    content = (
      <span className={cn('text-[color:var(--color-clay-700)] text-[28px]', className)}>
        {wordmark}
      </span>
    );
  } else if (variant === 'lockup-vertical') {
    content = (
      <span
        className={cn(
          'inline-flex flex-col items-center gap-1 text-[color:var(--color-clay-700)] text-[24px]',
          className,
        )}
      >
        {mark}
        {wordmark}
      </span>
    );
  } else {
    content = (
      <span
        className={cn(
          'inline-flex items-center gap-2 text-[color:var(--color-clay-700)] text-[28px]',
          className,
        )}
      >
        {mark}
        {wordmark}
      </span>
    );
  }

  if (asLink) {
    return (
      <a
        href="/"
        aria-label="Médina Digital — home"
        className="inline-block focus-visible:outline-2"
      >
        {content}
      </a>
    );
  }
  return content;
}
