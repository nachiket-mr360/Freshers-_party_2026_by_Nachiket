import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { eventTitleParts } from '@/content/eventConfig';
import { palette } from './sceneConfig';

interface Props {
  /** Duration of the cinematic 360° turn in seconds. */
  duration?: number;
  reducedMotion?: boolean;
}

const FONT_URL = '/fonts/helvetiker_bold.typeface.json';

/**
 * Real extruded 3D typography for "FRESHERS 2026".
 *
 * Genuine THREE.ExtrudeGeometry text (via drei Text3D) with beveled, metallic
 * / frosted materials lit by the scene — NOT a flat rotated element. It performs
 * one full 360° horizontal turn on GSAP's main timeline and settles front-facing,
 * auto-scaled to fit the viewport on mobile and desktop.
 */
export function HeroTitle3D({ duration = 4.6, reducedMotion = false }: Props) {
  const outer = useRef<THREE.Group>(null);
  const fitter = useRef<THREE.Group>(null);
  const base = useRef<{ w: number; h: number } | null>(null);
  const viewport = useThree((s) => s.viewport);
  const [fit, setFit] = useState(1);

  // Measure the unscaled extruded width/height once, then derive a responsive
  // scale so the title fits the visible world on mobile and desktop.
  useLayoutEffect(() => {
    const g = fitter.current;
    if (!g) return;

    if (!base.current) {
      const size = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3());
      if (size.x === 0) return;
      base.current = { w: size.x, h: size.y };
    }

    const { w, h } = base.current;
    const scale = Math.min(
      (viewport.width * 0.82) / w,
      (viewport.height * 0.62) / h,
      2.4,
    );
    setFit(scale);
  }, [viewport.width, viewport.height]);

  useEffect(() => {
    const g = outer.current;
    if (!g) return;

    if (reducedMotion) {
      g.rotation.y = 0;
      return;
    }

    // One complete, cinematic horizontal revolution that settles at the front.
    const tween = gsap.fromTo(
      g.rotation,
      { y: -Math.PI * 2 },
      { y: 0, duration, ease: 'power2.inOut' },
    );
    return () => {
      tween.kill();
    };
  }, [duration, reducedMotion]);

  return (
    <group ref={outer}>
      {/* Each word is centred on its own so the stacked lockup stays balanced,
          and the whole group pivots through its middle during the 360° turn. */}
      <group ref={fitter} scale={fit}>
        <Center position={[0, 0.72, 0]}>
          <Text3D
            font={FONT_URL}
            size={1}
            height={0.42}
            curveSegments={10}
            bevelEnabled
            bevelThickness={0.035}
            bevelSize={0.028}
            bevelOffset={0}
            bevelSegments={3}
            letterSpacing={0.02}
          >
            {eventTitleParts.primary}
            <meshPhysicalMaterial
              color="#cdd7ff"
              metalness={0.92}
              roughness={0.26}
              clearcoat={1}
              clearcoatRoughness={0.28}
              reflectivity={0.6}
              envMapIntensity={1.35}
              /* Faint self-illumination keeps the front-facing faces readable
                 — metallic-only faces read near-black head-on. */
              emissive="#1c2447"
              emissiveIntensity={0.55}
            />
          </Text3D>
        </Center>

        <Center position={[0, -0.78, 0]}>
          <Text3D
            font={FONT_URL}
            size={1}
            height={0.42}
            curveSegments={10}
            bevelEnabled
            bevelThickness={0.035}
            bevelSize={0.028}
            bevelOffset={0}
            bevelSegments={3}
            letterSpacing={0.06}
          >
            {eventTitleParts.accent}
            <meshPhysicalMaterial
              color={palette.violet}
              metalness={0.9}
              roughness={0.22}
              clearcoat={1}
              clearcoatRoughness={0.2}
              reflectivity={0.7}
              envMapIntensity={1.55}
              emissive="#241457"
              emissiveIntensity={0.6}
            />
          </Text3D>
        </Center>
      </group>
    </group>
  );
}
