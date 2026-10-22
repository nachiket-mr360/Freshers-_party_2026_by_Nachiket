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
  showLadies: boolean;
  showReady: boolean;
  showLetsGo: boolean;
  flash: boolean;
  playbackError: string | null;
  start: () => Promise<void>;
  skip: () => void;
}

const OpeningSequenceContext = createContext<OpeningSequenceValue | null>(null);

function digitForTime(t: number): OpeningDigit {
  if (t >= OPENING_CUES.countdownEnd || t >= OPENING_CUES.ladies) return null;
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
  const startingRef = useRef(false);
  const playingRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [digit, setDigit] = useState<OpeningDigit>(null);
  const [showLadies, setShowLadies] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [showLetsGo, setShowLetsGo] = useState(false);
  const [flash, setFlash] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const lastDigitRef = useRef<OpeningDigit>(null);
  const lastLadiesRef = useRef(false);
  const lastReadyRef = useRef(false);
  const letsGoSentRef = useRef(false);

  const applyTime = useCallback((t: number) => {
    const nextDigit = digitForTime(t);
    if (nextDigit !== lastDigitRef.current) {
      lastDigitRef.current = nextDigit;
      setDigit(nextDigit);
      if (nextDigit) setFlash(true);
    }

    const ladies = t >= OPENING_CUES.ladies && t < OPENING_CUES.ready;
    if (ladies !== lastLadiesRef.current) {
      lastLadiesRef.current = ladies;
      setShowLadies(ladies);
    }

    const ready = t >= OPENING_CUES.ready && t < OPENING_CUES.readyEnd;
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
    if (audio && !audio.paused && !audio.ended) {
      applyTime(audio.currentTime);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [applyTime]);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const el = new Audio();
    el.preload = 'auto';
    el.loop = false;
    el.muted = false;
    el.volume = 1;
    el.setAttribute('playsinline', 'true');
    el.src = OPENING_AUDIO_SRC;
    audioRef.current = el;
    return el;
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.removeAttribute('src');
        el.load();
      }
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (stage === 'hero') return;
    audioRef.current?.pause();
    playingRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, [stage]);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(false), 140);
    return () => window.clearTimeout(id);
  }, [flash]);

  const start = useCallback(async () => {
    if (playingRef.current || startingRef.current) return;
    startingRef.current = true;

    const audio = ensureAudio();
    audio.muted = false;
    audio.volume = 1;

    try {
      if (audio.currentTime > 0) audio.currentTime = 0;
      const playResult = audio.play();
      if (playResult) await playResult;
      if (audio.paused) {
        throw new Error('Audio remained paused after play()');
      }

      playingRef.current = true;
      setPlaybackError(null);
      setStarted(true);

      if (reducedMotion) {
        setTitleVisible(true);
        setShowLetsGo(true);
        setDigit(null);
        setShowLadies(false);
        setShowReady(false);
        return;
      }

      cancelAnimationFrame(rafRef.current);
      applyTime(audio.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      playingRef.current = false;
      setStarted(false);
      const detail = err instanceof Error ? err.message : 'Playback failed';
      setPlaybackError(`Could not start the soundtrack (${detail}). Tap to try again.`);
    } finally {
      startingRef.current = false;
    }
  }, [applyTime, ensureAudio, reducedMotion, tick]);

  const skip = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    playingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setStarted(true);
    setTitleVisible(true);
    setDigit(null);
    setShowLadies(false);
    setShowReady(false);
    setShowLetsGo(true);
    titleAtRef.current = performance.now();
  }, []);

  const value = useMemo<OpeningSequenceValue>(
    () => ({
      started,
      titleVisible,
      digit,
      showLadies,
      showReady,
      showLetsGo,
      flash,
      playbackError,
      start,
      skip,
    }),
    [
      started,
      titleVisible,
      digit,
      showLadies,
      showReady,
      showLetsGo,
      flash,
      playbackError,
      start,
      skip,
    ],
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
