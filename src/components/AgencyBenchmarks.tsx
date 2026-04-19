import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Building2, Sparkles, TrendingUp } from "lucide-react";

interface DimensionAvg {
  clientCommunication: number;
  teamAdoption: number;
  workflowAutomation: number;
  servicePositioning: number;
  pricingModel: number;
}

interface AnonymizedAgency {
  label: string;
  region: string;
  overall_score: number;
  services: string[];
}

interface BenchmarksData {
  community: {
    n: number;
    avgOverall: number;
    avgDimensions: DimensionAvg;
  } | null;
  topAgencies: {
    n: number;
    avgOverall: number;
    avgDimensions: DimensionAvg;
    rows: AnonymizedAgency[];
  } | null;
}

const DIM_LABELS: { key: keyof DimensionAvg; label: string }[] = [
  { key: "clientCommunication", label: "Client Communication" },
  { key: "teamAdoption", label: "Team Adoption" },
  { key: "workflowAutomation", label: "Workflow Automation" },
  { key: "servicePositioning", label: "Service Positioning" },
  { key: "pricingModel", label: "Pricing Model" },
];

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

function aggregateDimensions(records: { results: any }[]): DimensionAvg {
  const buckets: Record<string, number[]> = {
    clientCommunication: [],
    teamAdoption: [],
    workflowAutomation: [],
    servicePositioning: [],
    pricingModel: [],
  };

  records.forEach((r) => {
    const dims = r.results?.dimensions ?? [];
    dims.forEach((d: any) => {
      const map: Record<string, keyof DimensionAvg> = {
        "Client Communication": "clientCommunication",
        "Team Adoption": "teamAdoption",
        "Workflow Automation": "workflowAutomation",
        "Service Positioning": "servicePositioning",
        "Pricing Model": "pricingModel",
      };
      const key = map[d.shortName];
      if (key && typeof d.score === "number") buckets[key].push(d.score);
    });
  });

  return {
    clientCommunication: avg(buckets.clientCommunication),
    teamAdoption: avg(buckets.teamAdoption),
    workflowAutomation: avg(buckets.workflowAutomation),
    servicePositioning: avg(buckets.servicePositioning),
    pricingModel: avg(buckets.pricingModel),
  };
}

const ScoreBar = ({ value, max = 5, accent }: { value: number; max?: number; accent: string }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
    </div>
  );
};

const PanelStat = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="font-body text-[12px] text-muted-foreground">{label}</span>
      <span className="font-display text-sm text-foreground">{value > 0 ? value.toFixed(1) : "—"}</span>
    </div>
    <ScoreBar value={value} accent={accent} />
  </div>
);

