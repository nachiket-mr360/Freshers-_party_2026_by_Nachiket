/** Experience-level types shared across state, scenes and UI. */

/** The six cinematic stages the camera travels through. */
export const STAGES = [
  'hero',
  'name',
  'category',
  'experience',
  'invitation',
  'finale',
] as const;

export type Stage = (typeof STAGES)[number];

export interface ExperienceState {
  stage: Stage;
  /** Trimmed guest name. Held in memory only for the session. */
  name: string;
  /** Selected visitor category, or null before it is chosen. */
  category: import('@/content/eventConfig').Category | null;
  /** True once the cinematic intro has been completed or skipped. */
  introDone: boolean;
}
