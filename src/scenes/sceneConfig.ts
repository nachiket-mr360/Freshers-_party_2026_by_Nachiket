/** Shared tuning values for the WebGL scene: palette + camera staging. */

import type { Stage } from '@/state/types';

export const palette = {
  background: '#05060a',
  fog: '#070a14',
  violet: '#7b5cff',
  electric: '#2f7dff',
  coolWhite: '#dbe7ff',
  gold: '#f3c675',
  amber: '#ffb457',
} as const;

/**
 * Camera staging per cinematic stage: position the camera flies to and the
 * point it looks at. Keeps the whole site inside one continuous 3D world
 * (spec §8) rather than unrelated sections.
 */
export interface CameraStop {
  position: [number, number, number];
  lookAt: [number, number, number];
}

export const cameraStops: Record<Stage, CameraStop> = {
  hero: { position: [0, 0, 11], lookAt: [0, 0, 0] },
  name: { position: [2.2, 0.4, 8.5], lookAt: [-0.5, 0, 0] },
  category: { position: [-2.4, 0.6, 8.2], lookAt: [0.6, 0, 0] },
  experience: { position: [0.4, -0.3, 7.4], lookAt: [0, 0.2, -1] },
  invitation: { position: [0, 0.5, 9.5], lookAt: [0, 0, -2] },
  finale: { position: [0, 0, 12.5], lookAt: [0, 0, -4] },
};

/** Length of the hero 360° title turn; the DOM "enter" reveal is timed to it. */
export const INTRO_DURATION = 4.6;
