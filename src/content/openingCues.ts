/**
 * Opening cues from `audio.currentTime` of `public/music/hero entry.mp3`.
 *
 * Countdown and Ladies timings are locked (working).
 * "Are you ready?!" at 4.875 s (4.475 s burst + 0.4 s). Hold through
 * ~5.80 s. Title waits TITLE_DELAY_AFTER_READY_S after that.
 */
export const OPENING_AUDIO_FILE = 'hero entry.mp3';

export const OPENING_AUDIO_SRC = `${import.meta.env.BASE_URL}music/${encodeURIComponent(OPENING_AUDIO_FILE)}`;

/** Seconds to wait after "Are you ready?!" finishes before the 3D title. */
export const TITLE_DELAY_AFTER_READY_S = 1.5;

export const OPENING_CUES = {
  three: 0,
  two: 0.7,
  one: 1.4,
  countdownEnd: 2.1,
  ladies: 2.1,
  /** 4.475 s onset + 0.4 s so the line hits with the spoken "Are you ready?!" */
  ready: 4.475,
  readyEnd: 6.5,
  title: 6.5 + TITLE_DELAY_AFTER_READY_S,
} as const;
