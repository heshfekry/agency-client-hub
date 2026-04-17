import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ThemeBucket {
  key: string;
  label: string;
  count: number;
  pct: number;
  quotes: string[];
}

interface InsightsData {
  agency: { total: number; classified: number; themes: ThemeBucket[] };
  inhouse: { total: number; classified: number; themes: ThemeBucket[] };
}

const AGENCY_COLORS = ["#3DCDD0", "#27A8AB", "#7B68EE", "#E6A020", "#D61F2B", "#8A8A7A", "#3DCDD0", "#27A8AB"];
const INHOUSE_COLORS = ["#D61F2B", "#E6A020", "#7B68EE", "#3DCDD0", "#8A8A7A", "#27A8AB"];

const ThemeCard = ({
  theme,
  color,
}: {
  theme: ThemeBucket;
  color: string;
}) => (
  <div className="rounded-[8px] border border-border bg-card p-3 flex flex-col">
    <div className="font-display text-[28px] font-bold leading-none" style={{ color }}>
      {theme.pct}%
    </div>
    <div className="mt-2 font-body text-[11px] leading-snug text-muted-foreground">{theme.label}</div>
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full" style={{ width: `${theme.pct}%`, backgroundColor: color }} />
    </div>
  </div>
);

const ThemeRow = ({
  title,
  subtitle,
  themes,
  colors,
}: {
  title: string;
  subtitle: string;
  themes: ThemeBucket[];
  colors: string[];
}) => (
  <div className="mb-8">
    <div className="mb-3">
      <h3 className="font-display text-base font-normal text-foreground">{title}</h3>
      <p className="font-body text-[11px] text-muted-foreground">{subtitle}</p>
    </div>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
      {themes.slice(0, 10).map((t, i) => (
        <ThemeCard key={t.key} theme={t} color={colors[i % colors.length]} />
      ))}
    </div>
  </div>
);

const QuoteStrip = ({ data }: { data: InsightsData }) => {
  // Pick top 2 quotes from top 3 themes per side
  const pickQuotes = (themes: ThemeBucket[], max: number) => {
    const quotes: { text: string; theme: string }[] = [];
    for (const theme of themes) {
      for (const q of theme.quotes) {
        if (quotes.length >= max) break;
        if (!quotes.find((x) => x.text === q)) quotes.push({ text: q, theme: theme.label });
      }
      if (quotes.length >= max) break;
    }
    return quotes;
  };

  const agencyQuotes = pickQuotes(data.agency.themes, 4);
  const inhouseQuotes = pickQuotes(data.inhouse.themes, 4);

  if (agencyQuotes.length === 0 && inhouseQuotes.length === 0) return null;

  return (
    <div className="mt-6 border-t border-border pt-6">
      <h3 className="mb-4 font-display text-base font-normal text-foreground">In their own words</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {agencyQuotes.map((q, i) => (
          <div key={`a-${i}`} className="rounded-lg p-4 bg-cxl-cyan-light">
            <p className="font-display text-[13px] italic leading-relaxed" style={{ color: "#1a6e70" }}>
              "{q.text}"
            </p>
            <div className="mt-2 font-body text-[10px] uppercase tracking-wider" style={{ color: "#1a6e70", opacity: 0.7 }}>
              Agency · {q.theme}
            </div>
          </div>
        ))}
        {inhouseQuotes.map((q, i) => (
          <div key={`i-${i}`} className="rounded-lg p-4 bg-cxl-red-light">
            <p className="font-display text-[13px] italic leading-relaxed" style={{ color: "#7a1219" }}>
              "{q.text}"
            </p>
            <div className="mt-2 font-body text-[10px] uppercase tracking-wider" style={{ color: "#7a1219", opacity: 0.7 }}>
              In-house · {q.theme}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CommunityInsights = () => {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: res, error: err } = await supabase.functions.invoke("gate-insights");
        if (err) throw err;
        if (!cancelled) setData(res as InsightsData);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mb-5 rounded-[10px] border border-border bg-card p-6">
      <div className="mb-1 flex items-end justify-between gap-3 flex-wrap">
        <h2 className="font-display text-[20px] font-normal text-foreground">What this community is saying</h2>
        {data && (
          <div className="font-body text-[11px] text-muted-foreground">
            Live from {data.agency.total + data.inhouse.total} responses
          </div>
        )}
      </div>
      <p className="mb-6 font-body text-[12px] text-muted-foreground">
        Aggregated from readers of this report — refreshes as new responses come in
      </p>

      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[110px] animate-pulse rounded-[8px] border border-border bg-muted/40" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 font-body text-[12px] text-destructive">
          Could not load live insights: {error}
        </div>
      )}

      {data && !loading && (
        <>
          <ThemeRow
            title="What agencies say they need to win"
            subtitle={`${data.agency.total} agency responses · % of all agency answers mentioning each theme`}
            themes={data.agency.themes}
            colors={AGENCY_COLORS}
          />
          <ThemeRow
            title="How AI changed what brands buy from agencies"
            subtitle={`${data.inhouse.total} in-house responses · % of all in-house answers mentioning each theme`}
            themes={data.inhouse.themes}
            colors={INHOUSE_COLORS}
          />
          <QuoteStrip data={data} />
        </>
      )}
    </div>
  );
};

export default CommunityInsights;
