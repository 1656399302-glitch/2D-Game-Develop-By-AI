import { useState, useEffect } from 'react';

/**
 * Custom hook to detect prefers-reduced-motion preference
 * Returns true if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * AC2: Check if RAF animation should be used as fallback
 */
export function shouldUseRAFAnimation(prefersReducedMotion: boolean): boolean {
  return prefersReducedMotion;
}

/**
 * AC2: Calculate stroke-dashoffset for RAF animation fallback
 */
export function calculateStrokeDashoffset(
  elapsed: number,
  dashLength: number,
  gapLength: number,
  speed: number = 1
): number {
  const cycleLength = dashLength + gapLength;
  const offset = (elapsed / 1000) * 100 * speed;
  return offset % cycleLength;
}
