import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose Tailwind class names safely. Later classes override earlier ones
 * even when they target the same property.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
