import type { AppState } from '@/types';
import { todayKey } from '@/lib/storage';
import { distractionMinutesForDay, completedToday, fmtMins } from '@/lib/score';

interface Props {
  state: AppState;
  days?: number;
}

function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  }
  return out;
}

const DAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DistractionChart({ state, days = 7 }: Props) {
  const labels = lastNDays(days);
  const data = labels.map((k) => distractionMinutesForDay(state.distractions, k));
  const max = Math.max(60, ...data);
  const today = todayKey();

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-neon-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
          Wasted time · last {days} days
        </h3>
        <span className="font-mono text-xs text-neon-magenta">
          {fmtMins(data.reduce((a, b) => a + b, 0))} total
        </span>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
        {data.map((mins, i) => {
          const h = Math.max(2, (mins / max) * 140);
          const isToday = labels[i] === today;
          const jsd = new Date(labels[i] + 'T00:00:00');
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div className="relative flex w-full items-end justify-center">
                <div
                  className={`w-full max-w-[34px] rounded-t-md ${
                    isToday ? 'bg-neon-magenta' : 'bg-ink-500'
                  }`}
                  style={{
                    height: h,
                    transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                    boxShadow: isToday ? '0 0 12px rgba(255,42,120,0.5)' : 'none',
                  }}
                  title={`${fmtMins(mins)}`}
                />
              </div>
              <span className={`font-mono text-[10px] ${isToday ? 'text-neon-magenta' : 'text-ink-400'}`}>
                {DAY_LABEL[jsd.getDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TaskDonut({ state }: Props) {
  const done = state.tasks.filter((t) => t.status === 'done').length;
  const open = state.tasks.filter((t) => t.status === 'todo').length;
  const total = done + open;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const size = 140;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-neon-soft">
      <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
        Task completion
      </h3>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1d1d2a" strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#c6ff3a"
              strokeWidth={stroke}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease', filter: 'drop-shadow(0 0 6px rgba(198,255,58,0.6))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold text-neon-lime">{pct}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-neon-lime" />
            <span className="text-ink-400">Done</span>
            <span className="ml-auto font-mono text-white">{done}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-500" />
            <span className="text-ink-400">Open</span>
            <span className="ml-auto font-mono text-white">{open}</span>
          </div>
          <div className="mt-1 border-t border-ink-700 pt-2 text-xs text-ink-400">
            <span className="text-neon-lime">{completedToday(state.tasks)}</span> done today
          </div>
        </div>
      </div>
    </div>
  );
}

export function StreakCard({ state }: Props) {
  const streak = state.streak;
  const best = state.bestStreak;
  const color = streak > 0 ? '#5cff9e' : '#34344a';
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-neon-soft">
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
        Focus streak
      </h3>
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl border"
          style={{
            borderColor: color,
            boxShadow: streak > 0 ? `0 0 16px ${color}66` : 'none',
          }}
        >
          <span
            className="font-display text-3xl font-bold"
            style={{ color, textShadow: streak > 0 ? `0 0 12px ${color}99` : 'none' }}
          >
            {streak}
          </span>
        </div>
        <div className="text-sm">
          <p className="text-white">
            {streak === 0 ? 'No streak yet' : `${streak} clean day${streak === 1 ? '' : 's'}`}
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Best: <span className="text-neon-green">{best}</span> · A clean day = a task done + 0 distractions
          </p>
        </div>
      </div>
    </div>
  );
}

export function categoryBreakdown(state: AppState): { label: string; mins: number; color: string }[] {
  const map = new Map<string, number>();
  for (const d of state.distractions) {
    map.set(d.category, (map.get(d.category) ?? 0) + d.minutes);
  }
  const colors: Record<string, string> = {
    social: '#ff4ad8',
    video: '#ff4d4d',
    gaming: '#ff2a78',
    scrolling: '#3af6ff',
    shopping: '#ffb347',
    snack: '#c6ff3a',
    daydream: '#4aa6ff',
    other: '#5cff9e',
  };
  const labels: Record<string, string> = {
    social: 'Social',
    video: 'Videos',
    gaming: 'Gaming',
    scrolling: 'Doomscroll',
    shopping: 'Shopping',
    snack: 'Snack raid',
    daydream: 'Daydream',
    other: 'Other',
  };
  return Array.from(map.entries())
    .map(([k, mins]) => ({ label: labels[k] ?? k, mins, color: colors[k] ?? '#34344a' }))
    .sort((a, b) => b.mins - a.mins);
}

export function CategoryBars({ state }: Props) {
  const data = categoryBreakdown(state);
  const max = Math.max(1, ...data.map((d) => d.mins));
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-neon-soft">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
          Distraction diet
        </h3>
        <p className="py-6 text-center text-sm text-ink-400">
          No distractions logged. Suspiciously clean. Keep it up... or start being honest.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-neon-soft">
      <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
        Distraction diet
      </h3>
      <div className="flex flex-col gap-3">
        {data.map((d) => (
          <div key={d.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-ink-400">{d.label}</span>
              <span className="font-mono text-white">{fmtMins(d.mins)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(d.mins / max) * 100}%`,
                  background: d.color,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
