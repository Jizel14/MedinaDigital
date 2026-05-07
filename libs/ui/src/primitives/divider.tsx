import { cn } from '../lib/cn';
import { DividerOrnament } from '../brand/divider-ornament';

export interface DividerProps {
  className?: string;
  /** Show the centered zellige star ornament (default true). */
  ornament?: boolean;
}

/**
 * Page section divider. Wraps the brand DividerOrnament with consistent
 * vertical spacing.
 */
export function Divider({ className, ornament = true }: DividerProps) {
  if (!ornament) {
    return <hr className={cn('my-8 h-px border-0 bg-[color:var(--color-border)]', className)} />;
  }
  return <DividerOrnament className={cn('my-12', className)} />;
}
