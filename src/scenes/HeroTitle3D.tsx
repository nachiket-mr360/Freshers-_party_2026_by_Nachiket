import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { eventTitleParts } from '@/content/eventConfig';
import { palette } from './sceneConfig';

interface Props {
  /** Duration of the cinematic 360° turn in seconds. */
  duration?: number;
  reducedMotion?: boolean;
}

const FONT_URL = `${import.meta.env.BASE_URL}fonts/helvetiker_bold.typeface.json`;

/** GSAP power2.inOut equivalent — used in the render loop so mobile WebGL stays in sync. */
function power2InOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * Real extruded 3D typography for "FRESHERS 2026".
 *
 * One cinematic 360° yaw is driven from useFrame (not GSAP-on-Euler) so the
 * spin cannot collapse when Euler angles wrap, and it cannot finish before
 * the extruded glyphs exist on slower mobile GPUs. After it completes,
 * pointer damping takes over on mouse/pen only.
 */
export function HeroTitle3D({ duration = 4.6, reducedMotion = false }: Props) {
  const outer = useRef<THREE.Group>(null);
  const fitter = useRef<THREE.Group>(null);
  const base = useRef<{ w: number; h: number } | null>(null);
  const introDone = useRef(reducedMotion);
  const introElapsed = useRef(0);
  const geometryReady = useRef(false);
  const target = useRef({ x: 0, y: 0 });
  const viewport = useThree((s) => s.viewport);
  const [fit, setFit] = useState(1);

  useLayoutEffect(() => {
    const g = fitter.current;
    if (!g) return;

    if (!base.current) {
      const size = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3());
      if (size.x === 0) return;
      base.current = { w: size.x, h: size.y };
      geometryReady.current = true;
      introElapsed.current = 0;
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
    introDone.current = reducedMotion;
    introElapsed.current = 0;
    const g = outer.current;
    if (reducedMotion && g) g.rotation.set(0, 0, 0);
  }, [reducedMotion]);

  // Desktop/pen pointer only — touch is ignored so page scroll stays intact.
  useEffect(() => {
    if (reducedMotion) return;

    const onMove = (event: PointerEvent) => {
      if (!introDone.current) return;
      if (event.pointerType === 'touch') return;
      const nx = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = (event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
      target.current.y = nx * 0.55;
      target.current.x = THREE.MathUtils.clamp(-ny * 0.28, -0.32, 0.32);
    };

    const onIdle = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('blur', onIdle);
    document.addEventListener('mouseleave', onIdle);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('blur', onIdle);
      document.removeEventListener('mouseleave', onIdle);
    };
  }, [reducedMotion]);

  useFrame((_, delta) => {
    const g = outer.current;
    if (!g) return;
    const d = Math.min(delta, 0.05);

    if (reducedMotion) {
      g.rotation.set(0, 0, 0);
      return;
    }

    if (!introDone.current) {
      if (!geometryReady.current) return;
      introElapsed.current += d;
      const t = Math.min(introElapsed.current / duration, 1);
      const eased = power2InOut(t);
      // Yaw only: 0 → full turn → rest at 0 (front-facing).
      g.rotation.x = 0;
      g.rotation.z = 0;
      g.rotation.y = (eased - 1) * Math.PI * 2;
      if (t >= 1) {
        g.rotation.y = 0;
        introDone.current = true;
      }
      return;
    }

    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, target.current.x, 3.4, d);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target.current.y, 3.4, d);
  });

  return (
    <group ref={outer}>
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
              color="#d4dcff"
              metalness={0.9}
              roughness={0.24}
              clearcoat={1}
              clearcoatRoughness={0.26}
              reflectivity={0.62}
              envMapIntensity={1.42}
              emissive="#2a3558"
              emissiveIntensity={0.64}
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
              metalness={0.88}
              roughness={0.2}
              clearcoat={1}
              clearcoatRoughness={0.18}
              reflectivity={0.72}
              envMapIntensity={1.62}
              emissive="#2c1a68"
              emissiveIntensity={0.68}
            />
          </Text3D>
        </Center>
      </group>
    </group>
  );
}
