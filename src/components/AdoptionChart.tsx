import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'AI-first', value: 2, color: '#D61F2B' },
  { name: 'Most workflows', value: 7, color: '#3DCDD0' },
  { name: 'Some workflows', value: 5, color: '#27A8AB' },
  { name: 'Experimenting', value: 4, color: '#E6A020' },
  { name: 'Minimal', value: 1, color: '#8A8A7A' },
];

const AdoptionChart = () => (
  <div className="mb-5 rounded-[10px] border border-border bg-card p-6">
    <div className="mb-0.5 font-display text-base font-normal text-foreground">How agencies describe their current AI integration</div>
    <div className="mb-5 font-body text-[11px]" style={{ color: 'hsl(var(--cxl-text-faint))' }}>Wynter panel, n=15 agency leaders — self-reported</div>
    <div className="h-[165px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#8A8A7A' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#8A8A7A' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip formatter={(value: number) => [`${value} agencies`]} contentStyle={{ fontFamily: 'Inter', fontSize: 12 }} />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default AdoptionChart;
