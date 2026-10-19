import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useExperience } from '@/state/ExperienceContext';
import { useEnterReveal } from '@/hooks/useEnterReveal';
import {
  personalise,
  experiences,
  fifthSemesterChoices,
  thirdSemesterMission,
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
        <span key={i}>
          {line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
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
  useEnterReveal(ref, [revealKey]);

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
        <p className="scene__kicker" data-enter>
          {message.kicker}
        </p>
      )}
      <h2 className="scene__title" data-enter>
        <TitleLines text={personalise(message.title, name)} />
      </h2>
      <p className="scene__body" data-enter>
        {personalise(message.body, name)}
      </p>

      {extra}

      <div className="scene__actions" data-enter>
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

/** Third-semester: a full-screen interactive "welcome the newcomers" mission. */
function ThirdMission({ accent }: { accent: string }) {
  const { name, goToStage } = useExperience();
  const [accepted, setAccepted] = useState(false);
  const [done, setDone] = useState<boolean[]>(() =>
    thirdSemesterMission.tasks.map(() => false),
  );

  const brief = experiences.third[0];
  const accept = experiences.third[1];
  const allDone = done.every(Boolean);

  const toggle = (i: number) => setDone((d) => d.map((v, idx) => (idx === i ? !v : v)));

  const checklist = (
    <ul className="scene__list" data-enter>
      {thirdSemesterMission.tasks.map((task, i) => (
        <li key={task}>
          <label className={`scene__check${done[i] ? ' is-done' : ''}`}>
            <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} />
            <span className="scene__box" aria-hidden="true" />
            <span>{task}</span>
          </label>
        </li>
      ))}
    </ul>
  );

  return (
    <Scene category="third" accent={accent} revealKey={accepted ? 'accepted' : 'brief'}>
      {!accepted ? (
        <>
          <p className="scene__kicker" data-enter>
            {brief.kicker}
          </p>
          <h2 className="scene__title" data-enter>
            <TitleLines text={personalise(brief.title, name)} />
          </h2>
          <p className="scene__body" data-enter>
            {personalise(brief.body, name)}
          </p>
          <p className="scene__prompt" data-enter>
            {thirdSemesterMission.prompt}
          </p>
          {checklist}
          <div className="scene__actions" data-enter>
            <button type="button" className="btn btn--ghost" onClick={() => goToStage('category')}>
              Back
            </button>
            <button type="button" className="enter-cta" onClick={() => setAccepted(true)}>
              <span className="enter-cta__label">{brief.actionLabel}</span>
            </button>
          </div>
        </>
      ) : (
        <SceneBody
          message={accept}
          name={name}
          onNext={() => goToStage('invitation')}
          onBack={() => setAccepted(false)}
          extra={
            allDone ? (
              <p className="scene__note" data-enter>
                All three marked. That is exactly how a batch becomes a family.
              </p>
            ) : null
          }
        />
      )}
    </Scene>
  );
}

/** Fifth-semester: a full-screen honesty check with three distinct reactions. */
function FifthExperience({ accent }: { accent: string }) {
  const { name, goToStage } = useExperience();
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const choice = fifthSemesterChoices.find((c) => c.id === choiceId) ?? null;
  const question = experiences.fifth[0];

  const reactAccent: Record<string, string> = {
    all: '#ffd58a',
    almost: '#8fb4ff',
    what: '#c99bff',
  };

  if (choice) {
    return (
      <Scene category="fifth" accent={reactAccent[choice.id] ?? accent} revealKey={choice.id}>
        <SceneBody
          message={choice.reaction}
          name={name}
          onNext={() => goToStage('invitation')}
          onBack={() => setChoiceId(null)}
        />
      </Scene>
    );
  }

  return (
    <Scene category="fifth" accent={accent} revealKey="question">
      <p className="scene__kicker" data-enter>
        {question.kicker}
      </p>
      <h2 className="scene__title" data-enter>
        <TitleLines text={personalise(question.title, name)} />
      </h2>
      <p className="scene__body" data-enter>
        {personalise(question.body, name)}
      </p>
      <div className="scene__choices" data-enter>
        {fifthSemesterChoices.map((c) => (
          <button key={c.id} type="button" className="scene__choice" onClick={() => setChoiceId(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="scene__actions" data-enter>
        <button type="button" className="btn btn--ghost" onClick={() => goToStage('category')}>
          Back
        </button>
      </div>
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

  if (category === 'fifth') return <FifthExperience accent={accent} />;
  if (category === 'third') return <ThirdMission accent={accent} />;
  return <SequentialStory category={category} accent={accent} />;
}
