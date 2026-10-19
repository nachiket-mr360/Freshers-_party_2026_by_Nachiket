import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useExperience } from '@/state/ExperienceContext';
import { useReducedMotion } from '@/hooks/useEnvironment';
import { creatorCredit } from '@/content/eventConfig';

/**
 * Cinematic creator-credit finale (spec §13 — E2 + E3).
 *
 * The WebGL gold particle signature gathers behind this overlay while the exact
 * credit ("MADE BY" then "NACHIKET MR.360") is revealed with a light sweep.
 * The text stays fully readable and is real HTML. A working replay is offered.
 */
export function CreatorFinale() {
  const { restart, goToStage } = useExperience();
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const creditRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = creditRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const lines = creditRef.current?.querySelectorAll('.finale__line') ?? [];
      if (reducedMotion) {
        gsap.set(lines, { opacity: 1, y: 0 });
        gsap.set('.finale__sweep', { opacity: 0 });
        return;
      }
      gsap.set(lines, { opacity: 0, y: 26 });
      const tl = gsap.timeline();
      tl.to('.finale__veil', { opacity: 1, duration: 1.1, ease: 'power2.out' })
        .to(lines[0], { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
        .to(lines[1], { opacity: 1, y: 0, duration: 1.1, ease: 'power4.out' }, '-=0.3')
        .fromTo(
          '.finale__sweep',
          { xPercent: -130, opacity: 0.9 },
          { xPercent: 130, opacity: 0.9, duration: 1.4, ease: 'power2.inOut' },
          '-=0.5',
        )
        .to('.finale__sweep', { opacity: 0, duration: 0.5 });
    }, rootRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  const replay = () => {
    restart();
    goToStage('hero');
  };

  return (
    <section className="stage stage--finale" aria-label="Credits">
      <div ref={rootRef} className="finale">
        <div className="finale__veil" aria-hidden="true" />
        <div className="finale__credit" ref={creditRef}>
          <p className="finale__line finale__line--made">{creatorCredit.madeBy}</p>
          <h2 className="finale__line finale__line--name">{creatorCredit.name}</h2>
          {/* Accessible, exact full credit for assistive tech. */}
          <span className="sr-only">{creatorCredit.full}</span>
          <div className="finale__sweep" aria-hidden="true" />
        </div>

        <div className="finale__controls">
          <button type="button" className="btn btn--ghost" onClick={() => goToStage('invitation')}>
            View invitation again
          </button>
          <button type="button" className="btn btn--primary" onClick={replay}>
            Replay the experience
          </button>
        </div>
      </div>
    </section>
  );
}
