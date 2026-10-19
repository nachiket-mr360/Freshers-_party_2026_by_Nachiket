import { useRef, useState } from 'react';
import { FloatingGlassPanel } from './FloatingGlassPanel';
import { useExperience } from '@/state/ExperienceContext';
import { useEnterReveal } from '@/hooks/useEnterReveal';
import { categories, categoryLabels, type Category } from '@/content/eventConfig';

const descriptions: Record<Category, string> = {
  first: 'New to campus — this one is your welcome.',
  third: 'Here to welcome the new batch.',
  fifth: 'Final stretch — and a little honesty check.',
  faculty: 'Our respected faculty guest.',
};

/**
 * Category selection (spec §10). Real radio controls (keyboard + screen-reader
 * friendly) dressed as floating-glass tiles. Selection is visually obvious and
 * the guest can return and change it without reloading.
 */
export function CategorySelector() {
  const { name, category, setCategory, goToStage } = useExperience();
  const [selected, setSelected] = useState<Category | null>(category);
  const panelRef = useRef<HTMLDivElement>(null);
  useEnterReveal(panelRef);

  const choose = (c: Category) => {
    setSelected(c);
    setCategory(c);
  };

  const continueOn = () => {
    if (!selected) return;
    goToStage('experience');
  };

  return (
    <section className="stage stage--form" aria-label="Choose your group">
      <FloatingGlassPanel className="panel panel--category" role="region" aria-label="Category selection">
        <div ref={panelRef}>
          <p className="panel__kicker" data-enter>
            {name ? `Nice to meet you, ${name}.` : 'Nice to meet you.'}
          </p>
          <h2 className="panel__title" data-enter>
            Which group are you with?
          </h2>

          <fieldset className="category-grid" data-enter>
            <legend className="sr-only">Select your category</legend>
            {categories.map((c) => (
              <label key={c} className={`category-tile${selected === c ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="category"
                  value={c}
                  checked={selected === c}
                  onChange={() => choose(c)}
                />
                <span className="category-tile__inner">
                  <span className="category-tile__check" aria-hidden="true" />
                  <span className="category-tile__label">{categoryLabels[c]}</span>
                  <span className="category-tile__desc">{descriptions[c]}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="panel__actions" data-enter>
            <button type="button" className="btn btn--ghost" onClick={() => goToStage('name')}>
              Back
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={continueOn}
              disabled={!selected}
            >
              Continue
            </button>
          </div>
        </div>
      </FloatingGlassPanel>
    </section>
  );
}
