import { useMemo, useState } from 'react';
import { LayoutDashboard, ListTodo, Timer, RotateCcw, Github } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { productivityScore } from '@/lib/score';
import { getRoast, milestoneRoast } from '@/lib/roasts';
import { Dashboard } from '@/components/Dashboard';
import { TaskManager } from '@/components/TaskManager';
import { DistractionTracker } from '@/components/DistractionTracker';
import { HonestMode } from '@/components/HonestMode';
import { RoastBanner } from '@/components/RoastBanner';
import type { DistractionCategory, Priority } from '@/types';

type View = 'dashboard' | 'tasks' | 'distractions';

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'distractions', label: 'Distractions', icon: Timer },
];

export default function App() {
  const { state, dispatch } = useAppState();
  const [view, setView] = useState<View>('dashboard');
  const [honestOpen, setHonestOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const score = productivityScore(state);
  const roast = useMemo(() => getRoast(state), [state]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  const handleAddTask = (title: string, priority: Priority, deadline: string) => {
    const wasZero = state.tasks.filter((t) => t.status === 'done').length === 0;
    dispatch({ type: 'add-task', title, priority, deadline });
    if (wasZero) flash('Task added. Bold of you to assume it gets done.');
  };

  const handleToggleTask = (id: string) => {
    const task = state.tasks.find((t) => t.id === id);
    const completing = task?.status === 'todo';
    dispatch({ type: 'toggle-task', id });
    if (completing) {
      const doneCount = state.tasks.filter((t) => t.status === 'done').length;
      if (doneCount === 0) flash(milestoneRoast('first-task', {}));
    }
  };

  const handleAddDistraction = (name: string, category: DistractionCategory, minutes: number) => {
    const prevCount = state.distractions.length;
    dispatch({ type: 'add-distraction', name, category, minutes });
    if (prevCount === 0) flash(milestoneRoast('first-distraction', { tabs: 1 }));
    else flash(milestoneRoast('first-distraction', { tabs: prevCount + 1 }));
  };

  const handleReset = () => {
    if (window.confirm('Wipe ALL your data? Your procrastination record will be erased. There is no undo.')) {
      dispatch({ type: 'reset' });
      flash("Fresh start. The slate is clean. It won't stay that way.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none fixed -left-40 top-[-10%] h-[480px] w-[480px] animate-drift rounded-full bg-neon-magenta/10 blur-[120px]" />
      <div className="pointer-events-none fixed right-[-15%] top-[20%] h-[420px] w-[420px] animate-drift rounded-full bg-neon-cyan/10 blur-[120px]" style={{ animationDelay: '4s' }} />
      <div className="pointer-events-none fixed bottom-[-15%] left-[30%] h-[400px] w-[400px] animate-drift rounded-full bg-neon-lime/10 blur-[120px]" style={{ animationDelay: '8s' }} />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-magenta/40 bg-neon-magenta/10 shadow-neon-pink">
              <Timer size={18} className="text-neon-magenta" />
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-base font-bold tracking-tight">
                Procrastination <span className="text-neon-magenta neon-text-pink">Simulator</span>
              </h1>
              <p className="hidden text-[10px] uppercase tracking-[0.2em] text-ink-400 sm:block">
                track how creatively you avoid work
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-3 py-1.5 sm:flex">
              <span className="text-xs text-ink-400">Score</span>
              <span
                className="font-mono text-sm font-bold tabular-nums"
                style={{ color: score >= 70 ? '#c6ff3a' : score >= 45 ? '#3af6ff' : '#ff2a78' }}
              >
                {score}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-3 py-1.5 text-xs text-ink-400 transition hover:border-neon-red/50 hover:text-neon-red"
              title="Reset all data"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = view === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className={`relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    active ? 'text-white' : 'text-ink-400 hover:text-white'
                  }`}
                >
                  <Icon size={15} />
                  {n.label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-neon-magenta shadow-neon-pink" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Roast banner */}
        <div className="mb-6">
          <RoastBanner roast={roast} />
        </div>

        {/* View */}
        <div key={view} className="animate-fade-up">
          {view === 'dashboard' && <Dashboard state={state} />}
          {view === 'tasks' && (
            <TaskManager
              state={state}
              onAdd={handleAddTask}
              onToggle={handleToggleTask}
              onDelete={(id) => dispatch({ type: 'delete-task', id })}
            />
          )}
          {view === 'distractions' && (
            <DistractionTracker
              state={state}
              onAdd={handleAddDistraction}
              onDelete={(id) => dispatch({ type: 'delete-distraction', id })}
              onOpenTimer={() => setHonestOpen(true)}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center gap-1 border-t border-ink-800 pt-6 text-center">
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-ink-500">
            <Github size={12} /> Data lives only in your browser. No accounts. No judgement. (Okay, some judgement.)
          </p>
        </footer>
      </main>

      {/* Floating Honest Mode button */}
      <button
        onClick={() => setHonestOpen(true)}
        className="group fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-neon-magenta px-4 py-3 font-display text-sm font-semibold text-white shadow-neon-pink transition hover:scale-105 active:scale-95"
        title="Open Honest Mode timer"
      >
        <Timer size={18} />
        <span className="hidden sm:inline">Honest Mode</span>
        <span className="absolute inset-0 -z-10 animate-pulse-glow rounded-full bg-neon-magenta/40 blur-md" />
      </button>

      {/* Honest Mode modal */}
      <HonestMode
        open={honestOpen}
        onClose={() => setHonestOpen(false)}
        onLog={(name, category, minutes) => {
          handleAddDistraction(name, category, minutes);
        }}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 animate-slide-down">
          <div className="rounded-full border border-ink-600 bg-ink-850/95 px-4 py-2.5 text-sm text-white shadow-neon-soft backdrop-blur">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
