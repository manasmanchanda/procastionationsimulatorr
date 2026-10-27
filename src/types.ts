export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'done';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  deadline: string; // ISO date (YYYY-MM-DD)
  status: TaskStatus;
  createdAt: number;
  completedAt: number | null;
}

export type DistractionCategory =
  | 'social'
  | 'video'
  | 'gaming'
  | 'scrolling'
  | 'shopping'
  | 'snack'
  | 'daydream'
  | 'other';

export interface Distraction {
  id: string;
  name: string;
  category: DistractionCategory;
  minutes: number;
  loggedAt: number; // epoch ms
}

export interface AppState {
  tasks: Task[];
  distractions: Distraction[];
  streak: number;
  lastStreakDay: string | null; // YYYY-MM-DD of last clean day
  bestStreak: number;
  startedAt: number;
}

export const DISTRACTION_CATEGORIES: {
  id: DistractionCategory;
  label: string;
  color: string;
  emoji: string;
}[] = [
  { id: 'social', label: 'Social', color: 'neon-pink', emoji: '📱' },
  { id: 'video', label: 'Videos', color: 'neon-red', emoji: '📺' },
  { id: 'gaming', label: 'Gaming', color: 'neon-magenta', emoji: '🎮' },
  { id: 'scrolling', label: 'Doomscroll', color: 'neon-cyan', emoji: '🌀' },
  { id: 'shopping', label: 'Shopping', color: 'neon-amber', emoji: '🛒' },
  { id: 'snack', label: 'Snack raid', color: 'neon-lime', emoji: '🍿' },
  { id: 'daydream', label: 'Daydream', color: 'neon-blue', emoji: '💭' },
  { id: 'other', label: 'Other', color: 'neon-green', emoji: '✨' },
];

export const categoryMeta = (c: DistractionCategory) =>
  DISTRACTION_CATEGORIES.find((x) => x.id === c)!;

export const PRIORITY_META: Record<Priority, { label: string; color: string; weight: number }> = {
  high: { label: 'High', color: 'neon-magenta', weight: 3 },
  medium: { label: 'Medium', color: 'neon-amber', weight: 2 },
  low: { label: 'Low', color: 'neon-cyan', weight: 1 },
};
