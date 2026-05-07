'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks the user's prefers-reduced-motion media query, with SSR-safe default
 * (false). Components use this to swap rich animations for fades or no-op.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}
