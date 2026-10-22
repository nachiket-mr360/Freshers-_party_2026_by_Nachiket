import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { OPENING_AUDIO_SRC, OPENING_CUES } from '@/content/openingCues';
import { INTRO_DURATION } from '@/scenes/sceneConfig';
import { useReducedMotion } from '@/hooks/useEnvironment';
import { useExperience } from '@/state/ExperienceContext';

export type OpeningDigit = 3 | 2 | 1 | null;

interface OpeningSequenceValue {
  started: boolean;
  titleVisible: boolean;
  digit: OpeningDigit;
  showReady: boolean;
  showLetsGo: boolean;
  flash: boolean;
  audioBlocked: boolean;
  start: () => void;
  skip: () => void;
}

const OpeningSequenceContext = createContext<OpeningSequenceValue | null>(null);

function digitForTime(t: number): OpeningDigit {
  if (t >= OPENING_CUES.one) return 1;
  if (t >= OPENING_CUES.two) return 2;
  if (t >= OPENING_CUES.three) return 3;
  return null;
}

export function OpeningSequenceProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const { stage } = useExperience();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const titleAtRef = useRef<number | null>(null);
  const fallbackOriginRef = useRef<number | null>(null);

  const [started, setStarted] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [digit, setDigit] = useState<OpeningDigit>(null);
  const [showReady, setShowReady] = useState(false);
  const [showLetsGo, setShowLetsGo] = useState(false);
  const [flash, setFlash] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const lastDigitRef = useRef<OpeningDigit>(null);
  const lastReadyRef = useRef(false);
  const letsGoSentRef = useRef(false);

  const applyTime = useCallback((t: number) => {
    const nextDigit = t >= OPENING_CUES.title ? null : digitForTime(t);
    if (nextDigit !== lastDigitRef.current) {
      lastDigitRef.current = nextDigit;
      setDigit(nextDigit);
      if (nextDigit) setFlash(true);
    }

    const ready = t >= OPENING_CUES.ready && t < OPENING_CUES.title;
    if (ready !== lastReadyRef.current) {
      lastReadyRef.current = ready;
      setShowReady(ready);
    }

    if (t >= OPENING_CUES.title) {
      setTitleVisible((visible) => {
        if (!visible) titleAtRef.current = performance.now();
        return true;
      });
    }

    const revealedAt = titleAtRef.current;
    if (
      !letsGoSentRef.current &&
      revealedAt !== null &&
      performance.now() - revealedAt >= INTRO_DURATION * 1000
    ) {
      letsGoSentRef.current = true;
      setShowLetsGo(true);
    }
  }, []);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    let t = 0;
    if (audio && !audio.paused && !audio.ended) {
      t = audio.currentTime;
    } else if (fallbackOriginRef.current !== null) {
      t = (performance.now() - fallbackOriginRef.current) / 1000;
    } else {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    applyTime(t);
    rafRef.current = requestAnimationFrame(tick);
  }, [applyTime]);

  useEffect(() => {
    const el = new Audio(OPENING_AUDIO_SRC);
    el.preload = 'auto';
    el.loop = false;
    audioRef.current = el;
    return () => {
      cancelAnimationFrame(rafRef.current);
      el.pause();
      el.removeAttribute('src');
      el.load();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (stage === 'hero') return;
    audioRef.current?.pause();
    cancelAnimationFrame(rafRef.current);
  }, [stage]);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(false), 140);
    return () => window.clearTimeout(id);
  }, [flash]);

  const finishWithoutAudio = useCallback(() => {
    setTitleVisible(true);
    titleAtRef.current = performance.now();
    setDigit(null);
    setShowReady(false);
    fallbackOriginRef.current = performance.now() - OPENING_CUES.title * 1000;
  }, []);

  const start = useCallback(() => {
    if (started) return;
    setStarted(true);

    if (reducedMotion) {
      setAudioBlocked(true);
      setTitleVisible(true);
      setShowLetsGo(true);
      setDigit(null);
      setShowReady(false);
      return;
    }

    const audio = audioRef.current;
    fallbackOriginRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    if (!audio) {
      setAudioBlocked(true);
      return;
    }

    const play = audio.play();
    if (play && typeof play.then === 'function') {
      play.catch(() => {
        setAudioBlocked(true);
        // Keep the visual clock running from first tap.
      });
    }
  }, [reducedMotion, started, tick]);

  const skip = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    setStarted(true);
    setAudioBlocked(true);
    finishWithoutAudio();
    setShowLetsGo(true);
  }, [finishWithoutAudio]);

  const value = useMemo<OpeningSequenceValue>(
    () => ({
      started,
      titleVisible,
      digit,
      showReady,
      showLetsGo,
      flash,
      audioBlocked,
      start,
      skip,
    }),
    [started, titleVisible, digit, showReady, showLetsGo, flash, audioBlocked, start, skip],
  );

  return (
    <OpeningSequenceContext.Provider value={value}>{children}</OpeningSequenceContext.Provider>
  );
}

export function useOpeningSequence(): OpeningSequenceValue {
  const ctx = useContext(OpeningSequenceContext);
  if (!ctx) {
    throw new Error('useOpeningSequence must be used within OpeningSequenceProvider');
  }
  return ctx;
}
