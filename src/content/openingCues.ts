/**
 * Cue times from `public/music/hero entry.mp3`
 * (identical bytes to `hero entry.mpeg`; .mp3 so browsers treat it as audio).
 *
 * Duration ≈ 8.61s. Onsets at 1.91 / 2.29 / 2.68 s → 3–2–1.
 * Energy returns ~4.50 s (spoken lead-in) and ~5.30 s (second vocal punch).
 * Drop cluster ~6.20 s.
 */
export const OPENING_AUDIO_FILE = 'hero entry.mp3';

export const OPENING_AUDIO_SRC = `${import.meta.env.BASE_URL}music/${encodeURIComponent(OPENING_AUDIO_FILE)}`;

export const OPENING_CUES = {
  three: 1.91,
  two: 2.29,
  one: 2.68,
  ladies: 4.5,
  ready: 5.3,
  title: 6.2,
} as const;
