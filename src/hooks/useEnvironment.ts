/** Accessibility + device-capability hooks. */

import { useEffect, useState } from 'react';

/** Tracks the user's `prefers-reduced-motion` setting reactively. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

interface MediaFlags {
  /** Phone-sized viewport. */
  isMobile: boolean;
  /** Touch-first pointer. */
  isCoarse: boolean;
  /** Lower visual complexity for weaker devices. */
  lowPower: boolean;
}

/**
 * Derives layout / performance flags from the viewport and input modality.
 * Used to tune the WebGL scene (pixel ratio, particle count, materials).
 */
export function useMediaFlags(): MediaFlags {
  const read = (): MediaFlags => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isCoarse: false, lowPower: false };
    }
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    // Rough device hint: few logical cores or a small phone viewport.
    const cores = navigator.hardwareConcurrency ?? 8;
    const lowPower = isMobile || cores <= 4;
    return { isMobile, isCoarse, lowPower };
  };

  const [flags, setFlags] = useState<MediaFlags>(read);

  useEffect(() => {
    const onResize = () => setFlags(read());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return flags;
}

/** Returns true when WebGL can be created, so the DOM fallback can be shown. */
export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
