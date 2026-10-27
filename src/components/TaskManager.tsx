import { useState } from 'react';
import { Plus, Trash2, Check, Circle, Calendar, Flag } from 'lucide-react';
import type { AppState, Priority } from '@/types';
import { PRIORITY_META } from '@/types';
import { todayKey } from '@/lib/storage';

interface Props {
  state: AppState;
  onAdd: (title: string, priority: Priority, deadline: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const NEON_HEX: Record<string, string> = {
  'neon-magenta': '#ff2a78',
  'neon-amber': '#ffb347',
  'neon-cyan': '#3af6ff',
};

export function TaskManager({ state, onAdd, onToggle, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title, priority, deadline);
    setTitle('');
  };

  const sorted = [...state.tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  const today = todayKey();

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Add form */}
      <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-neon-soft">
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Add a task you'll definitely do</h2>
        <div className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="e.g. Finish the report"
            className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-white placeholder:text-ink-400 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40"
          />

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink-400">
              <Flag size={12} /> Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PRIORITY_META) as Priority[]).map((p) => {
                const m = PRIORITY_META[p];
                const active = priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                      active
                        ? 'border-current text-current'
                        : 'border-ink-600 text-ink-400 hover:border-ink-500'
                    }`}
                    style={active ? { color: NEON_HEX[m.color], boxShadow: `0 0 10px ${NEON_HEX[m.color]}55` } : {}}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink-400">
              <Calendar size={12} /> Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-white focus:border-neon-cyan focus:outline-none"
            />
          </div>

          <button
            onClick={submit}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-neon-lime px-4 py-2.5 font-display text-sm font-semibold text-ink-950 transition hover:shadow-neon-lime active:scale-[0.98]"
          >
            <Plus size={16} /> Add task
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-neon-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Your tasks</h2>
          <span className="font-mono text-xs text-ink-400">
            {state.tasks.filter((t) => t.status === 'todo').length} open
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-ink-400">No tasks yet.</p>
            <p className="mt-1 text-sm text-ink-500">Add one. We dare you to actually finish it.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {sorted.map((t) => {
              const m = PRIORITY_META[t.priority];
              const overdue = t.status === 'todo' && t.deadline < today;
              return (
                <li
                  key={t.id}
                  className={`group flex items-center gap-3 rounded-xl border p-3 transition ${
                    t.status === 'done'
                      ? 'border-ink-700 bg-ink-900/50 opacity-60'
                      : 'border-ink-600 bg-ink-900 hover:border-ink-500'
                  }`}
                >
                  <button
                    onClick={() => onToggle(t.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition"
                    style={{
                      borderColor: t.status === 'done' ? NEON_HEX[m.color] : '#34344a',
                      background: t.status === 'done' ? NEON_HEX[m.color] : 'transparent',
                    }}
                    aria-label={t.status === 'done' ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {t.status === 'done' ? (
                      <Check size={14} className="text-ink-950" />
                    ) : (
                      <Circle size={12} className="text-ink-500" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        t.status === 'done' ? 'text-ink-400 line-through' : 'text-white'
                      }`}
                    >
                      {t.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[11px]">
                      <span style={{ color: NEON_HEX[m.color] }} className="font-medium">
                        {m.label}
                      </span>
                      <span className={overdue ? 'text-neon-red' : 'text-ink-400'}>
                        {overdue ? 'Overdue · ' : ''}
                        {t.deadline}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDelete(t.id)}
                    className="shrink-0 rounded-md p-1.5 text-ink-500 opacity-0 transition hover:bg-ink-700 hover:text-neon-red group-hover:opacity-100"
                    aria-label="Delete task"
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
