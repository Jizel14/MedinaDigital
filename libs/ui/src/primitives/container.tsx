import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const containerVariants = cva('mx-auto px-6 md:px-10 lg:px-16', {
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      full: 'max-w-none',
    },
  },
  defaultVariants: { size: 'lg' },
});

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { className, size, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(containerVariants({ size }), className)} {...rest} />;
});

export { containerVariants };
