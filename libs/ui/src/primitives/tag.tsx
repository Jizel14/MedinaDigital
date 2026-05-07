import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const tagVariants = cva(
  'inline-flex items-center gap-1.5 [font-family:var(--font-display)] italic font-semibold leading-none whitespace-nowrap',
  {
    variants: {
      tone: {
        clay: 'text-[color:var(--color-clay-700)] border-b border-[color:var(--color-clay-700)]',
        olive: 'text-[color:var(--color-olive-700)] border-b border-[color:var(--color-olive-700)]',
        ink: 'text-[color:var(--color-ink-900)] border-b border-[color:var(--color-ink-900)]',
        muted:
          'text-[color:var(--color-muted)] border-b border-[color:var(--color-muted)] opacity-90',
      },
      size: {
        sm: 'text-xs pb-0.5',
        md: 'text-sm pb-0.5',
      },
    },
    defaultVariants: { tone: 'clay', size: 'sm' },
  },
);

export interface TagProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone, size, className, ...rest },
  ref,
) {
  return <span ref={ref} className={cn(tagVariants({ tone, size }), className)} {...rest} />;
});

export { tagVariants };
