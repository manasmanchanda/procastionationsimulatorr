import type { AppState } from '@/types';
import {
  productivityScore,
  scoreTier,
  completedToday,
  distractionMinutes,
  distractionCount,
  openWeight,
  fmtMins,
} from '@/lib/score';
import { todayKey } from '@/lib/storage';

export interface Roast {
  text: string;
  tone: 'roast' | 'backhanded' | 'cheer' | 'neutral';
}

const ROASTS_DISASTER: string[] = [
  "Bro opened {tabs} tabs and completed {done} tasks. Inspiring.",
  "You've wasted {wasted} today. Your future self is crying.",
  "0 tasks done, {wasted} of vibes. The vibes are not vibes-ing.",
  "Productivity score: {score}. A potato generates more output.",
  "{done} task(s) done. {tabs} distractions logged. The ratio is criminal.",
  "You said 'just 5 more minutes' {tabs} times today.",
];

const ROASTS_FLOP: string[] = [
  "Rough. You finished {done} thing(s) and dodged the rest like a pro.",
  "{wasted} wasted. At least you're consistent.",
  "Score {score}. The bar was on the floor and you brought a shovel.",
  "You did {done} task(s)! ...and then celebrated with {tabs} distraction(s).",
];

const ROASTS_MID: string[] = [
  "Mid. Not heroic, not tragic. Just... {score}.",
  "{done} done, {wasted} wasted. A perfectly beige performance.",
  "You're hovering at {score}. Pick a lane, coward.",
  "Respectable amount of trying. Disrespectable amount of scrolling.",
];

const ROASTS_BACKHANDED: string[] = [
  "Oh wow, {done} tasks done. Should we throw a parade? ...maybe a small one.",
  "Score {score}. Your mom would be proud. Mildly.",
  "Look at you, doing things. The bar is so proud of you for stepping over it.",
  "Streak {streak}. I almost believed in you for a second there.",
];

const ROASTS_CHEER: string[] = [
  "Okay {score} is genuinely good. Don't let it get to your head.",
  "{done} tasks, only {wasted} wasted. Who are you and what did you do with the old you?",
  "Streak {streak}! You're locked in. Suspicious, but locked in.",
  "Respect. The procrastination muscle is atrophying. Keep going.",
];

const ROASTS_LEGENDARY: string[] = [
  "{score}. This is either discipline or a glitch. I choose glitch.",
  "{done} tasks, {wasted} wasted. Are you okay? Do you need a distraction? It's on the house.",
  "Streak {streak}. You've ascended. We're not worthy (literally, we're an app).",
  "Perfect form. The algorithm is personally offended.",
];

function pick(list: string[], seed: number): string {
  return list[Math.abs(seed) % list.length];
}

function fill(
  template: string,
  ctx: { score: number; done: number; tabs: number; wasted: string; streak: number; open: number },
): string {
  return template
    .replace('{score}', String(ctx.score))
    .replace('{done}', String(ctx.done))
    .replace('{tabs}', String(ctx.tabs))
    .replace('{wasted}', ctx.wasted)
    .replace('{streak}', String(ctx.streak))
    .replace('{open}', String(ctx.open));
}

/**
 * Deterministic-ish roast that changes through the day (seeded by date + score band)
 * so it doesn't reshuffle every render but does vary day to day.
 */
export function getRoast(state: AppState): Roast {
  const score = productivityScore(state);
  const tier = scoreTier(score);
  const done = completedToday(state.tasks);
  const tabs = distractionCount(state.distractions);
  const wasted = fmtMins(distractionMinutes(state.distractions));
  const streak = state.streak;
  const open = openWeight(state.tasks);

  const seed = score * 7 + tabs * 13 + done * 3 + todayKey().length;

  const ctx = { score, done, tabs, wasted, streak, open };

  if (tier === 'disaster') return { text: fill(pick(ROASTS_DISASTER, seed), ctx), tone: 'roast' };
  if (tier === 'flop') return { text: fill(pick(ROASTS_FLOP, seed), ctx), tone: 'roast' };
  if (tier === 'mid') return { text: fill(pick(ROASTS_MID, seed), ctx), tone: 'backhanded' };
  if (tier === 'solid')
    return { text: fill(pick(ROASTS_BACKHANDED, seed), ctx), tone: 'backhanded' };
  return { text: fill(pick(ROASTS_LEGENDARY, seed), ctx), tone: 'cheer' };
}

/** One-off milestone roasts triggered by specific actions. */
export function milestoneRoast(kind: 'first-distraction' | 'first-task' | 'streak-up', ctx: { streak?: number; tabs?: number }): string {
  if (kind === 'first-distraction')
    return ctx.tabs && ctx.tabs > 1
      ? `There it is. Distraction #${ctx.tabs}. The streak is officially in danger.`
      : "First distraction logged. Welcome to the simulator. It's a trap.";
  if (kind === 'first-task') return "A task is done. Suspicious. Logging this for review.";
  return `Streak up to ${ctx.streak}. We're raising an eyebrow. The good eyebrow.`;
}
