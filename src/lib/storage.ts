import type { AppState, Task, Distraction } from '@/types';

const STORAGE_KEY = 'procrast-sim-state-v1';

const EMPTY_STATE: AppState = {
  tasks: [],
  distractions: [],
  streak: 0,
  lastStreakDay: null,
  bestStreak: 0,
  startedAt: Date.now(),
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...EMPTY_STATE,
      ...parsed,
      tasks: parsed.tasks ?? [],
      distractions: parsed.distractions ?? [],
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function resetState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return { ...EMPTY_STATE, startedAt: Date.now() };
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dayKeyFromMs(ms: number): string {
  return todayKey(new Date(ms));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export type { Task, Distraction };
