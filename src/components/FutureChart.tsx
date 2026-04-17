import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Strategic partners', value: 6, color: '#3DCDD0' },
  { name: 'Many will disappear', value: 2, color: '#D61F2B' },
  { name: 'Automation operators', value: 2, color: '#E6A020' },
  { name: 'Creative specialists', value: 2, color: '#7B68EE' },
  { name: 'AI consultants', value: 2, color: '#27A8AB' },
  { name: 'Unclear', value: 1, color: '#8A8A7A' },
];

const FutureChart = () => (
  <div className="mb-5 rounded-[10px] border border-border bg-card p-6">
    <div className="mb-5 font-display text-base font-normal text-foreground">What will agencies primarily become in 3 years?</div>
    <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-2">
      <div className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" strokeWidth={2} stroke="hsl(var(--cxl-cream))">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [`${Math.round((value / 15) * 100)}%`, name]} contentStyle={{ fontFamily: 'Inter', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="flex-1 font-body text-xs text-muted-foreground">{d.name}</span>
            <span className="font-body text-[13px] font-bold text-foreground">{Math.round((d.value / 15) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FutureChart;
