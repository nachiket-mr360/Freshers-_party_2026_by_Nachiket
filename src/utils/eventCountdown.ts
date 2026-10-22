export type CountdownStatus = 'upcoming' | 'eventDay' | 'complete';

export interface CountdownParts {
  status: CountdownStatus;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Window after T=0 treated as “the wait is over” rather than a finished event. */
const EVENT_DAY_MS = 12 * 60 * 60 * 1000;

export function remainingUntil(targetMs: number, nowMs: number): CountdownParts {
  const diff = targetMs - nowMs;
  if (diff > 0) {
    const total = Math.floor(diff / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return { status: 'upcoming', days, hours, minutes, seconds };
  }
  if (diff > -EVENT_DAY_MS) {
    return { status: 'eventDay', days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return { status: 'complete', days: 0, hours: 0, minutes: 0, seconds: 0 };
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
