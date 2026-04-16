import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { BenchmarkStat } from '@/lib/scorecard-engine';

interface BenchmarkPanelProps {
  stats: BenchmarkStat[];
}

const BenchmarkPanel = ({ stats }: BenchmarkPanelProps) => {
  const [open, setOpen] = useState(false);

  if (!stats || stats.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 font-body text-[11px] text-muted-foreground transition hover:text-foreground"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
        What the research says
      </button>

      {open && (
        <ul className="mt-2 space-y-2 rounded-lg bg-muted/60 p-3">
          {stats.map((s, i) => (
            <li key={i} className="font-body text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">{s.stat}</span>
              {' '}
              <span className="text-[10px] opacity-70">({s.source})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BenchmarkPanel;
