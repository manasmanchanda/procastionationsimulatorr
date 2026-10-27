import type { AppState, Task, Distraction } from '@/types';
import { PRIORITY_META } from '@/types';
import { todayKey, dayKeyFromMs } from '@/lib/storage';

/** Total completed-task weight (priority-weighted). */
export function completedWeight(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === 'done')
    .reduce((sum, t) => sum + PRIORITY_META[t.priority].weight, 0);
}

/** Total open-task weight. */
export function openWeight(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === 'todo')
    .reduce((sum, t) => sum + PRIORITY_META[t.priority].weight, 0);
}

/** Distraction minutes within a time window (default: today). */
export function distractionMinutes(
  distractions: Distraction[],
  sinceMs?: number,
): number {
  const cutoff = sinceMs ?? startOfTodayMs();
  return distractions
    .filter((d) => d.loggedAt >= cutoff)
    .reduce((sum, d) => sum + d.minutes, 0);
}

/** Distraction minutes for a specific calendar day key. */
export function distractionMinutesForDay(distractions: Distraction[], dayKey: string): number {
  return distractions
    .filter((d) => dayKeyFromMs(d.loggedAt) === dayKey)
    .reduce((sum, d) => sum + d.minutes, 0);
}

/** Count of distractions logged since a cutoff. */
export function distractionCount(distractions: Distraction[], sinceMs?: number): number {
  const cutoff = sinceMs ?? startOfTodayMs();
  return distractions.filter((d) => d.loggedAt >= cutoff).length;
}

export function completedToday(tasks: Task[]): number {
  const today = todayKey();
  return tasks.filter((t) => t.status === 'done' && t.completedAt && dayKeyFromMs(t.completedAt) === today).length;
}

export function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Productivity score 0..100.
 * Rewards completed-task weight, penalizes distraction minutes.
 * A balanced day: ~3 medium tasks done + <60 min distraction ≈ 75+.
 */
export function productivityScore(state: AppState): number {
  const cw = completedWeight(state.tasks);
  const mins = distractionMinutes(state.distractions);
  const open = openWeight(state.tasks);

  // Base from completed work
  const base = Math.min(70, cw * 10);

  // Distraction penalty: every 10 mins over a 20-min freebie costs ~3 points
  const freebie = 20;
  const penalty = Math.max(0, mins - freebie) * 0.3;

  // Small bonus for having no open backlog
  const focusBonus = open === 0 && cw > 0 ? 8 : 0;

  // Streak bonus
  const streakBonus = Math.min(12, state.streak * 2);

  const raw = base + focusBonus + streakBonus - penalty;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export type ScoreTier = 'legendary' | 'solid' | 'mid' | 'flop' | 'disaster';

export function scoreTier(score: number): ScoreTier {
  if (score >= 90) return 'legendary';
  if (score >= 70) return 'solid';
  if (score >= 45) return 'mid';
  if (score >= 20) return 'flop';
  return 'disaster';
}

export const TIER_META: Record<ScoreTier, { label: string; color: string }> = {
  legendary: { label: 'Suspiciously Productive', color: 'neon-lime' },
  solid: { label: 'Actually Trying', color: 'neon-green' },
  mid: { label: 'Mid Energy', color: 'neon-cyan' },
  flop: { label: 'Rough Day, Champ', color: 'neon-amber' },
  disaster: { label: 'Absolutely Cooked', color: 'neon-magenta' },
};

/** Format minutes as "1h 23m" / "23m". */
export function fmtMins(mins: number): string {
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
