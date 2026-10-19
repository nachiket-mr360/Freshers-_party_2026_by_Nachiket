/**
 * FRESHERS 2026 — Category-specific experience copy.
 *
 * Kept separate from presentation logic so wording can be edited without
 * touching components. Every string may use the `{name}` token, replaced at
 * render time with the (already-sanitised) guest name. A name is never
 * injected as raw HTML — it is rendered as plain React text.
 */

import type { Category } from './eventConfig';

/** Replaces the `{name}` token. Falls back gracefully for empty names. */
export function personalise(template: string, name: string): string {
  const safe = name.trim();
  return template.replaceAll('{name}', safe || 'friend');
}

export interface StageMessage {
  /** Small label above the headline, e.g. "PROLOGUE". */
  kicker?: string;
  /** Large display line. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Label for the continue control. */
  actionLabel: string;
}

export interface FifthChoice {
  id: 'all' | 'almost' | 'what';
  label: string;
  /** Distinct reaction shown after the choice. */
  reaction: StageMessage;
}

/** The distinct, personalised journeys for each visitor category. */
export const experiences: Record<Category, StageMessage[]> = {
  first: [
    {
      kicker: 'A New Beginning',
      title: 'Welcome to a new beginning, {name}.',
      body: 'Your story at Sharnbasva starts here. Four more batches will one day trace their first day back to this one — and tonight, you are officially part of it.',
      actionLabel: 'Continue',
    },
    {
      kicker: 'You Belong Here',
      title: 'The doors are open, {name}.',
      body: 'New campus, new people, new name for yourself in the group chats. Come, meet the batch that will have your back through every assignment deadline ahead.',
      actionLabel: 'Reveal my invitation',
    },
  ],
  third: [
    {
      kicker: 'Mission Briefing',
      title: 'Your mission: make the new batch feel at home.',
      body: 'You remember being the confused one at the gate, right? Someone guided you. Now it is your turn to be that someone for First Year.',
      actionLabel: 'I accept',
    },
    {
      kicker: 'Mission Accepted',
      title: 'Welcome aboard, {name}. You are the seniors they will remember.',
      body: 'A smile at the corridor, a reply in the class group, a seat saved at the event — that is how a batch becomes a family. Start tonight.',
      actionLabel: 'Show me the invitation',
    },
  ],
  fifth: [
    {
      kicker: 'Be Honest',
      title: 'Have you finished your Freshers’ work, {name}?',
      body: 'The batch is counting on you. Pick the answer that is closest to the truth — no judgement here.',
      actionLabel: '',
    },
  ],
  faculty: [
    {
      kicker: 'With Respect',
      title: 'A warm welcome, {name}.',
      body: 'Beyond the classrooms, the students would be honoured by your presence as they celebrate the beginning of a new chapter.',
      actionLabel: 'Reveal the invitation',
    },
    {
      kicker: 'The Invitation',
      title: 'You are invited to Freshers’ 2026.',
      body: 'An evening of welcome, gratitude and new beginnings — together with the Faculty of Computer Applications.',
      actionLabel: 'View details',
    },
  ],
};

/** Question and three distinct responses for the Fifth Semester path. */
export const fifthSemesterChoices: FifthChoice[] = [
  {
    id: 'all',
    label: 'All done',
    reaction: {
      kicker: 'Legendary',
      title: 'All done? Respect, {name}.',
      body: 'You are the batch representative every coordinator dreams of. Now that the work is behind you, it is time to actually enjoy the day you organized.',
      actionLabel: 'Take me to the invitation',
    },
  },
  {
    id: 'almost',
    label: 'Almost done',
    reaction: {
      kicker: 'The Deadline Special',
      title: 'Almost done is the most honest answer, {name}.',
      body: 'The last ten percent always appears the night before — that is not procrastination, that is “final-year optimisation”. You will make it, and then you will celebrate.',
      actionLabel: 'Take me to the invitation',
    },
  },
  {
    id: 'what',
    label: 'What work?',
    reaction: {
      kicker: 'Oops',
      title: '“What work?” — bold, {name}.',
      body: 'That group message was definitely delivered. Consider this your official reminder — and your excuse to gracefully rejoin the conversation.',
      actionLabel: 'Take me to the invitation',
    },
  },
];

/** Short third-semester interactive mission checklist. */
export const thirdSemesterMission = {
  prompt: 'Three small things that make a First Year feel at home:',
  tasks: [
    'Say hello to one first-year today',
    'Reply to one confused question in the class group',
    'Save a seat for someone new at the event',
  ],
  completeLabel: 'Mission complete',
};
