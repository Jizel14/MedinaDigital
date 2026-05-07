import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium leading-none [font-family:var(--font-body)]',
  {
    variants: {
      tone: {
        verified: 'bg-[color:var(--color-olive-700)] text-[color:var(--color-clay-100)]',
        soft: 'bg-[color:var(--color-clay-200)] text-[color:var(--color-ink-900)]',
        outline:
          'border border-[color:var(--color-ink-900)] text-[color:var(--color-ink-900)] bg-transparent',
      },
    },
    defaultVariants: { tone: 'verified' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone, className, ...rest },
  ref,
) {
  return <span ref={ref} className={cn(badgeVariants({ tone }), className)} {...rest} />;
});

export { badgeVariants };
