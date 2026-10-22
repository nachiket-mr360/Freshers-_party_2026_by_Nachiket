import { useExperience } from '@/state/ExperienceContext';
import { eventInfo, eventTitleParts } from '@/content/eventConfig';
import { OpeningOverlay } from './OpeningOverlay';

/**
 * Hero stage overlay.
 *
 * Opening: tap starts the local soundtrack; countdown / ready copy follow
 * audio.currentTime. The extruded title is in the WebGL canvas.
 */
export function HeroExperience() {
  const { goToStage, completeIntro } = useExperience();

  const enter = () => {
    completeIntro();
    goToStage('name');
  };

  return (
    <section className="stage stage--hero" aria-label="Introduction">
      <h1 className="sr-only">
        {eventTitleParts.primary} {eventTitleParts.accent}
      </h1>

      <p className="hero-subline">
        {eventInfo.dateLabel} · {eventInfo.venue.name}, {eventInfo.venue.campus}
      </p>

      <OpeningOverlay onEnter={enter} />
    </section>
  );
}
