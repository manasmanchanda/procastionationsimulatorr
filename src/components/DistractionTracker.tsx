import { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import type { AppState, DistractionCategory } from '@/types';
import { DISTRACTION_CATEGORIES, categoryMeta } from '@/types';
import { fmtMins, distractionMinutes, distractionCount } from '@/lib/score';

interface Props {
  state: AppState;
  onAdd: (name: string, category: DistractionCategory, minutes: number) => void;
  onDelete: (id: string) => void;
  onOpenTimer: () => void;
}

const CAT_HEX: Record<string, string> = {
  'neon-pink': '#ff4ad8',
  'neon-red': '#ff4d4d',
  'neon-magenta': '#ff2a78',
  'neon-cyan': '#3af6ff',
  'neon-amber': '#ffb347',
  'neon-lime': '#c6ff3a',
  'neon-blue': '#4aa6ff',
  'neon-green': '#5cff9e',
};

export function DistractionTracker({ state, onAdd, onDelete, onOpenTimer }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DistractionCategory>('social');
  const [minutes, setMinutes] = useState(15);

  const submit = () => {
    if (minutes <= 0) return;
    onAdd(name, category, minutes);
    setName('');
    setMinutes(15);
  };

  const wastedToday = distractionMinutes(state.distractions);
  const countToday = distractionCount(state.distractions);

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      {/* Log form */}
      <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-neon-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Confess your distraction</h2>
        </div>

        <div className="mb-4 rounded-xl border border-neon-magenta/30 bg-neon-magenta/5 p-3">
          <button
            onClick={onOpenTimer}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-neon-magenta/15 px-4 py-2.5 font-display text-sm font-semibold text-neon-magenta transition hover:bg-neon-magenta/25 active:scale-[0.98]"
          >
            <Clock size={16} /> Open Honest Mode timer
          </button>
          <p className="mt-2 text-center text-[11px] text-ink-400">
            The honest way: start a live timer the moment you cave. It logs itself.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="What were you doing? (optional)"
            className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-white placeholder:text-ink-400 focus:border-neon-magenta focus:outline-none"
          />

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-ink-400">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {DISTRACTION_CATEGORIES.map((c) => {
                const active = category === c.id;
                const hex = CAT_HEX[c.color];
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] transition ${
                      active ? 'border-current' : 'border-ink-600 hover:border-ink-500'
                    }`}
                    style={active ? { color: hex, boxShadow: `0 0 10px ${hex}55` } : { color: '#4a4a63' }}
                  >
                    <span className="text-base">{c.emoji}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs uppercase tracking-wider text-ink-400">
              <span>Minutes</span>
              <span className="font-mono text-neon-magenta">{minutes}m</span>
            </label>
            <input
              type="range"
              min={1}
              max={180}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full accent-neon-magenta"
            />
          </div>

          <button
            onClick={submit}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-neon-magenta px-4 py-2.5 font-display text-sm font-semibold text-white transition hover:shadow-neon-pink active:scale-[0.98]"
          >
            <Plus size={16} /> Log it (sadly)
          </button>
        </div>
      </div>

      {/* Log list */}
      <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-neon-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Distraction log</h2>
          <div className="text-right">
            <p className="font-mono text-xs text-neon-magenta">{fmtMins(wastedToday)} today</p>
            <p className="font-mono text-[10px] text-ink-400">{countToday} entries today</p>
          </div>
        </div>

        {state.distractions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-ink-400">No distractions logged.</p>
            <p className="mt-1 text-sm text-ink-500">Either you're focused... or lying. Probably lying.</p>
          </div>
        ) : (
          <ul className="flex max-h-[480px] flex-col gap-2 overflow-y-auto pr-1">
            {state.distractions.map((d) => {
              const m = categoryMeta(d.category);
              const hex = CAT_HEX[m.color];
              return (
                <li
                  key={d.id}
                  className="group flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-900 p-3 transition hover:border-ink-500"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
                    style={{ background: `${hex}1a`, border: `1px solid ${hex}44` }}
                  >
                    {m.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{d.name}</p>
                    <p className="text-[11px] text-ink-400">
                      {m.label} · {new Date(d.loggedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="font-mono text-sm" style={{ color: hex }}>
                    {fmtMins(d.minutes)}
                  </span>
                  <button
                    onClick={() => onDelete(d.id)}
                    className="shrink-0 rounded-md p-1.5 text-ink-500 opacity-0 transition hover:bg-ink-700 hover:text-neon-red group-hover:opacity-100"
                    aria-label="Delete distraction"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
