import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DonutProps {
  title: string;
  subtitle: string;
  data: { name: string; value: number; color: string }[];
  total: number;
}

const DonutPanel = ({ title, subtitle, data, total }: DonutProps) => (
  <div className="rounded-[10px] border border-border bg-card p-6">
    <div className="mb-0.5 font-display text-base font-normal text-foreground">{title}</div>
    <div className="mb-5 font-body text-[11px]" style={{ color: 'hsl(var(--cxl-text-faint))' }}>{subtitle}</div>
    <div className="h-[190px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" strokeWidth={2} stroke="hsl(var(--cxl-cream))">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [`${value} agencies`, name]} contentStyle={{ fontFamily: 'Inter', fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      {data.map((d, i) => (
        <span key={i} className="flex items-center gap-1.5 font-body text-[11px] text-muted-foreground">
          <span className="h-[9px] w-[9px] shrink-0 rounded-sm" style={{ backgroundColor: d.color }} />
          {d.name} · {Math.round((d.value / total) * 100)}%
        </span>
      ))}
    </div>
  </div>
);

const freqData = [
  { name: 'Almost every client', value: 4, color: '#D61F2B' },
  { name: 'Often', value: 5, color: '#3DCDD0' },
  { name: 'Occasionally', value: 3, color: '#E6A020' },
  { name: 'Rarely', value: 3, color: '#8A8A7A' },
];

const serviceData = [
  { name: 'No changes yet', value: 6, color: '#8A8A7A' },
  { name: 'Added AI services', value: 5, color: '#3DCDD0' },
  { name: 'AI consulting', value: 1, color: '#27A8AB' },
  { name: 'Always flexible', value: 3, color: '#E6A020' },
];

const DonutCharts = () => (
  <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
    <DonutPanel title="How often clients ask about AI" subtitle="Wynter panel, n=15 agency leaders" data={freqData} total={15} />
    <DonutPanel title="Have services changed because of AI?" subtitle="Wynter panel, n=15 agency leaders" data={serviceData} total={15} />
  </div>
);

export default DonutCharts;
