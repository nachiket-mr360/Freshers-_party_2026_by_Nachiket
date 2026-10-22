import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from './useEnvironment';

/**
 * One invitation entrance (~2.2 s). Reverted on unmount so returning to the
 * screen replays cleanly without leftover transforms.
 */
export function useInvitationReveal(ref: RefObject<HTMLElement | null>): void {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const greeting = root.querySelector('[data-inv="greeting"]');
      const freshers = root.querySelector('[data-inv="freshers"]');
      const year = root.querySelector('[data-inv="year"]');
      const sweep = root.querySelector('[data-inv="sweep"]');
      const details = gsap.utils.toArray<HTMLElement>('[data-inv="detail"]', root);
      const countdown = root.querySelector('[data-inv="countdown"]');
      const organizer = root.querySelector('[data-inv="organizer"]');
      const actions = root.querySelector('[data-inv="actions"]');

      const all = [greeting, freshers, year, ...details, countdown, organizer, actions].filter(
        Boolean,
      ) as HTMLElement[];

      if (reducedMotion) {
        gsap.set(all, { autoAlpha: 1, y: 0, yPercent: 0, rotationX: 0 });
        if (sweep) gsap.set(sweep, { autoAlpha: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (greeting) {
        gsap.set(greeting, { autoAlpha: 0, y: 14 });
        tl.to(greeting, { autoAlpha: 1, y: 0, duration: 0.4 }, 0);
      }

      if (freshers) {
        gsap.set(freshers, {
          transformPerspective: 900,
          transformOrigin: '50% 100%',
          rotationX: -58,
          yPercent: 28,
          autoAlpha: 0,
        });
        tl.to(freshers, { rotationX: 0, yPercent: 0, autoAlpha: 1, duration: 0.72 }, 0.18);
      }

      if (year) {
        gsap.set(year, { autoAlpha: 0, y: 18 });
        tl.to(year, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.42);
      }

      if (sweep && year) {
        gsap.set(sweep, { xPercent: -120, autoAlpha: 0.85 });
        tl.to(sweep, { xPercent: 120, duration: 0.9, ease: 'power2.inOut' }, 0.55);
        tl.to(sweep, { autoAlpha: 0, duration: 0.25 }, 1.35);
      }

      if (details.length) {
        gsap.set(details, { autoAlpha: 0, y: 16 });
        tl.to(details, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 }, 0.85);
      }

      if (countdown) {
        gsap.set(countdown, { autoAlpha: 0, y: 14 });
        tl.to(countdown, { autoAlpha: 1, y: 0, duration: 0.45 }, 1.15);
      }

      if (organizer) {
        gsap.set(organizer, { autoAlpha: 0, y: 12 });
        tl.to(organizer, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.45);
      }

      if (actions) {
        gsap.set(actions, { autoAlpha: 0, y: 12 });
        tl.to(actions, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.7);
      }
    }, root);

    return () => ctx.revert();
  }, [reducedMotion]);
}
