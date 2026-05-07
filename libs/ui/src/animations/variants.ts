import type { Variants } from 'motion/react';
import { durations, easeMedina } from '../tokens';

/**
 * Reusable Framer Motion variants. Tied to the design system durations
 * and the shared easeMedina cubic-bezier curve.
 */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.base * 1.5, ease: [...easeMedina] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.base, ease: [...easeMedina] },
  },
};

export const stagger = (delayChildren = 0.1, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: { delayChildren, staggerChildren },
  },
});

export const cardLift: Variants = {
  rest: { y: 0, boxShadow: 'var(--shadow-soft)' },
  hover: {
    y: -4,
    boxShadow: 'var(--shadow-lift)',
    transition: { duration: durations.fast * 1.5, ease: [...easeMedina] },
  },
};

export const starSpin: Variants = {
  rest: { rotate: 0 },
  hover: {
    rotate: 22.5, // 1/16 tour, on retombe sur une branche voisine
    transition: { duration: durations.base * 1.25, ease: [...easeMedina] },
  },
};

export const imageZoom: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.04,
    transition: { duration: durations.base * 1.5, ease: [...easeMedina] },
  },
};
