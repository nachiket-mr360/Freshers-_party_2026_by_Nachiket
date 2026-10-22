import { useEffect, useState } from 'react';
import { remainingUntil, type CountdownParts } from '@/utils/eventCountdown';

export function useEventCountdown(isoTarget: string): CountdownParts {
  const targetMs = Date.parse(isoTarget);
  const [parts, setParts] = useState(() => remainingUntil(targetMs, Date.now()));

  useEffect(() => {
    const tick = () => setParts(remainingUntil(targetMs, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    const onVis = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [targetMs]);

  return parts;
}
