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
  /** Large display line. Use `\n` for an intentional break. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Label for the continue control. */
  actionLabel: string;
}

/** The distinct, personalised journeys for each visitor category. */
export const experiences: Record<Category, StageMessage[]> = {
  first: [
    {
      kicker: 'A New Beginning',
      title: 'Your Story Begins Here',
      body: 'Hey, {name}. ❤️\n\nToday, you\'re surrounded by unfamiliar faces. Someday, these same faces might become the people you never want to say goodbye to.\n\nYou came here to build a future. You might just find a second home along the way.\n\nWelcome to Sharnbasva. Your story starts here.',
      actionLabel: 'Continue',
    },
    {
      kicker: 'You Belong Here',
      title: 'Welcome to the Real Adventure!',
      body: '{name}, enjoy these peaceful days… because college life is about to get interesting. 😂❤️\n\nSoon, you’ll be promising your professors, "Sir, I’ll submit it tomorrow!" while assignments pile up, attendance becomes your biggest enemy, and your friends turn even the most stressful days into hilarious memories.\n\nBefore you know it, the people sitting beside you today will become the ones you miss tomorrow, and these everyday corridors will hold stories you’ll tell for years.\n\nSo laugh, make friends, and cherish the little moments. Because one day, you won’t wish for fewer assignments… you’ll wish for just one more day here with everyone.\n\nMay Sharnbasva give you memories that make you smile long after you’ve left. ❤️',
      actionLabel: 'Reveal my invitation',
    },
  ],
  third: [
    {
      kicker: 'A Little Reminder',
      title: 'Remember Your First Day?',
      body: 'Hey, {name}. ❤️\n\nRemember when this campus was new to you? When familiar faces were strangers, and even the simplest things felt a little confusing?\n\nSomewhere along the way, you found your people, collected a few embarrassing memories, and learned how to survive college one day at a time. 😂\n\nNow, there\'s a new batch standing where you once stood.\n\nAnd you have something wonderful to give them: the feeling that they belong here, too.',
      actionLabel: 'Continue',
    },
   
{
  kicker: 'Your Turn Now',
  title: 'Be the Senior You Once Needed',
  body: '{name}, we survived assignments, attendance tension, and endless "I’ll study from tomorrow" promises. 😂❤️\n\nBut our best memories came from the friends who made college special.\n\nNow, be that person for a fresher. Say hello, lend a hand, and make them feel welcome.\n\nYou may forget these little moments, but they might remember your kindness forever. ❤️',
  actionLabel: 'Show me the invitation',
},

  ],
  fifth: [
{
  kicker: 'Before We Turn the Page',
  title: 'Once, We Were Them.',
  body: 'Hey, {name}. ❤️\n\nRemember when we were juniors, looking up to our seniors and wondering when it would be our turn?\n\nBetween assignments, scoldings, last-minute submissions, and laughter with friends, we grew up without even realizing it.\n\nAnd now, the juniors look at us the same way we once looked at our seniors.\n\nFunny how quickly our turn came, isn’t it? ❤️',
  actionLabel: 'Continue',
},

{
  kicker: 'Before the Chapter Closes',
  title: 'We Didn’t Know These Days Would Matter So Much.',
  body: '{name}, one day, we’ll leave these classrooms and miss the laughter, the friendships, and even the moments we once complained about.\n\nWe may forget the lectures, but never the people who made these years unforgettable. ❤️',
  actionLabel: 'Continue',
},
{
  kicker: 'Our Last Chapter as Seniors',
  title: 'Let’s Give Them a Beginning to Remember.',
  body: '{name}, we once stood where the juniors stand today.\n\nLet’s guide them, make them feel welcome, and give them memories worth keeping. After all, we’ve survived enough college drama! 😂❤️',
  actionLabel: 'Continue to the invitation',
},

  ],
  faculty: [
  

{
kicker: 'A Little Faculty Flashback',
title: 'Come On, Sir/Madam… Smile! 😂',
body: 'Dear {name}, ❤️\n\nSmile if you joined as a teacher but accidentally became a paperwork expert, attendance manager, exam-duty officer, and deadline warrior! 😂📚\n\nSmile if a student asked a question and you replied, “We’ll discuss it tomorrow!” 🤣\n\nSmile if you’ve asked, “Any doubts?” and the whole class suddenly went silent! 🤐😂\n\nBehind all the lectures, deadlines, and scoldings are memories and students who’ll never forget you. ❤️\n\nNow forget the paperwork for a moment and give us that faculty smile! 😂❤️',
actionLabel: 'Relive the memories',
},

{
kicker: 'The Celebration Begins',
title: 'A Grand Welcome to NAVA-AGAM 2K26! 🎉',
body: 'Dear {name}, ❤️\n\nFrom guiding us through endless questions to shaping our journey, you’ve been an invaluable part of our growth.\n\nNow, it’s our turn to make you feel special! ✨ We warmly welcome you to NAVA-AGAM 2K26 — BCA Freshers’ Party! 🎊\n\nLet’s celebrate new beginnings, share laughter, and create unforgettable memories together. Your presence will make this celebration truly special! ❤️',
actionLabel: 'Explore the Invitation',
}
  ],
};
