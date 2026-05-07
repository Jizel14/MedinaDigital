import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const cardVariants = cva(
  'overflow-hidden bg-[color:var(--color-card)] text-[color:var(--color-fg)]',
  {
    variants: {
      variant: {
        default:
          'rounded-[var(--radius-sm)_var(--radius-sm)_var(--radius-xl)_var(--radius-sm)] shadow-[var(--shadow-soft)]',
        flat: 'rounded-[var(--radius-sm)] border border-[color:var(--color-border)]',
        lift: 'rounded-[var(--radius-sm)_var(--radius-sm)_var(--radius-xl)_var(--radius-sm)] shadow-[var(--shadow-card)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(cardVariants({ variant }), className)} {...rest} />;
});

export const CardImage = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardImage({ className, ...rest }, ref) {
    return <div ref={ref} className={cn('w-full', className)} {...rest} />;
  },
);

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cn('p-4 md:p-5', className)} {...rest} />;
  },
);

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...rest }, ref) {
    return (
      <h3
        ref={ref}
        className={cn(
          '[font-family:var(--font-display)] italic font-semibold text-[color:var(--color-ink-900)] leading-tight',
          className,
        )}
        style={{ fontSize: 'var(--text-xl)' }}
        {...rest}
      />
    );
  },
);

export const CardMeta = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardMeta({ className, ...rest }, ref) {
    return (
      <p
        ref={ref}
        className={cn(
          'text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)] mt-1',
          className,
        )}
        {...rest}
      />
    );
  },
);

export { cardVariants };
