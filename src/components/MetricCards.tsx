interface MetricCardProps {
  label: string;
  value: string;
  desc: string;
  bgClass: string;
  borderColor: string;
  valueColor: string;
}

const MetricCard = ({ label, value, desc, bgClass, borderColor, valueColor }: MetricCardProps) => (
  <div
    className={`rounded-lg p-[18px_16px] ${bgClass} animate-fade-up`}
    style={{ border: `1px solid ${borderColor}` }}
  >
    <div className="mb-2 font-body text-[11px] leading-snug text-muted-foreground">{label}</div>
    <div className="mb-1 font-display text-4xl font-normal leading-none" style={{ color: valueColor }}>{value}</div>
    <div className="font-body text-[10px]" style={{ color: 'hsl(var(--cxl-text-faint))' }}>{desc}</div>
  </div>
);

const metrics: MetricCardProps[] = [
  { label: 'Pulled production work in-house', value: '56%', desc: 'replacing agency tasks with AI', bgClass: 'bg-cxl-red-light', borderColor: '#f8c8ca', valueColor: '#D61F2B' },
  { label: 'Expect more output at same or lower cost', value: '44%', desc: 'of marketing leaders', bgClass: 'bg-cxl-cyan-light', borderColor: '#b8f0f2', valueColor: '#27A8AB' },
  { label: 'Evaluate agencies on AI adoption', value: '31%', desc: 'use AI fluency as selection criteria', bgClass: 'bg-cxl-amber-light', borderColor: '#f5dfa8', valueColor: '#E6A020' },
  { label: 'Engaging for strategy only', value: '38%', desc: 'repositioned agency value to judgment', bgClass: 'bg-cxl-purple-light', borderColor: '#d2ccf8', valueColor: '#7B68EE' },
];

const MetricCards = () => (
  <div>
    <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
      {metrics.map((m, i) => (
        <MetricCard key={i} {...m} />
      ))}
    </div>
  </div>
);

export default MetricCards;
