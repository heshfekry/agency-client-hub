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
  expanded,
  onToggle,
}: {
  theme: ThemeBucket;
  color: string;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const hasQuotes = theme.quotes.length > 0;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!hasQuotes}
      aria-expanded={expanded}
      className={`group rounded-[8px] border bg-card p-3 flex flex-col text-left transition-all ${
        expanded ? "border-foreground/30 ring-2 ring-foreground/10" : "border-border hover:border-foreground/20"
      } ${hasQuotes ? "cursor-pointer" : "cursor-default opacity-80"}`}
    >
      <div className="font-display text-[28px] leading-none" style={{ color }}>
        {theme.pct}%
      </div>
      <div className="mt-2 font-body text-[11px] leading-snug text-muted-foreground">{theme.label}</div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${theme.pct}%`, backgroundColor: color }} />
      </div>
      {hasQuotes && (
        <div className="mt-2 font-body text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {expanded ? "Hide quotes ▴" : `${theme.quotes.length} quote${theme.quotes.length === 1 ? "" : "s"} ▾`}
        </div>
      )}
    </button>
  );
};

const ExpandedQuotes = ({ theme, color }: { theme: ThemeBucket; color: string }) => (
  <div className="col-span-full rounded-[8px] border border-border bg-muted/30 p-4">
    <div className="mb-3 font-display text-[12px] uppercase tracking-wider" style={{ color }}>
      {theme.label} — verbatim responses
    </div>
    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
      {theme.quotes.map((q, i) => (
        <div key={i} className="rounded-lg bg-card p-3 border border-border">
          <p className="font-body text-[12px] italic leading-relaxed text-foreground">"{q}"</p>
        </div>
      ))}
    </div>
  </div>
);

const ThemeRow = ({
  title,
  subtitle,
  themes,
  colors,
  expandedKey,
  onToggle,
  side,
}: {
  title: string;
  subtitle: string;
  themes: ThemeBucket[];
  colors: string[];
  expandedKey: string | null;
  onToggle: (key: string) => void;
  side: string;
}) => {
  const expanded = themes.find((t) => `${side}-${t.key}` === expandedKey);
  const expandedColor = expanded ? colors[themes.findIndex((t) => t.key === expanded.key) % colors.length] : "#000";
  return (
    <div className="mb-8">
      <div className="mb-3">
        <h3 className="font-display text-base text-foreground">{title}</h3>
        <p className="font-body text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        {themes.slice(0, 10).map((t, i) => (
          <ThemeCard
            key={t.key}
            theme={t}
            color={colors[i % colors.length]}
            expanded={expandedKey === `${side}-${t.key}`}
            onToggle={() => onToggle(`${side}-${t.key}`)}
          />
        ))}
        {expanded && <ExpandedQuotes theme={expanded} color={expandedColor} />}
      </div>
    </div>
  );
};

const CommunityInsights = () => {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

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

  const handleToggle = (key: string) => {
    setExpandedKey((cur) => (cur === key ? null : key));
  };

  return (
    <div className="mb-5 rounded-[10px] border border-border bg-card p-6">
      <div className="mb-1 flex items-end justify-between gap-3 flex-wrap">
        <h2 className="font-display text-[20px] text-foreground">What this community is saying</h2>
        {data && (
          <div className="font-body text-[11px] text-muted-foreground">
            Live from {data.agency.total + data.inhouse.total} responses
          </div>
        )}
      </div>
      <p className="mb-6 font-body text-[12px] text-muted-foreground">
        Click any card to see the verbatim responses behind it. Refreshes as new responses come in.
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
            expandedKey={expandedKey}
            onToggle={handleToggle}
            side="agency"
          />
          <ThemeRow
            title="How AI changed what brands buy from agencies"
            subtitle={`${data.inhouse.total} in-house responses · % of all in-house answers mentioning each theme`}
            themes={data.inhouse.themes}
            colors={INHOUSE_COLORS}
            expandedKey={expandedKey}
            onToggle={handleToggle}
            side="inhouse"
          />
        </>
      )}
    </div>
  );
};

export default CommunityInsights;
