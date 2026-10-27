import { useEffect, useState } from 'react';
import type { Roast } from '@/lib/roasts';

interface Props {
  roast: Roast;
}

const TONE_STYLES: Record<Roast['tone'], { color: string; bg: string; emoji: string }> = {
  roast: { color: 'text-neon-magenta', bg: 'from-neon-magenta/10', emoji: '🔥' },
  backhanded: { color: 'text-neon-amber', bg: 'from-neon-amber/10', emoji: '😏' },
  cheer: { color: 'text-neon-lime', bg: 'from-neon-lime/10', emoji: '👏' },
  neutral: { color: 'text-neon-cyan', bg: 'from-neon-cyan/10', emoji: '✨' },
};

export function RoastBanner({ roast }: Props) {
  // Re-trigger animation when the text changes
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey((k) => k + 1);
  }, [roast.text]);

  const s = TONE_STYLES[roast.tone];

  return (
    <div
      key={key}
      className={`animate-slide-down relative overflow-hidden rounded-2xl border border-ink-700 bg-gradient-to-r ${s.bg} to-transparent p-4 pl-5`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">{s.emoji}</span>
        <p className={`font-display text-base font-medium leading-snug ${s.color}`}>
          {roast.text}
        </p>
      </div>
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: 'currentColor' }}
      />
    </div>
  );
}
