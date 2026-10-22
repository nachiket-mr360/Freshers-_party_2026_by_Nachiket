import { useOpeningSequence } from '@/state/OpeningSequenceContext';

/**
 * Beat-synced hero overlay: tap-to-start, 3–2–1, ARE YOU READY?!, LET'S GO!
 * The 3D title lives in the canvas; this layer is HTML only.
 */
export function OpeningOverlay({ onEnter }: { onEnter: () => void }) {
  const { started, digit, showReady, showLetsGo, flash, start, skip, audioBlocked } =
    useOpeningSequence();

  return (
    <div className={`opening${flash ? ' is-flash' : ''}`}>
      <div className="opening__flash" aria-hidden="true" />

      {!started && (
        <button type="button" className="enter-cta" onClick={start}>
          <span className="enter-cta__label">Tap to begin</span>
        </button>
      )}

      {started && digit && !showLetsGo && (
        <p className="opening__digit" aria-live="assertive">
          {digit}
        </p>
      )}

      {started && showReady && !showLetsGo && (
        <p className="opening__ready" aria-live="assertive">
          Ladies and Gentlemen ARE YOU READY?!
        </p>
      )}

      {started && !showLetsGo && (
        <button type="button" className="skip-intro" onClick={skip}>
          Skip intro
        </button>
      )}

      {showLetsGo && (
        <button type="button" className="enter-cta" onClick={onEnter}>
          <span className="enter-cta__label">Let&apos;s go!</span>
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
      )}

      {audioBlocked && started && !showLetsGo && (
        <p className="opening__note">Playing without sound</p>
      )}
    </div>
  );
}
