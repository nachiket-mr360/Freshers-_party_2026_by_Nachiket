/**
 * Particle signature finale (spec §13 — E3).
 *
 * Gold dust scatters, then gathers toward a luminous band behind the creator
 * credit. Mounted only during the finale stage so its cost is isolated.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { palette } from './sceneConfig';

interface Props {
  lowPower: boolean;
  reducedMotion: boolean;
}

export function ParticleSignature({ lowPower, reducedMotion }: Props) {
  const count = lowPower ? 700 : 1800;
  const pointsRef = useRef<THREE.Points>(null);
  const startRef = useRef(0);

  const { geometry, start, target } = useMemo(() => {
    const start = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Scatter widely at the start.
      start[i * 3] = (Math.random() - 0.5) * 30;
      start[i * 3 + 1] = (Math.random() - 0.5) * 20;
      start[i * 3 + 2] = -4 + (Math.random() - 0.5) * 14;

      // Gather into a glowing horizontal band centred on the credit.
      const a = Math.random() * Math.PI * 2;
      const r = 2.5 + Math.random() * 3.5;
      target[i * 3] = Math.cos(a) * r * 1.4;
      target[i * 3 + 1] = Math.sin(a) * r * 0.4;
      target[i * 3 + 2] = -4 + (Math.random() - 0.5) * 1.5;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(start.slice(), 3));
    return { geometry, start, target };
  }, [count]);

  useEffect(() => {
    startRef.current = performance.now();
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const elapsed = (performance.now() - startRef.current) / 1000;
    // Ease gather over ~2.4s; reduced motion settles almost immediately.
    const total = reducedMotion ? 0.2 : 2.4;
    const p = Math.min(elapsed / total, 1);
    const eased = 1 - Math.pow(1 - p, 3);

    for (let i = 0; i < count * 3; i++) {
      arr[i] = start[i] + (target[i] - start[i]) * eased;
    }
    attr.needsUpdate = true;

    if (!reducedMotion) {
      pointsRef.current.rotation.y = Math.sin(elapsed * 0.15) * 0.15;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        color={palette.gold}
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
