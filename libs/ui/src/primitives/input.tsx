import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const inputVariants = cva(
  [
    'block w-full bg-transparent border-0',
    'text-[color:var(--color-ink-900)] [font-family:var(--font-body)]',
    'placeholder:text-[color:var(--color-muted)] placeholder:italic placeholder:[font-family:var(--font-display)]',
    'focus:outline-none focus-visible:outline-none',
    'transition-colors duration-[var(--duration-fast)]',
  ].join(' '),
  {
    variants: {
      variant: {
        underline:
          'border-b border-[color:var(--color-ink-900)] pb-2 hover:border-[color:var(--color-clay-700)] focus:border-[color:var(--color-clay-700)]',
        boxed:
          'border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-3 py-2.5 rounded-[var(--radius-xs)] hover:border-[color:var(--color-clay-700)] focus:border-[color:var(--color-clay-700)]',
      },
      sizing: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: { variant: 'underline', sizing: 'md' },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant, sizing, className, type = 'text', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({ variant, sizing }), className)}
      {...rest}
    />
  );
});

export { inputVariants };
