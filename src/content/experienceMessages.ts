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
      body: '{name}, enjoy these peaceful days while they last. 😂❤️\n\nSoon, you\'ll be saying, "Sir, I\'ll submit the assignment tomorrow!" for the third time, wondering how attendance became your biggest enemy, and laughing with friends five minutes before an exam you haven\'t studied for.\n\nBut somewhere between those deadlines, scoldings, silly punishments, and endless corridor conversations, something beautiful happens.\n\nStrangers become friends. Friends become family. And ordinary college days become memories you\'ll wish you could live again.\n\nOne day, you\'ll miss even the days you complained about. So laugh a little, make mistakes, and make these years count.\n\nMay Sharnbasva give you memories that make you smile long after you\'ve left. ❤️',
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
      body: '{name}, you survived the assignments, the attendance tension, the scoldings, and those legendary "I\'ll study from tomorrow" promises. 😂\n\nBut when you look back, I bet the best memories aren\'t just about surviving college.\n\nThey\'re about the friends who shared their notes, the people who waited for you after class, and the ones who made even a terrible day worth laughing about.\n\nNow imagine being that person for a fresher.\n\nSay hello. Help them when they\'re confused. Include them when they\'re standing alone.\n\nYou might forget these little things by tomorrow.\n\nBut they might remember your kindness for the rest of their college life. ❤️',
      actionLabel: 'Show me the invitation',
    },
  ],
  fifth: [
    {
      kicker: 'Before We Turn the Page',
      title: 'Once, We Were Them.',
      body: 'Hey, {name}. ❤️\n\nRemember when we were the juniors, looking up to our seniors and wondering what college life had in store for us and when we would become seniors ourselves?\n\nSomewhere between the assignments, the scoldings, the last-minute submissions, and the laughter with friends, we grew up a little.\n\nAnd somehow, the days we thought would last forever have brought us here.\n\nNow, the juniors are looking at us the way we once looked at our seniors.\n\nFunny how quickly our turn came, isn\'t it?',
      actionLabel: 'Continue',
    },
    {
      kicker: 'Before the Chapter Closes',
      title: 'We Didn\'t Know These Days Would Matter So Much.',
      body: '{name}, one day, we\'ll leave these classrooms for the last time.\n\nWe\'ll miss the friends who made ordinary days special, the laughter in the corridors, and even the little things we complained about.\n\nWe spent so much time waiting for the next semester, the next holiday, the next milestone.\n\nAnd somewhere along the way, the days we were waiting to finish became the days we wish we could keep.\n\nWe might forget some lectures and assignments, but we\'ll carry the memories of the people who made these years ours. ❤️',
      actionLabel: 'Continue',
    },
    {
      kicker: 'Our Last Chapter as Seniors',
      title: 'Let\'s Give Them a Beginning to Remember.',
      body: '{name}, someday, these classrooms will fill with new faces. Someone else will sit in our favourite places, laugh in these corridors, and begin a journey just like ours.\n\nThey might never know all our stories. They might never know how much this place meant to us.\n\nBut they\'ll remember how we made them feel when they arrived.\n\nNow, it\'s our turn to welcome the next batch before our own journey moves towards its end.\n\nLet\'s guide them, stand beside them, and make them feel welcome. Let\'s carry our responsibilities together and give this event everything we\'ve got.\n\nAnd if things get chaotic, well... we\'re experienced enough to handle a little college drama by now. 😂\n\nNow, we have one more chance to give something back.\n\nSo let\'s stand together, enjoy this final chapter as seniors, and give the juniors a beginning they can look back on with a smile.\n\nBecause the most beautiful way to end our chapter is to help someone else begin theirs. ❤️\n\nWe may not remain seniors forever, but the kindness we leave behind can outlast our time here.\n\nLet\'s make this last one count.',
      actionLabel: 'Continue to the invitation',
    },
  ],
  faculty: [
    {
      kicker: 'A Note of Gratitude',
      title: 'We\'re Glad You\'re Part of Our Journey.',
      body: 'Dear {name}, ❤️\n\nWe came to college to build our future. Somewhere along the way, people like you became part of that future.\n\nYou corrected us when we were wrong, guided us when we were lost, and pushed us when we doubted ourselves.\n\nPerhaps to you, these were just ordinary days of teaching.\n\nBut to us, they were little steps towards becoming someone we once only dreamed of being.\n\nSome thank-yous remain unspoken, not because we don\'t feel them, but because we don\'t always know how to express them.',
      actionLabel: 'Continue',
    },
    {
      kicker: 'Beyond the Classroom',
      title: 'One Day, We\'ll Understand It All.',
      body: 'Dear {name}, ❤️\n\nFor you, batches may come and go. But for every student, these years become a part of who they are.\n\nWe may forget a few lessons, but we\'ll remember who stood by us when we struggled, who believed in us when we couldn\'t believe in ourselves, and who prepared us for a world we were still afraid to face.\n\nYou may see it as teaching another batch. We see it as someone helping us become ready for life.\n\nOne day, we\'ll walk out of these classrooms and build lives of our own.\n\nAnd perhaps, in a difficult moment, we\'ll remember something you taught us—and find the strength to keep going.\n\nYou might not be there to see how far we go, but a part of your guidance will go with us.\n\nThank you for being part of the people we\'re becoming. ❤️',
      actionLabel: 'Continue to the invitation',
    },
  ],
};
