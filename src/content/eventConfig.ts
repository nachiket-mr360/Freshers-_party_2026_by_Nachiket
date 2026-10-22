/**
 * FRESHERS 2026 — Single source of truth for event information.
 *
 * EDIT HERE to re-brand the experience. The final party name is not yet
 * confirmed, so the working title lives in `eventTitle` and every component
 * reads it from this module rather than hard-coding the string.
 *
 * No invented details: there is no ticket price, dress code, chief guest,
 * performer or sponsor because none were provided.
 */

/** Configurable working title for the event. */
export const eventTitle = 'FRESHERS 2026';

/** Split rendering of the title so "FRESHERS" and "2026" can be styled apart. */
export const eventTitleParts = {
  primary: 'FRESHERS',
  accent: '2026',
} as const;

export const eventInfo = {
  title: eventTitle,
  dateLabel: '31 October 2026',
  dateShort: '31.10.2026',
  timeLabel: '10:00 AM',
  venue: {
    name: 'Sabha Mantapa',
    campus: 'Sharnbasva University',
  },
  organizer: {
    line1: 'Faculty of Computer Applications',
    line2: 'BCA (Co-ed)',
  },
  /** Absolute start instant in IST — countdown never uses the visitor's local zone. */
  startsAt: '2026-10-31T10:00:00+05:30',
} as const;

/**
 * Mandatory creator credit. The exact wording, capitalisation and
 * punctuation must be preserved everywhere it is displayed.
 */
export const creatorCredit = {
  madeBy: 'BCA SEM V PRESENTS',
  name: 'event title',
  /** The full, exact single-line form. */
  full: 'BCA SEM V PRESENTS event title',
} as const;

/** The four visitor categories offered to the guest. */
export const categories = [
  'first',
  'third',
  'fifth',
  'faculty',
] as const;

export type Category = (typeof categories)[number];

export const categoryLabels: Record<Category, string> = {
  first: 'First Semester',
  third: 'Third Semester',
  fifth: 'Fifth Semester',
  faculty: 'Faculty',
};
