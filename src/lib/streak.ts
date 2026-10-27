import type { AppState } from '@/types';
import { todayKey, dayKeyFromMs } from '@/lib/storage';
import { distractionMinutesForDay, completedToday } from '@/lib/score';

/**
 * Recompute the streak based on the state.
 * A "clean day" = a calendar day with ≥1 task completed AND 0 distractions logged.
 * Streak = number of consecutive clean days ending today (or yesterday if today isn't clean yet).
 * bestStreak tracks the historical max.
 */
export function recomputeStreak(state: AppState): { streak: number; bestStreak: number; lastStreakDay: string | null } {
  const today = todayKey();

  // Gather all day keys that were clean
  const cleanDays = new Set<string>();
  const allDays = new Set<string>();

  for (const d of state.distractions) {
    const k = dayKeyFromMs(d.loggedAt);
    allDays.add(k);
  }
  for (const t of state.tasks) {
    if (t.completedAt) {
      const k = dayKeyFromMs(t.completedAt);
      allDays.add(k);
    }
  }

  for (const day of allDays) {
    const doneToday = state.tasks.some(
      (t) => t.status === 'done' && t.completedAt && dayKeyFromMs(t.completedAt) === day,
    );
    const wasted = distractionMinutesForDay(state.distractions, day);
    if (doneToday && wasted === 0) cleanDays.add(day);
  }

  // Count back from today
  let streak = 0;
  let cursor = new Date(today + 'T00:00:00');

  // If today not clean yet, streak can still carry from yesterday
  if (!cleanDays.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (cleanDays.has(dayKeyFromMs(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const bestStreak = Math.max(state.bestStreak, streak);
  return { streak, bestStreak, lastStreakDay: streak > 0 ? today : state.lastStreakDay };
}

/** Was today a clean day so far (no distractions)? */
export function todayIsClean(state: AppState): boolean {
  return distractionMinutesForDay(state.distractions, todayKey()) === 0;
}

export function completedTodayCount(state: AppState): number {
  return completedToday(state.tasks);
}
