'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { StarOrnament } from '../brand/star-ornament';

const buttonVariants = cva(
  // base
  [
    'inline-flex items-center justify-center gap-2',
    'transition-[background-color,color,border-color,transform,box-shadow] duration-[var(--duration-fast)]',
    'ease-[var(--ease-medina)]',
    'cursor-pointer select-none',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'focus-visible:outline-2 focus-visible:outline-[color:var(--color-clay-700)] focus-visible:outline-offset-2',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-[color:var(--color-clay-700)] text-[color:var(--color-clay-100)] hover:bg-[color:var(--color-clay-800)] [font-family:var(--font-display)] italic font-semibold',
        secondary:
          'border-b-2 border-[color:var(--color-ink-900)] text-[color:var(--color-ink-900)] [font-family:var(--font-display)] italic font-semibold pb-1 hover:text-[color:var(--color-clay-700)] hover:border-[color:var(--color-clay-700)]',
        ghost:
          'text-[color:var(--color-ink-900)] hover:bg-[color:var(--color-clay-200)] [font-family:var(--font-body)] font-medium',
        ornament:
          'text-[color:var(--color-clay-700)] [font-family:var(--font-display)] italic font-semibold gap-3 hover:text-[color:var(--color-clay-800)]',
      },
      size: {
        sm: 'text-sm px-4 py-2 rounded-[var(--radius-xs)]',
        md: 'text-base px-6 py-3 rounded-[var(--radius-xs)]',
        lg: 'text-lg px-8 py-4 rounded-[var(--radius-xs)]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render as a child element (e.g. Next Link). */
  asChild?: boolean;
  /** Icon shown before the label (auto-flips for ornament variant). */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, asChild = false, leadingIcon, trailingIcon, children, className, ...rest },
  ref,
) {
  // Ornament variant gets the zellige star automatically as leading icon.
  const lead = leadingIcon ?? (variant === 'ornament' ? <StarOrnament size="1em" /> : null);
  const classes = cn(buttonVariants({ variant, size }), className);

  // asChild path forwards props to the single child element (e.g. Next Link).
  // Radix Slot requires exactly one React child, so we don't add wrapper nodes.
  if (asChild) {
    return (
      <Slot ref={ref} className={classes} {...rest}>
        {children}
      </Slot>
    );
  }

  return (
    <button ref={ref} className={classes} {...rest}>
      {lead}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
});

export { buttonVariants };
