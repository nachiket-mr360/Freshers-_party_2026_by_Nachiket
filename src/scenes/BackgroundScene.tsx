/**
 * The atmospheric 3D environment (spec §7 — Experimental Motion Graphics).
 *
 * A single procedural particle field + a few distorted glass forms provide
 * real depth and parallax without thousands of objects. Everything lives in
 * one world that the camera flies through, and it responds subtly to pointer
 * movement (handled by CameraRig, not here, to avoid violent shifts).
 */

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { palette } from './sceneConfig';
import { useExperience } from '@/state/ExperienceContext';
import type { Stage } from '@/state/types';
import type { Category } from '@/content/eventConfig';

// The environment's lighting mood evolves as the journey progresses (spec §7).
const stageMood: Record<Stage, string> = {
  hero: palette.violet,
  name: palette.electric,
  category: palette.electric,
  experience: palette.coolWhite,
  invitation: palette.gold,
  finale: palette.amber,
};

const categoryMood: Record<Category, string> = {
  first: palette.amber,
  third: palette.electric,
  fifth: palette.violet,
  faculty: palette.coolWhite,
};

interface Props {
  /** Normalised pointer, driven by CameraRig / canvas. */
  pointer: RefObject<{ x: number; y: number }>;
  /** Lower complexity on weak devices / mobile. */
  lowPower: boolean;
  /** Reduced motion: slow continuous drift is minimised. */
  reducedMotion: boolean;
}

interface ParticleLayerProps {
  count: number;
  spread: number;
  color: string;
  size: number;
  speed: number;
  depth: number;
  reducedMotion: boolean;
}

function ParticleLayer({
  count,
  spread,
  color,
  size,
  speed,
  depth,
  reducedMotion,
}: ParticleLayerProps) {
  const ref = useRef<THREE.Points>(null);

  // Positions are generated procedurally once and reused.
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.6 - depth;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count, spread, depth]);

  // Dispose the manually created geometry when the layer unmounts.
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!ref.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * speed;
    ref.current.rotation.x = Math.sin(t * 0.1) * 0.15;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function BackgroundScene({ pointer, lowPower, reducedMotion }: Props) {
  const formsRef = useRef<THREE.Group>(null);
  const moodRef = useRef<THREE.PointLight>(null);
  const { stage, category } = useExperience();

  const targetMood = new THREE.Color(
    stage === 'experience' && category ? categoryMood[category] : stageMood[stage],
  );

  // Two parallax particle layers: a dense far field + a sparser near field.
  const farCount = lowPower ? 900 : 2200;
  const nearCount = lowPower ? 260 : 700;

  useFrame((state) => {
    if (!formsRef.current) return;
    const t = state.clock.elapsedTime;
    if (!reducedMotion) {
      formsRef.current.rotation.y = t * 0.05;
      formsRef.current.position.y = Math.sin(t * 0.2) * 0.3;
    }
    // Very subtle pointer-driven lean (never violent — spec §7).
    const px = pointer.current?.x ?? 0;
    const py = pointer.current?.y ?? 0;
    formsRef.current.rotation.x += (py * 0.12 - formsRef.current.rotation.x) * 0.03;
    formsRef.current.rotation.z += (px * -0.08 - formsRef.current.rotation.z) * 0.03;
  });

  // Ease the mood light toward the current stage / category colour.
  useFrame((_, delta) => {
    if (!moodRef.current) return;
    const d = Math.min(delta, 0.1);
    moodRef.current.color.lerp(targetMood, reducedMotion ? 1 : 1 - Math.pow(0.001, d));
  });

  return (
    <>
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[palette.fog, 9, 26]} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 8, 5]} intensity={0.7} color={palette.coolWhite} />
      <pointLight position={[-8, -4, -6]} intensity={40} color={palette.violet} distance={40} />
      <pointLight position={[8, 5, -4]} intensity={30} color={palette.electric} distance={40} />
      {/* Mood light: recoloured per stage / category, kept low + off-centre so
          it never blows out a bright patch behind the title. */}
      <pointLight
        ref={moodRef}
        position={[0, -2.5, 4]}
        intensity={10}
        distance={26}
        color={targetMood.getHex()}
      />

      {/* Procedural reflections for the glass forms — no external HDRI. */}
      <Environment resolution={lowPower ? 64 : 192}>
        <Lightformer
          intensity={1.4}
          color={palette.violet}
          position={[0, 4, -8]}
          scale={[12, 6, 1]}
        />
        <Lightformer
          intensity={1.1}
          color={palette.electric}
          position={[-6, -2, 4]}
          rotation-y={Math.PI / 2}
          scale={[8, 6, 1]}
        />
        <Lightformer
          intensity={0.8}
          color={palette.coolWhite}
          position={[6, 2, 4]}
          rotation-y={-Math.PI / 2}
          scale={[8, 6, 1]}
        />
      </Environment>

      <ParticleLayer
        count={farCount}
        spread={40}
        depth={6}
        color={palette.violet}
        size={0.05}
        speed={0.02}
        reducedMotion={reducedMotion}
      />
      <ParticleLayer
        count={nearCount}
        spread={24}
        depth={1}
        color={palette.coolWhite}
        size={0.09}
        speed={-0.035}
        reducedMotion={reducedMotion}
      />

      {/* Abstract glass forms give foreground depth and parallax. */}
      <group ref={formsRef}>
        <mesh position={[-5.5, 1.5, -3]}>
          <icosahedronGeometry args={[1.6, lowPower ? 1 : 2]} />
          <MeshDistortMaterial
            color={palette.electric}
            roughness={0.15}
            metalness={0.6}
            distort={reducedMotion ? 0 : 0.35}
            speed={reducedMotion ? 0 : 1.4}
            transparent
            opacity={0.55}
          />
        </mesh>
        <mesh position={[5.5, -2, -4]}>
          <torusKnotGeometry args={[1.1, 0.3, lowPower ? 96 : 160, 16]} />
          <MeshDistortMaterial
            color={palette.violet}
            roughness={0.2}
            metalness={0.7}
            distort={reducedMotion ? 0 : 0.25}
            speed={reducedMotion ? 0 : 1.1}
            transparent
            opacity={0.5}
          />
        </mesh>
        <mesh position={[3.5, 3, -7]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial
            color={palette.fog}
            roughness={0.9}
            metalness={0.1}
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
    </>
  );
}
