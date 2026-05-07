'use client';

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../lib/cn';

export const SelectRoot = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex w-full items-center justify-between gap-2 px-3 py-2',
        'border-b border-[color:var(--color-ink-900)] bg-transparent',
        'text-[color:var(--color-ink-900)] [font-family:var(--font-body)] text-base',
        'hover:border-[color:var(--color-clay-700)]',
        'focus-visible:outline-2 focus-visible:outline-[color:var(--color-clay-700)] focus-visible:outline-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'data-[placeholder]:text-[color:var(--color-muted)] data-[placeholder]:italic data-[placeholder]:[font-family:var(--font-display)]',
        className,
      )}
      {...rest}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <span aria-hidden className="text-xs opacity-60">
          ▾
        </span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = 'popper', ...rest }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
          'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden bg-[color:var(--color-card)] shadow-[var(--shadow-card)]',
          'rounded-[var(--radius-sm)] border border-[color:var(--color-border)]',
          className,
        )}
        {...rest}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none',
        'text-[color:var(--color-ink-900)]',
        'data-[highlighted]:bg-[color:var(--color-clay-200)]',
        'data-[state=checked]:text-[color:var(--color-clay-700)] data-[state=checked]:italic data-[state=checked]:[font-family:var(--font-display)]',
        className,
      )}
      {...rest}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
