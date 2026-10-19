import { useExperience } from '@/state/ExperienceContext';
import { HeroExperience } from './HeroExperience';
import { NameEntryForm } from './NameEntryForm';
import { CategorySelector } from './CategorySelector';
import { PersonalizedExperience } from './PersonalizedExperience';
import { EventInvitation } from './EventInvitation';
import { CreatorFinale } from './CreatorFinale';
import { FloatingGlassPanel } from './FloatingGlassPanel';
import type { Stage } from '@/state/types';

/** Visible recovery UI for an unexpected stage (spec §"safe stage fallbacks"). */
function RecoveryPanel() {
  const { goToStage, restart } = useExperience();
  return (
    <section className="stage stage--form" aria-label="Recovery">
      <FloatingGlassPanel className="panel panel--form" role="region" aria-label="Something went wrong">
        <p className="panel__kicker">Hmm, a step glitched</p>
        <h2 className="panel__title">Let's get you back on track.</h2>
        <div className="panel__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              restart();
              goToStage('name');
            }}
          >
            Return to name entry
          </button>
        </div>
      </FloatingGlassPanel>
    </section>
  );
}

function renderStage(stage: Stage) {
  switch (stage) {
    case 'hero':
      return <HeroExperience />;
    case 'name':
      return <NameEntryForm />;
    case 'category':
      return <CategorySelector />;
    case 'experience':
      return <PersonalizedExperience />;
    case 'invitation':
      return <EventInvitation />;
    case 'finale':
      return <CreatorFinale />;
    default:
      // Never leave the visitor staring at an empty background.
      if (import.meta.env.DEV) {
        console.warn('StageOverlay received unexpected stage:', stage);
      }
      return <RecoveryPanel />;
  }
}

/**
 * Renders the active stage overlay and mounts it immediately when the stage
 * changes — the content is never gated behind an animation callback (spec: the
 * app must stay functional even if a decorative animation fails). The keyed
 * inner wrapper replays a lightweight CSS enter animation for cinematic
 * continuity while the WebGL camera travels to the next stop behind it.
 */
export function StageOverlay() {
  const { stage } = useExperience();

  return (
    <div className="stage-overlay">
      <div className="stage-anim" key={stage}>
        {renderStage(stage)}
      </div>
    </div>
  );
}
