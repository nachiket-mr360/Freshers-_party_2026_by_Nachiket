import { useOpeningSequence } from '@/state/OpeningSequenceContext';

/**
 * Beat-synced hero overlay: tap-to-play, 3–2–1, spoken lines, LET'S GO!
 */
export function OpeningOverlay({ onEnter }: { onEnter: () => void }) {
  const {
    started,
    digit,
    showLadies,
    showReady,
    showLetsGo,
    flash,
    start,
    skip,
    playbackError,
  } = useOpeningSequence();

  return (
    <div className={`opening${flash ? ' is-flash' : ''}`}>
      <div className="opening__flash" aria-hidden="true" />

      <div className="opening__center">
        {!started && (
          <button type="button" className="enter-cta" onClick={() => void start()}>
            <span className="enter-cta__label">Tap to play</span>
          </button>
        )}

        {started && digit && !showLetsGo && (
          <p className="opening__digit" aria-live="assertive">
            {digit}
          </p>
        )}

        {started && showLadies && !showLetsGo && (
          <div className="opening__ready" aria-live="assertive">
            <p className="opening__ready-line">Ladies and Gentlemen</p>
            {showReady && <p className="opening__ready-line opening__ready-line--punch">Are you ready?!</p>}
          </div>
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

        {playbackError && (
          <p className="opening__note" role="status">
            {playbackError}
          </p>
        )}
      </div>

      {started && !showLetsGo && (
        <button type="button" className="skip-intro opening__skip" onClick={skip}>
          Skip intro
        </button>
      )}
    </div>
  );
}
