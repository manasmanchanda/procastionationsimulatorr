import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppState, Task, Distraction, Priority, DistractionCategory } from '@/types';
import { loadState, saveState, resetState, uid, todayKey } from '@/lib/storage';
import { recomputeStreak } from '@/lib/streak';

export type Action =
  | { type: 'add-task'; title: string; priority: Priority; deadline: string }
  | { type: 'toggle-task'; id: string }
  | { type: 'delete-task'; id: string }
  | { type: 'add-distraction'; name: string; category: DistractionCategory; minutes: number }
  | { type: 'delete-distraction'; id: string }
  | { type: 'reset' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'add-task': {
      const task: Task = {
        id: uid(),
        title: action.title.trim(),
        priority: action.priority,
        deadline: action.deadline,
        status: 'todo',
        createdAt: Date.now(),
        completedAt: null,
      };
      if (!task.title) return state;
      const next = { ...state, tasks: [task, ...state.tasks] };
      return applyStreak(next);
    }
    case 'toggle-task': {
      const tasks = state.tasks.map((t) => {
        if (t.id !== action.id) return t;
        const done = t.status === 'todo';
        return { ...t, status: (done ? 'done' : 'todo') as Task['status'], completedAt: done ? Date.now() : null };
      });
      return applyStreak({ ...state, tasks });
    }
    case 'delete-task': {
      return applyStreak({ ...state, tasks: state.tasks.filter((t) => t.id !== action.id) });
    }
    case 'add-distraction': {
      const d: Distraction = {
        id: uid(),
        name: action.name.trim() || 'Unnamed time crime',
        category: action.category,
        minutes: Math.max(1, Math.round(action.minutes)),
        loggedAt: Date.now(),
      };
      return applyStreak({ ...state, distractions: [d, ...state.distractions] });
    }
    case 'delete-distraction': {
      return applyStreak({ ...state, distractions: state.distractions.filter((d) => d.id !== action.id) });
    }
    case 'reset': {
      return resetState();
    }
    default:
      return state;
  }
}

function applyStreak(state: AppState): AppState {
  const { streak, bestStreak, lastStreakDay } = recomputeStreak(state);
  return { ...state, streak, bestStreak, lastStreakDay };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadState();
    return applyStreak(loaded);
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const dispatch = useCallback((action: Action) => {
    setState((prev) => reducer(prev, action));
  }, []);

  const stats = useMemo(() => {
    const today = todayKey();
    const distractionsToday = state.distractions.filter((d) => {
      const djs = new Date(d.loggedAt);
      return `${djs.getFullYear()}-${String(djs.getMonth() + 1).padStart(2, '0')}-${String(djs.getDate()).padStart(2, '0')}` === today;
    });
    const wastedToday = distractionsToday.reduce((s, d) => s + d.minutes, 0);
    const tasksDone = state.tasks.filter((t) => t.status === 'done').length;
    const tasksOpen = state.tasks.filter((t) => t.status === 'todo').length;
    return { wastedToday, tasksDone, tasksOpen, distractionsTodayCount: distractionsToday.length };
  }, [state]);

  return { state, dispatch, stats };
}
