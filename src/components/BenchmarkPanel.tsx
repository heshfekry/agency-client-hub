import type { BenchmarkStat } from '@/lib/scorecard-engine';

interface BenchmarkPanelProps {
  stats: BenchmarkStat[];
  variant?: 'inline' | 'cards';
  title?: string;
}

const BenchmarkPanel = ({ stats, variant = 'inline', title }: BenchmarkPanelProps) => {
  if (!stats || stats.length === 0) return null;

  if (variant === 'cards') {
    return (
      <div className="space-y-2">
        {title && (
          <div className="font-display text-[11px] uppercase tracking-wider text-muted-foreground">
            {title}
          </div>
        )}
        <div className="grid grid-cols-1 gap-2">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-muted/40 p-3"
            >
              <p className="font-body text-[12px] leading-relaxed text-foreground">
                {s.stat}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ul className="mt-2 space-y-1.5 rounded-lg bg-muted/50 p-3">
      {stats.map((s, i) => (
        <li
          key={i}
          className="font-body text-xs leading-relaxed text-muted-foreground"
        >
          <span className="text-foreground">{s.stat}</span>
        </li>
      ))}
    </ul>
  );
};

export default BenchmarkPanel;
