import type { AppState } from '@/types';
import { ScoreRing } from '@/components/ScoreRing';
import {
  DistractionChart,
  TaskDonut,
  StreakCard,
  CategoryBars,
} from '@/components/Charts';
import { productivityScore, fmtMins, distractionMinutes, completedToday } from '@/lib/score';
import { CheckCircle2, Clock, Flame, Target } from 'lucide-react';

interface Props {
  state: AppState;
}

export function Dashboard({ state }: Props) {
  const score = productivityScore(state);
  const wasted = distractionMinutes(state.distractions);
  const doneToday = completedToday(state.tasks);

  const statCards = [
    {
      label: 'Done today',
      value: String(doneToday),
      icon: CheckCircle2,
      color: '#c6ff3a',
    },
    {
      label: 'Wasted today',
      value: fmtMins(wasted),
      icon: Clock,
      color: '#ff2a78',
    },
    {
      label: 'Streak',
      value: String(state.streak),
      icon: Flame,
      color: '#5cff9e',
    },
    {
      label: 'Best streak',
      value: String(state.bestStreak),
      icon: Target,
      color: '#3af6ff',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero: score + stats */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-700 bg-ink-850/60 p-6 shadow-neon-soft">
          <ScoreRing score={score} state={state} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col gap-2 rounded-2xl border border-ink-700 bg-ink-850/60 p-4 shadow-neon-soft"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: `${s.color}1a`, border: `1px solid ${s.color}44` }}
                >
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-white tabular-nums">{s.value}</p>
                  <p className="text-xs uppercase tracking-wider text-ink-400">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DistractionChart state={state} />
        <TaskDonut state={state} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StreakCard state={state} />
        <CategoryBars state={state} />
      </div>
    </div>
  );
}
