import { eventInfo } from '@/content/eventConfig';
import { useEventCountdown } from '@/hooks/useEventCountdown';
import { pad2 } from '@/utils/eventCountdown';

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="countdown__unit">
      <span className="countdown__value">{value}</span>
      <span className="countdown__label">{label}</span>
    </div>
  );
}

export function EventCountdown() {
  const parts = useEventCountdown(eventInfo.startsAt);

  if (parts.status === 'eventDay') {
    return (
      <p className="countdown countdown--message" data-inv="countdown">
        The wait is over — Freshers 2026 is here!
      </p>
    );
  }

  if (parts.status === 'complete') {
    return (
      <p className="countdown countdown--message" data-inv="countdown">
        Freshers 2026 has taken place. Thank you for being part of it.
      </p>
    );
  }

  return (
    <div
      className="countdown"
      data-inv="countdown"
      aria-label={`Time remaining: ${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds`}
    >
      <Unit value={String(parts.days).padStart(2, '0')} label="Days" />
      <span className="countdown__sep" aria-hidden="true">
        :
      </span>
      <Unit value={pad2(parts.hours)} label="Hours" />
      <span className="countdown__sep" aria-hidden="true">
        :
      </span>
      <Unit value={pad2(parts.minutes)} label="Minutes" />
      <span className="countdown__sep" aria-hidden="true">
        :
      </span>
      <Unit value={pad2(parts.seconds)} label="Seconds" />
    </div>
  );
}
