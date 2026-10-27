import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { scoreTier, TIER_META, fmtMins, distractionMinutes } from '@/lib/score';
import type { AppState } from '@/types';

interface Props {
  score: number;
  state: AppState;
}

const TIER_COLORS: Record<string, string> = {
  'neon-lime': '#c6ff3a',
  'neon-green': '#5cff9e',
  'neon-cyan': '#3af6ff',
  'neon-amber': '#ffb347',
  'neon-magenta': '#ff2a78',
};

export function ScoreRing({ score, state }: Props) {
  const animated = useAnimatedNumber(score);
  const tier = scoreTier(score);
  const meta = TIER_META[tier];
  const color = TIER_COLORS[meta.color] ?? '#3af6ff';

  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;

  const wasted = distractionMinutes(state.distractions);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#1d1d2a"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke 0.4s ease',
              filter: `drop-shadow(0 0 8px ${color}aa)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-6xl font-bold tabular-nums"
            style={{ color, textShadow: `0 0 16px ${color}99` }}
          >
            {animated}
          </span>
          <span className="mt-1 text-xs uppercase tracking-[0.3em] text-ink-400">Score</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="font-display text-lg font-semibold" style={{ color }}>
          {meta.label}
        </p>
        <p className="mt-1 font-mono text-xs text-ink-400">
          {fmtMins(wasted)} wasted today
        </p>
      </div>
    </div>
  );
}
