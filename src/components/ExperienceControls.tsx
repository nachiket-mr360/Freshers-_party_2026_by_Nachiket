import { useExperience } from '@/state/ExperienceContext';
import { eventTitle } from '@/content/eventConfig';
import type { Stage } from '@/state/types';

// Ordered, reachable steps (hero + finale excluded from the meter).
const steps: { stage: Stage; label: string }[] = [
  { stage: 'name', label: 'Name' },
  { stage: 'category', label: 'Group' },
  { stage: 'experience', label: 'Welcome' },
  { stage: 'invitation', label: 'Invitation' },
];

/**
 * Discreet journey chrome shown after the intro. A brand mark, a readable
 * progress meter and a working "start over". Never a heavy navigation bar and
 * never visible during the hero (spec §6).
 */
export function ExperienceControls() {
  const { stage, introDone, restart, goToStage } = useExperience();

  if (!introDone || stage === 'hero') return null;

  const currentIndex = steps.findIndex((s) => s.stage === stage);

  return (
    <div className="controls" aria-hidden={stage === 'finale'}>
      <p className="controls__brand">{eventTitle}</p>

      {stage !== 'finale' && currentIndex >= 0 && (
        <ol className="controls__meter" aria-label="Progress">
          {steps.map((s, i) => (
            <li
              key={s.stage}
              className={`controls__dot${i === currentIndex ? ' is-active' : ''}${i < currentIndex ? ' is-done' : ''}`}
            >
              <span className="sr-only">
                {s.label}
                {i === currentIndex ? ' (current)' : ''}
              </span>
            </li>
          ))}
        </ol>
      )}

      {stage !== 'finale' && (
        <button
          type="button"
          className="controls__restart"
          onClick={() => {
            restart();
            goToStage('hero');
          }}
        >
          Start over
        </button>
      )}
    </div>
  );
}
