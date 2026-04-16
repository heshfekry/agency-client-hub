const bars = [
  { label: 'Content & creative', pct: 93, color: '#3DCDD0' },
  { label: 'Research & data analysis', pct: 87, color: '#27A8AB' },
  { label: 'Image & video tools', pct: 80, color: '#7B68EE' },
  { label: 'AI agents & workflows', pct: 53, color: '#E6A020' },
  { label: 'Coding & internal tools', pct: 53, color: '#E84B52' },
  { label: 'Marketing automation', pct: 33, color: '#8A8A7A' },
];

const TechBars = () => (
  <div className="mb-5 rounded-[10px] border border-border bg-card p-6">
    <div className="mb-0.5 font-display text-base font-normal text-foreground">AI technologies agencies are using</div>
    <div className="mb-5 font-body text-[11px]" style={{ color: 'hsl(var(--cxl-text-faint))' }}>Multiple selections allowed</div>
    <div className="space-y-2.5">
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-3">
          <div className="w-[148px] shrink-0 text-right font-body text-[11px] text-muted-foreground">{bar.label}</div>
          <div className="flex-1 overflow-hidden rounded-[3px] bg-muted" style={{ height: 26 }}>
            <div
              className="flex h-full items-center rounded-[3px] pl-2.5 animate-bar-grow"
              style={{ backgroundColor: bar.color, '--target-width': `${bar.pct}%`, width: `${bar.pct}%` } as React.CSSProperties}
            >
              <span className="font-body text-[11px] font-bold text-primary-foreground">{bar.pct}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TechBars;
