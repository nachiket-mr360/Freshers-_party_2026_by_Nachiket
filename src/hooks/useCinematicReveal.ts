/**
 * Cinematic message reveal.
 *
 * A single GSAP timeline drives one personalised scene:
 * kicker fade-up → 3D heading roll → rectangular mask wipe on each paragraph
 * → closing-line blur-to-clear → action row. Everything runs off `transform`,
 * `opacity`, `clip-path` and a short one-off `filter` tween, so no layout is
 * measured or mutated per frame.
 *
 * Each scene calls this with a `revealKey`; switching beats reverts the old
 * timeline before the new one starts, which prevents overlap on rapid
 * navigation. Reduced motion collapses the whole sequence to an instant reveal.
 */

import { useLayoutEffect, type DependencyList, type RefObject } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from './useEnvironment';

const HEADING_LEAD = 0.1;
const CONTENT_LEAD = 0.5;
const CONTENT_STAGGER = 0.12;
const CONTENT_DURATION = 0.9;

export function useCinematicReveal(
  ref: RefObject<HTMLElement | null>,
  deps: DependencyList = [],
): void {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const kickers = gsap.utils.toArray<HTMLElement>('[data-cine="kicker"]', root);
      const heading = root.querySelector<HTMLElement>('[data-cine="heading"]');
      const lines = heading
        ? gsap.utils.toArray<HTMLElement>('.cine-line', heading)
        : [];
      const headingTargets = lines.length ? lines : heading ? [heading] : [];
      const paragraphs = gsap.utils.toArray<HTMLElement>('[data-cine="content"]', root);
      const closing = root.querySelector<HTMLElement>('[data-cine="content"][data-closing]');
      const actions = root.querySelector<HTMLElement>('[data-cine="actions"]');

      if (reducedMotion) {
        gsap.set(
          [...kickers, ...headingTargets, ...paragraphs, ...(actions ? [actions] : [])],
          { autoAlpha: 1, x: 0, y: 0, rotationX: 0, clipPath: 'none', filter: 'none' },
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (kickers.length) {
        tl.fromTo(
          kickers,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.06 },
          0,
        );
      }

      if (headingTargets.length) {
        gsap.set(headingTargets, {
          transformPerspective: 900,
          transformOrigin: '50% 100%',
          rotationX: -62,
          yPercent: 34,
          autoAlpha: 0,
        });
        tl.to(
          headingTargets,
          {
            rotationX: 0,
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.78,
            stagger: 0.07,
          },
          HEADING_LEAD,
        );
      }

      if (paragraphs.length) {
        gsap.set(paragraphs, {
          clipPath: 'inset(0% 100% 0% 0%)',
          autoAlpha: 1,
        });
        tl.to(
          paragraphs,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: CONTENT_DURATION,
            stagger: CONTENT_STAGGER,
            ease: 'power2.inOut',
            onComplete: () => gsap.set(paragraphs, { clipPath: 'none' }),
          },
          CONTENT_LEAD,
        );
      }

      const contentEnd =
        CONTENT_LEAD +
        CONTENT_DURATION +
        Math.max(0, paragraphs.length - 1) * CONTENT_STAGGER;

      // The final paragraph is the emotional beat; it already arrived through
      // the mask, so the emphasis starts as that wipe lands.
      if (closing) {
        gsap.set(closing, { filter: 'blur(7px)', autoAlpha: 0.55 });
        tl.to(
          closing,
          {
            filter: 'blur(0px)',
            autoAlpha: 1,
            duration: 0.55,
            ease: 'power2.out',
            onComplete: () => gsap.set(closing, { clearProps: 'filter' }),
          },
          CONTENT_LEAD + Math.max(0, paragraphs.length - 1) * CONTENT_STAGGER + 0.35,
        );
      }

      if (actions) {
        gsap.set(actions, { autoAlpha: 0, y: 16 });
        tl.to(actions, { autoAlpha: 1, y: 0, duration: 0.45 }, contentEnd + 0.05);
      }
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, ...deps]);
}
