/**
 * Root WebGL canvas.
 *
 * Composes the background environment, camera rig and (finale only) the particle
 * signature. Caps device pixel ratio, trims shader/antialias cost on low-power
 * devices and pauses the render loop when the tab is hidden (spec §18).
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { BackgroundScene } from './BackgroundScene';
import { CameraRig } from './CameraRig';
import { ParticleSignature } from './ParticleSignature';
import { HeroTitle3D } from './HeroTitle3D';
import { INTRO_DURATION } from './sceneConfig';
import { useExperience } from '@/state/ExperienceContext';
import { useOpeningSequence } from '@/state/OpeningSequenceContext';
import { useMediaFlags, useReducedMotion } from '@/hooks/useEnvironment';

export function ExperienceCanvas() {
  const reducedMotion = useReducedMotion();
  const { lowPower } = useMediaFlags();
  const { stage } = useExperience();
  const { titleVisible } = useOpeningSequence();
  const pointer = useRef({ x: 0, y: 0 });
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');

  // Pause expensive animation when the page is hidden.
  useEffect(() => {
    const onVisibility = () => {
      setFrameloop(document.hidden ? 'never' : 'always');
    };
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <Canvas
      className="experience-canvas"
      frameloop={frameloop}
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 11], fov: 42 }}
      gl={{
        antialias: !lowPower,
        powerPreference: 'high-performance',
        alpha: false,
      }}
    >
      <Suspense fallback={null}>
        <BackgroundScene
          pointer={pointer}
          lowPower={lowPower}
          reducedMotion={reducedMotion}
        />
        <CameraRig pointer={pointer} reducedMotion={reducedMotion} />
        {stage === 'hero' && titleVisible && (
          <HeroTitle3D duration={INTRO_DURATION} reducedMotion={reducedMotion} />
        )}
        {stage === 'finale' && (
          <ParticleSignature lowPower={lowPower} reducedMotion={reducedMotion} />
        )}
      </Suspense>
    </Canvas>
  );
}
