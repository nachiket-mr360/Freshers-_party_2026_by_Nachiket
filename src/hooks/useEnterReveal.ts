/**
 * Reveal helper — animates any descendant marked with [data-enter] when a panel
 * mounts, in order, with a cinematic ease. Collapses to an instant reveal when
 * the user prefers reduced motion. Always cleaned up on unmount (spec §17).
 */

import { useLayoutEffect, type DependencyList, type RefObject } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from './useEnvironment';

export function useEnterReveal(
  ref: RefObject<HTMLElement | null>,
  deps: DependencyList = [],
): void {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-enter]');
      if (!items.length) return;

      if (reducedMotion) {
        gsap.set(items, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.09 },
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, ...deps]);
}
