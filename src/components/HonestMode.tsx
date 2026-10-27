import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, EyeOff, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import type { DistractionCategory } from '@/types';
import { DISTRACTION_CATEGORIES, categoryMeta } from '@/types';
import { fmtMins } from '@/lib/score';

interface Props {
  open: boolean;
  onClose: () => void;
  onLog: (name: string, category: DistractionCategory, minutes: number) => void;
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

type Phase = 'armed' | 'running' | 'fake';

export function HonestMode({ open, onClose, onLog }: Props) {
  const [phase, setPhase] = useState<Phase>('armed');
  const [category, setCategory] = useState<DistractionCategory>('social');
  const [seconds, setSeconds] = useState(0);
  const [fakeSeconds, setFakeSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Reset when (re)opened
  useEffect(() => {
    if (open) {
      setPhase('armed');
      setSeconds(0);
      setFakeSeconds(0);
    }
  }, [open]);

  // Timer
  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (phase === 'fake') {
      // In fake mode, the distraction timer keeps counting, AND a fake "productive" timer ticks up
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
        setFakeSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [phase]);

  // Esc exits fake mode back to real
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'fake') setPhase('running');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, phase]);

  if (!open) return null;

  const mins = Math.max(1, Math.round(seconds / 60));
  const m = categoryMeta(category);
  const hex = CAT_HEX[m.color];

  const stop = () => {
    if (seconds > 0) {
      onLog(`Honest timer: ${m.label.toLowerCase()}`, category, mins);
    }
    onClose();
  };

  const fmt = (s: number) => {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  // ---- FAKE PRODUCTIVITY SCREEN ----
  if (phase === 'fake') {
    return (
      <div className="fixed inset-0 z-50 bg-ink-950 bg-grid p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-neon-lime" size={22} />
              <span className="font-display text-lg font-semibold text-white">Project Workspace</span>
            </div>
            <span className="font-mono text-xs text-ink-400">Session: {fmt(fakeSeconds)}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {['Q4 Report — drafting', 'Code review — 3 PRs', 'Roadmap — v2.1'].map((t, i) => (
              <div key={i} className="rounded-xl border border-ink-700 bg-ink-850 p-4">
                <div className="mb-2 h-2 w-2/3 rounded-full bg-ink-500" />
                <div className="mb-1.5 h-2 w-full rounded-full bg-ink-600" />
                <div className="mb-3 h-2 w-1/2 rounded-full bg-ink-600" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-ink-400">{t}</span>
                  <span className="h-2 w-2 rounded-full bg-neon-lime shadow-neon-lime" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-ink-700 bg-ink-850 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs text-ink-400">activity log</span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-neon-lime">
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon-lime" /> working
              </span>
            </div>
            <div className="space-y-2 font-mono text-[11px] text-ink-400">
              <p>{'> compiling deliverables...'}</p>
              <p>{'> syncing with team channel...'}</p>
              <p>{'> optimizing workflow pipeline...'}</p>
              <p className="text-neon-lime">{'> status: highly productive'}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setPhase('running')}
              className="flex items-center gap-2 rounded-lg border border-ink-600 px-4 py-2 text-xs text-ink-400 transition hover:border-ink-500 hover:text-white"
            >
              <EyeOff size={14} /> Boss is gone (Esc)
            </button>
            <span className="font-mono text-[10px] text-ink-500">
              The distraction timer is still running underneath. We see everything.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ---- REAL TIMER SCREEN ----
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-950/95 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-neon-soft animate-pop-in">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-neon-magenta" />
            <h2 className="font-display text-lg font-semibold text-white">Honest Mode</h2>
          </div>
          <button onClick={stop} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-700 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className="mb-5 text-sm text-ink-400">
          You're about to get distracted. Be honest: pick what it is, hit start, and let the timer run.
          The moment it stops, it logs itself to your record. No editing the past.
        </p>

        <div className="mb-5">
          <label className="mb-2 block text-xs uppercase tracking-wider text-ink-400">What's the damage?</label>
          <div className="grid grid-cols-4 gap-2">
            {DISTRACTION_CATEGORIES.map((c) => {
              const active = category === c.id;
              const ch = CAT_HEX[c.color];
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  disabled={phase === 'running'}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] transition disabled:opacity-50 ${
                    active ? 'border-current' : 'border-ink-600 hover:border-ink-500'
                  }`}
                  style={active ? { color: ch, boxShadow: `0 0 10px ${ch}55` } : { color: '#4a4a63' }}
                >
                  <span className="text-base">{c.emoji}</span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer display */}
        <div className="mb-5 flex flex-col items-center">
          <div
            className="font-mono text-6xl font-bold tabular-nums"
            style={{ color: hex, textShadow: `0 0 20px ${hex}66` }}
          >
            {fmt(seconds)}
          </div>
          <span className="mt-2 text-xs text-ink-400">
            {phase === 'running' ? "It's counting. We're watching." : 'Ready when you are.'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          {phase === 'armed' ? (
            <button
              onClick={() => setPhase('running')}
              className="flex items-center justify-center gap-2 rounded-lg py-3 font-display text-sm font-semibold text-white transition active:scale-[0.98]"
              style={{ background: hex, boxShadow: `0 0 16px ${hex}66` }}
            >
              <Play size={16} /> Start wasting time
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPhase((p) => (p === 'running' ? 'armed' : 'running'))}
                className="flex items-center justify-center gap-2 rounded-lg border border-ink-600 py-3 font-display text-sm font-semibold text-ink-300 transition hover:border-ink-500"
              >
                <Pause size={16} /> Pause
              </button>
              <button
                onClick={stop}
                className="flex items-center justify-center gap-2 rounded-lg bg-neon-red py-3 font-display text-sm font-semibold text-white transition hover:shadow-[0_0_16px_rgba(255,77,77,0.5)]"
              >
                <Square size={16} /> Stop & log ({fmtMins(mins)})
              </button>
            </div>
          )}

          {phase === 'running' && (
            <button
              onClick={() => setPhase('fake')}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg border border-neon-amber/40 bg-neon-amber/10 py-2.5 font-display text-xs font-semibold text-neon-amber transition hover:bg-neon-amber/20"
            >
              <EyeOff size={14} /> PANIC: someone's coming
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-[10px] text-ink-500">
          Honest Mode is the whole point of this app. No timers, no growth. Just guilt.
        </p>
      </div>
    </div>
  );
}
