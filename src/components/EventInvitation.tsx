import { useRef } from 'react';
import { useExperience } from '@/state/ExperienceContext';
import { useEnterReveal } from '@/hooks/useEnterReveal';
import { eventInfo, eventTitleParts } from '@/content/eventConfig';

/**
 * Event invitation — a full-screen cinematic composition (spec §12), not a
 * small card. Event facts are arranged directly in the scene with a clear
 * hierarchy and revealed in stages. Kept as real HTML for accessibility.
 */
export function EventInvitation() {
  const { name, goToStage } = useExperience();
  const ref = useRef<HTMLDivElement>(null);
  useEnterReveal(ref);

  return (
    <section className="stage stage--scene stage--invitation" aria-label="The invitation">
      <div className="scene__scrim" aria-hidden="true" />
      <div className="scene__inner" ref={ref}>
        <p className="invitation__personal" data-enter>
          {name ? `${name}, you are invited` : 'You are invited'}
        </p>

        <h2 className="invitation__title" data-enter>
          <span className="invitation__title-primary">{eventTitleParts.primary}</span>
          <span className="invitation__title-accent">{eventTitleParts.accent}</span>
        </h2>

        <dl className="invitation__details">
          <div className="invitation__detail" data-enter>
            <dt>Date</dt>
            <dd>{eventInfo.dateLabel}</dd>
          </div>
          <div className="invitation__detail" data-enter>
            <dt>Time</dt>
            <dd>{eventInfo.timeLabel}</dd>
          </div>
          <div className="invitation__detail" data-enter>
            <dt>Venue</dt>
            <dd>
              {eventInfo.venue.name}
              <br />
              {eventInfo.venue.campus}
            </dd>
          </div>
        </dl>

        <div className="invitation__organizer" data-enter>
          <span className="invitation__organizer-label">Organized by</span>
          <p className="invitation__organizer-name">
            <strong>{eventInfo.organizer.line1}</strong> — {eventInfo.organizer.line2}
          </p>
        </div>

        <div className="scene__actions" data-enter>
          <button type="button" className="btn btn--ghost" onClick={() => goToStage('experience')}>
            Back
          </button>
          <button type="button" className="enter-cta" onClick={() => goToStage('finale')}>
            <span className="enter-cta__label">Continue</span>
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
        </div>
      </div>
    </section>
  );
}
