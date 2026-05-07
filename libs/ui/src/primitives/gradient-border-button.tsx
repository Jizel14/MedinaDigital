'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { StarOrnament } from '../brand/star-ornament';

/**
 * GradientBorderButton — signature CTA with a Médina-palette conic gradient
 * border that rotates on hover. Static border at rest (clean look), then on
 * hover the border becomes a rotating conic gradient (terracotta → olive →
 * copper → sand), and a soft warm glow appears around the button.
 *
 * Built on a two-layer technique: an outer wrapper carries the gradient
 * background; the inner element sits on top with the page background colour
 * and a slim transparent margin, exposing only a thin ring of gradient.
 * Asymmetric radius 4 4 32 4 (signature) is preserved on both layers.
 *
 * Use for hero CTAs and 'showcase' moments. For everyday actions stick with
 * the regular Button primitive.
 */

const wrapperVariants = cva(
  // Wrapper holds the gradient surface.
  [
    'group relative inline-block isolate',
    'transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-medina)]',
    'hover:-translate-y-0.5',
    // Asymmetric radius signature, 4 4 32 4 by default.
    '[border-radius:var(--radius-sm)_var(--radius-sm)_var(--radius-xl)_var(--radius-sm)]',
  ].join(' '),
  {
    variants: {
      glow: {
        true: 'hover:shadow-[0_8px_28px_-12px_oklch(from_var(--color-clay-700)_l_c_h_/_0.55)]',
        false: '',
      },
    },
    defaultVariants: { glow: true },
  },
);

const buttonInnerVariants = cva(
  // Inner sits on top, leaves the wrapper visible on the edges via margin.
  [
    'relative inline-flex items-center justify-center gap-2',
    '[font-family:var(--font-display)] italic font-semibold',
    'select-none cursor-pointer outline-none',
    'transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-medina)]',
    // The visible asymmetric corners on the inner panel — slightly tighter
    // than the wrapper so the gradient ring is clean on the long corner.
    '[border-radius:var(--radius-xs)_var(--radius-xs)_calc(var(--radius-xl)_-_var(--spacing-1))_var(--radius-xs)]',
  ].join(' '),
  {
    variants: {
      tone: {
        primary:
          'bg-[color:var(--color-clay-700)] text-[color:var(--color-clay-100)] hover:bg-[color:var(--color-clay-800)]',
        light:
          'bg-[color:var(--color-clay-100)] text-[color:var(--color-clay-700)] hover:bg-[color:var(--color-clay-50)]',
        ghost:
          'bg-[color:var(--color-bg)] text-[color:var(--color-ink-900)] hover:text-[color:var(--color-clay-700)]',
      },
      size: {
        sm: 'm-[1.5px] px-5 py-2 text-sm',
        md: 'm-[2px] px-6 py-3 text-base',
        lg: 'm-[2px] px-8 py-4 text-lg',
      },
    },
    defaultVariants: { tone: 'primary', size: 'md' },
  },
);

export interface GradientBorderButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof buttonInnerVariants>,
    VariantProps<typeof wrapperVariants> {
  /** Render the wrapper around a Slot child (e.g. Next Link). */
  asChild?: boolean;
  children?: ReactNode;
  /** Show the leading zellige star ornament. */
  withOrnament?: boolean;
}

export const GradientBorderButton = forwardRef<HTMLButtonElement, GradientBorderButtonProps>(
  function GradientBorderButton(
    { tone, size, glow, asChild = false, withOrnament = false, children, className, ...rest },
    ref,
  ) {
    return (
      <span
        // Wrapper is a plain span (so it doesn't break Slot semantics).
        // The conic gradient is painted on this layer.
        className={cn(wrapperVariants({ glow }), className)}
        style={{
          // Static idle border: a flat clay-700 colour. Replaced with the
          // rotating conic gradient on hover via the ::after pseudo-element.
          backgroundColor: 'var(--color-clay-700)',
          backgroundImage: `conic-gradient(
              from var(--gradient-angle, 0deg),
              var(--color-clay-700) 0deg,
              var(--color-olive-700) 90deg,
              var(--color-clay-500) 180deg,
              var(--color-clay-300) 270deg,
              var(--color-clay-700) 360deg
            )`,
        }}
      >
        {/* The animated angle property — drives the gradient rotation. */}
        <style>{`
          @property --gradient-angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes medina-spin-gradient {
            to { --gradient-angle: 360deg; }
          }
          .medina-gbb:hover {
            animation: medina-spin-gradient 4s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .medina-gbb:hover { animation: none; }
          }
        `}</style>
        <span
          aria-hidden
          className="medina-gbb absolute inset-0 -z-10 [border-radius:inherit]"
          style={{
            // This sibling layer carries the actual rotating gradient on hover,
            // sitting under the inner button so the rotation is visible only
            // on the exposed margin.
            backgroundImage: `conic-gradient(
                from var(--gradient-angle),
                var(--color-clay-700) 0deg,
                var(--color-olive-700) 90deg,
                var(--color-clay-500) 180deg,
                var(--color-clay-300) 270deg,
                var(--color-clay-700) 360deg
              )`,
          }}
        />
        {asChild ? (
          // Slot mode: forwards class + ref to the single child element
          // (e.g. Next Link). To preserve the leading ornament, we don't
          // pass it as a sibling — the consumer can include it inside their
          // Link manually if they want it. For most CTAs we add the ornament
          // automatically via the ::before pseudo on the inner element.
          <Slot
            ref={ref}
            className={cn(
              buttonInnerVariants({ tone, size }),
              withOrnament &&
                "before:content-['✦'] before:me-2 before:text-[0.9em] before:opacity-90 before:transition-transform before:duration-[var(--duration-base)] before:ease-[var(--ease-medina)] hover:before:rotate-[22.5deg] before:inline-block",
            )}
            {...rest}
          >
            {children}
          </Slot>
        ) : (
          <button ref={ref} className={cn(buttonInnerVariants({ tone, size }))} {...rest}>
            {withOrnament && (
              <StarOrnament
                size="0.95em"
                className="opacity-90 transition-transform duration-[var(--duration-base)] ease-[var(--ease-medina)] group-hover:rotate-[22.5deg]"
              />
            )}
            <span>{children}</span>
          </button>
        )}
      </span>
    );
  },
);

export { wrapperVariants as gradientBorderWrapperVariants };
