/**
 * Cue times for the experimental opening, measured from
 * `public/music/hero entry.mpeg` (decoded PCM energy / onset peaks).
 *
 * Track duration ≈ 8.61s, 128 kbps MPEG-1 Layer III, 44.1 kHz.
 * Strong onsets at 1.91 / 2.29 / 2.68 s (~0.38 s apart) map to 3–2–1.
 * Voice-band energy returns ~4.50 s; the drop cluster starts ~6.20 s.
 */
export const OPENING_AUDIO_FILE = 'hero entry.mpeg';

export const OPENING_AUDIO_SRC = `${import.meta.env.BASE_URL}music/${encodeURIComponent(OPENING_AUDIO_FILE)}`;

export const OPENING_CUES = {
  three: 1.91,
  two: 2.29,
  one: 2.68,
  ready: 4.5,
  title: 6.2,
} as const;
