import { Fragment, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useExperience } from '@/state/ExperienceContext';
import { useCinematicReveal } from '@/hooks/useCinematicReveal';
import {
  personalise,
  experiences,

} from '@/content/experienceMessages';
import type { StageMessage } from '@/content/experienceMessages';
import type { Category } from '@/content/eventConfig';

/** Style helper for the per-category accent custom property. */
const accentVar = (accent: string) => ({ '--accent': accent }) as CSSProperties;

function TitleLines({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          <span className="cine-line">{line}</span>
          {i < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </>
  );
}

/**
 * A full-screen cinematic scene (NOT a small glass card). Used for every
 * personalised path and their beats. The scene fills the viewport, the WebGL
 * background stays active behind it, and a soft vignette keeps text readable.
 */
function Scene({
  category,
  accent,
  children,
  revealKey,
}: {
  category: Category;
  accent: string;
  children: ReactNode;
  revealKey: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useCinematicReveal(ref, [revealKey]);

  return (
    <section
      className={`stage stage--scene stage--${category}`}
      style={accentVar(accent)}
      aria-label="Your experience"
    >
      <div className="scene__scrim" aria-hidden="true" />
      <div className="scene__inner" ref={ref}>
        {children}
      </div>
    </section>
  );
}

/** Kicker + headline + body + actions, composed full-screen. */
function SceneBody({
  message,
  name,
  onNext,
  onBack,
  extra,
}: {
  message: StageMessage;
  name: string;
  onNext: () => void;
  onBack?: () => void;
  extra?: ReactNode;
}) {
  return (
    <>
      {message.kicker && (
        <p className="scene__kicker" data-cine="kicker">
          {message.kicker}
        </p>
      )}
      <h2 className="scene__title" data-cine="heading">
        <TitleLines text={personalise(message.title, name)} />
      </h2>
      {personalise(message.body, name)
        .split(/\n\n+/)
        .map((paragraph, i, all) => (
          <p
            key={i}
            className="scene__body"
            data-cine="content"
            data-closing={all.length > 1 && i === all.length - 1 ? '' : undefined}
          >
            {paragraph}
          </p>
        ))}

      {extra}

      <div className="scene__actions" data-cine="actions">
        {onBack && (
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
        )}
        {message.actionLabel ? (
          <button type="button" className="enter-cta" onClick={onNext}>
            <span className="enter-cta__label">{message.actionLabel}</span>
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
        ) : null}
      </div>
    </>
  );
}

/** First-semester and faculty: a two-beat, full-screen personalised welcome. */
function SequentialStory({ category, accent }: { category: Category; accent: string }) {
  const { name, goToStage } = useExperience();
  const steps = experiences[category];
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const next = () => (isLast ? goToStage('invitation') : setIndex((i) => i + 1));
  const back = () => (index === 0 ? goToStage('category') : setIndex((i) => i - 1));

  return (
    <Scene category={category} accent={accent} revealKey={`${category}-${index}`}>
      <SceneBody message={step} name={name} onNext={next} onBack={back} />
    </Scene>
  );
}

const accents: Record<Category, string> = {
  first: '#ffb457',
  third: '#2f7dff',
  fifth: '#7b5cff',
  faculty: '#dbe7ff',
};

/** Routes the guest to their personalised full-screen experience (spec §11). */
export function PersonalizedExperience() {
  const { category } = useExperience();
  if (!category) return null;
  const accent = accents[category];


  return <SequentialStory category={category} accent={accent} />;
}
