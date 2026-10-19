/**
 * Global experience state.
 *
 * Everything lives in memory for the current visit. The only thing written to
 * storage is a boolean `freshers.introSeen` used to avoid replaying the full
 * cinematic intro on repeat navigations within the same browser session
 * (spec §6). No personal data (name / category) is ever persisted.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { Category } from '@/content/eventConfig';
import type { ExperienceState, Stage } from './types';

type Action =
  | { type: 'SET_STAGE'; stage: Stage }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_CATEGORY'; category: Category | null }
  | { type: 'COMPLETE_INTRO' }
  | { type: 'RESTART' };

const INTRO_KEY = 'freshers.introSeen';

function readIntroSeen(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

function writeIntroSeen(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(INTRO_KEY, '1');
    else sessionStorage.removeItem(INTRO_KEY);
  } catch {
    /* Session storage unavailable (private mode) — fail silently. */
  }
}

function createInitial(): ExperienceState {
  return {
    stage: 'hero',
    name: '',
    category: null,
    // If the intro was already seen this session, start past the hero.
    introDone: readIntroSeen(),
  };
}

function reducer(state: ExperienceState, action: Action): ExperienceState {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, stage: action.stage };
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_CATEGORY':
      return { ...state, category: action.category };
    case 'COMPLETE_INTRO':
      writeIntroSeen(true);
      return { ...state, introDone: true };
    case 'RESTART':
      // Replay from the start but do not force the full intro again.
      return { ...createInitial(), introDone: true };
    default:
      return state;
  }
}

interface ExperienceContextValue extends ExperienceState {
  goToStage: (stage: Stage) => void;
  setName: (name: string) => void;
  setCategory: (category: Category | null) => void;
  completeIntro: () => void;
  restart: () => void;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitial);

  const goToStage = useCallback((stage: Stage) => {
    dispatch({ type: 'SET_STAGE', stage });
  }, []);

  const setName = useCallback((name: string) => {
    // Trim accidental whitespace; rendering is always plain text (safe).
    dispatch({ type: 'SET_NAME', name: name.trim() });
  }, []);

  const setCategory = useCallback((category: Category | null) => {
    dispatch({ type: 'SET_CATEGORY', category });
  }, []);

  const completeIntro = useCallback(() => {
    dispatch({ type: 'COMPLETE_INTRO' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      ...state,
      goToStage,
      setName,
      setCategory,
      completeIntro,
      restart,
    }),
    [state, goToStage, setName, setCategory, completeIntro, restart],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience(): ExperienceContextValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error('useExperience must be used within ExperienceProvider');
  }
  return ctx;
}
