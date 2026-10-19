import { useEffect, useRef, useState } from 'react';
import { useExperience } from '@/state/ExperienceContext';
import { useReducedMotion } from '@/hooks/useEnvironment';
import { eventInfo, eventTitleParts } from '@/content/eventConfig';
import { INTRO_DURATION } from '@/scenes/sceneConfig';

/**
 * Hero stage overlay.
 *
 * The visible "FRESHERS 2026" is real extruded 3D typography rendered in the
 * WebGL canvas (HeroTitle3D) and turning 360°. This overlay only carries the
 * accessible title text, a subline and the single "enter" interaction. The
 * enter control is revealed on a timer matched to the intro, with a skip, so it
 * never depends on the 3D animation completing (spec: robust essential UI).
 */
export function HeroExperience() {
  const { introDone, goToStage, completeIntro } = useExperience();
  const reducedMotion = useReducedMotion();
  const instant = introDone || reducedMotion;
  const [settled, setSettled] = useState(instant);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (instant) return;
    // Reveal after the title turn (with a small tail), independent of the 3D.
    const id = window.setTimeout(() => setSettled(true), INTRO_DURATION * 1000 + 400);
    return () => window.clearTimeout(id);
  }, [instant]);

  useEffect(() => {
    if (settled) enterRef.current?.focus({ preventScroll: true });
  }, [settled]);

  const enter = () => {
    completeIntro();
    goToStage('name');
  };

  return (
    <section className="stage stage--hero" aria-label="Introduction">
      {/* Accessible, real text of the title (the visual is WebGL). */}
      <h1 className="sr-only">
        {eventTitleParts.primary} {eventTitleParts.accent}
      </h1>

      <p className="hero-subline">
        {eventInfo.dateLabel} · {eventInfo.venue.name}, {eventInfo.venue.campus}
      </p>

      <div className="hero-spacer" aria-hidden="true" />

      {settled ? (
        <button ref={enterRef} type="button" className="enter-cta" onClick={enter}>
          <span className="enter-cta__label">Enter the Experience</span>
          <span className="enter-cta__arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      ) : (
        <button type="button" className="skip-intro" onClick={() => setSettled(true)}>
          Skip intro
        </button>
      )}
    </section>
  );
}