const AgencyBenchmarks = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BenchmarksData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [assessmentsRes, topAgenciesRes] = await Promise.all([
          supabase
            .from("assessments")
            .select("overall_score, results")
            .order("created_at", { ascending: false })
            .limit(500),
          supabase
            .from("top_agencies")
            .select("anonymous_label, region, overall_score, services, dimension_scores")
            .order("overall_score", { ascending: false })
            .limit(20),
        ]);

        const assessments = assessmentsRes.data ?? [];
        const topAgencies = topAgenciesRes.data ?? [];

        const community =
          assessments.length > 0
            ? {
                n: assessments.length,
                avgOverall: avg(assessments.map((a) => Number(a.overall_score) || 0)),
                avgDimensions: aggregateDimensions(assessments),
              }
            : null;

        const topAgenciesAgg =
          topAgencies.length > 0
            ? {
                n: topAgencies.length,
                avgOverall: avg(topAgencies.map((a) => Number(a.overall_score) || 0)),
                avgDimensions: ((): DimensionAvg => {
                  const buckets: Record<string, number[]> = {
                    clientCommunication: [],
                    teamAdoption: [],
                    workflowAutomation: [],
                    servicePositioning: [],
                    pricingModel: [],
                  };
                  topAgencies.forEach((row: any) => {
                    const ds = row.dimension_scores ?? {};
                    Object.keys(buckets).forEach((k) => {
                      if (typeof ds[k] === "number") buckets[k].push(ds[k]);
                    });
                  });
                  return {
                    clientCommunication: avg(buckets.clientCommunication),
                    teamAdoption: avg(buckets.teamAdoption),
                    workflowAutomation: avg(buckets.workflowAutomation),
                    servicePositioning: avg(buckets.servicePositioning),
                    pricingModel: avg(buckets.pricingModel),
                  };
                })(),
                rows: topAgencies.map((r: any) => ({
                  label: r.anonymous_label,
                  region: r.region,
                  overall_score: Number(r.overall_score) || 0,
                  services: r.services ?? [],
                })),
              }
            : null;

        if (!cancelled) setData({ community, topAgencies: topAgenciesAgg });
      } catch (e) {
        if (!cancelled) setData({ community: null, topAgencies: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-[10px] border border-border bg-card p-6">
      <div className="mb-1 flex items-end justify-between gap-3 flex-wrap">
        <h2 className="font-display text-[20px] text-foreground">How agencies stack up</h2>
        {data?.community && (
          <div className="font-body text-[11px] text-muted-foreground">
            Live from {data.community.n} community submissions
          </div>
        )}
      </div>
      <p className="mb-6 font-body text-[12px] text-muted-foreground">
        Anonymized averages across agencies that have scored themselves, plus 20 leading B2B agencies we scored. Refreshes as new assessments come in.
      </p>

      {/* Two side-by-side aggregate panels */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Community panel */}
        <div className="rounded-[8px] border border-border bg-background p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-cxl-cyan" />
            <h3 className="font-display text-base text-foreground">Community average</h3>
          </div>
          {loading && <div className="h-32 animate-pulse rounded bg-muted/40" />}
          {!loading && data?.community && (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl text-cxl-cyan">
                  {data.community.avgOverall.toFixed(1)}
                </span>
                <span className="font-body text-sm text-muted-foreground">/ 5 overall</span>
              </div>
              {DIM_LABELS.map((d) => (
                <PanelStat
                  key={d.key}
                  label={d.label}
                  value={data.community!.avgDimensions[d.key]}
                  accent="hsl(var(--cxl-cyan))"
                />
              ))}
            </div>
          )}
          {!loading && !data?.community && (
            <p className="font-body text-sm text-muted-foreground">
              No community submissions yet. Be the first to score your agency.
            </p>
          )}
        </div>

        {/* Top agencies panel */}
        <div className="rounded-[8px] border border-border bg-background p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cxl-amber" />
            <h3 className="font-display text-base text-foreground">Top 20 B2B agencies</h3>
          </div>
          {loading && <div className="h-32 animate-pulse rounded bg-muted/40" />}
          {!loading && data?.topAgencies && (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl text-cxl-amber">
                  {data.topAgencies.avgOverall.toFixed(1)}
                </span>
                <span className="font-body text-sm text-muted-foreground">/ 5 overall</span>
              </div>
              {DIM_LABELS.map((d) => (
                <PanelStat
                  key={d.key}
                  label={d.label}
                  value={data.topAgencies!.avgDimensions[d.key]}
                  accent="hsl(var(--cxl-amber))"
                />
              ))}
            </div>
          )}
          {!loading && !data?.topAgencies && (
            <p className="font-body text-sm text-muted-foreground">
              Top-20 leaderboard coming soon — we're scoring leading agencies now.
            </p>
          )}
        </div>
      </div>

      {/* Anonymized leaderboard list */}
      {!loading && data?.topAgencies && data.topAgencies.rows.length > 0 && (
        <div className="mb-6 rounded-[8px] border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-foreground" />
            <h4 className="font-display text-sm text-foreground">Anonymized leaderboard</h4>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {data.topAgencies.rows.slice(0, 20).map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-md bg-card px-3 py-2 border border-border"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm text-foreground truncate">{row.label}</div>
                  <div className="font-body text-[11px] text-muted-foreground truncate">
                    {row.region} · {row.services.slice(0, 3).join(" · ") || "—"}
                  </div>
                </div>
                <div className="font-display text-base text-cxl-amber shrink-0">
                  {row.overall_score.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Value statement + CTA */}
      <div className="rounded-[8px] border-2 border-cxl-red/30 bg-cxl-red-light p-5">
        <h3 className="font-display text-lg text-foreground mb-2">
          See where you actually stand
        </h3>
        <p className="font-body text-sm text-muted-foreground mb-4 leading-relaxed">
          Get a free, AI-generated scorecard of your agency benchmarked against the community and the top 20 B2B agencies above.
          Your data is anonymized and only the aggregate score appears here. Takes about 3 minutes.
        </p>
        <button
          onClick={() => navigate("/scorecard")}
          className="inline-flex items-center gap-2 rounded-lg bg-cxl-red px-5 py-2.5 font-body text-sm font-bold text-primary-foreground transition hover:bg-cxl-red/90"
        >
          Score my agency
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AgencyBenchmarks;
