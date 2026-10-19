/**
 * Camera rig (spec §8 — Camera-Driven Transitions).
 *
 * Eases the camera between the per-stage stops so the whole site feels like one
 * continuous journey through the 3D world. Adds a gentle pointer parallax and
 * honours reduced-motion by shortening / flattening the movement.
 */

import { useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from '@/state/ExperienceContext';
import { cameraStops } from './sceneConfig';

interface Props {
  pointer: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
}

export function CameraRig({ pointer, reducedMotion }: Props) {
  const { stage } = useExperience();
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(...cameraStops.hero.lookAt));

  useFrame((state, delta) => {
    // Record normalised pointer for the background scene.
    pointer.current = { x: state.pointer.x, y: state.pointer.y };

    const stop = cameraStops[stage];
    const damp = reducedMotion ? 1 : 1.6;

    const parallax = reducedMotion ? 0 : 1;
    const targetX = stop.position[0] + state.pointer.x * 0.4 * parallax;
    const targetY = stop.position[1] + state.pointer.y * 0.3 * parallax;
    const targetZ = stop.position[2];

    const d = Math.min(delta, 0.1);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, damp, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, damp, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, damp, d);

    lookAt.current.x = THREE.MathUtils.damp(lookAt.current.x, stop.lookAt[0], damp, d);
    lookAt.current.y = THREE.MathUtils.damp(lookAt.current.y, stop.lookAt[1], damp, d);
    lookAt.current.z = THREE.MathUtils.damp(lookAt.current.z, stop.lookAt[2], damp, d);

    camera.lookAt(lookAt.current);
  });

  return null;
}
