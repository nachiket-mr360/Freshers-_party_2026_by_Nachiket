import { useLayoutEffect, useRef, useState } from 'react';
import { FloatingGlassPanel } from './FloatingGlassPanel';
import { useExperience } from '@/state/ExperienceContext';
import { useEnterReveal } from '@/hooks/useEnterReveal';
import { sanitizeName } from '@/utils/text';

/**
 * Name entry (spec §10). Real, accessible HTML form controls over the glass
 * surface. Empty input is handled inline; the value is sanitised, kept in
 * memory only, and used to personalise the rest of the experience.
 */
export function NameEntryForm() {
  const { name, setName, goToStage } = useExperience();
  const [value, setValue] = useState(name);
  const [error, setError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEnterReveal(panelRef);
  useLayoutEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeName(value);
    if (!clean) {
      setError('Please enter your name to continue.');
      inputRef.current?.focus();
      return;
    }
    setError('');
    setName(clean);
    goToStage('category');
  };

  return (
    <section className="stage stage--form" aria-label="Your name">
      <FloatingGlassPanel className="panel panel--form" role="region" aria-label="Name entry">
        <div ref={panelRef}>
          <p className="panel__kicker" data-enter>
            Before we begin
          </p>
          <h2 className="panel__title" data-enter>
            What should we call you?
          </h2>

          <form className="field" onSubmit={submit} noValidate>
            <label className="field__label" htmlFor="guest-name" data-enter>
              Your name
            </label>
            <div className="field__control" data-enter>
              <input
                id="guest-name"
                ref={inputRef}
                className="field__input"
                type="text"
                name="name"
                autoComplete="given-name"
                maxLength={40}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Ana"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'name-error' : undefined}
              />
              <span className="field__glow" aria-hidden="true" />
            </div>

            {error && (
              <p className="field__error" id="name-error" role="alert">
                {error}
              </p>
            )}

            <div className="panel__actions" data-enter>
              <button type="submit" className="btn btn--primary">
                Continue
              </button>
            </div>
          </form>

          <p className="panel__note" data-enter>
            Your name is used only to personalise this invitation. Nothing is
            uploaded or stored.
          </p>
        </div>
      </FloatingGlassPanel>
    </section>
  );
}
