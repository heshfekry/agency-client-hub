import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Users, BarChart3 } from "lucide-react";

interface DimensionAvg {
  clientCommunication: number;
  teamAdoption: number;
  workflowAutomation: number;
  servicePositioning: number;
  pricingModel: number;
}

interface BenchmarksData {
  combined: {
    n: number;
    avgOverall: number;
    avgDimensions: DimensionAvg;
    communityN: number;
    topN: number;
  } | null;
}

const DIM_LABELS: { key: keyof DimensionAvg; label: string }[] = [
  { key: "clientCommunication", label: "Client Communication" },
  { key: "teamAdoption", label: "Team Adoption" },
  { key: "workflowAutomation", label: "Workflow Automation" },
  { key: "servicePositioning", label: "Service Positioning" },
  { key: "pricingModel", label: "Pricing Model" },
];

// Industry research benchmarks per dimension — what "good" looks like
// based on the dashboard data and survey research.
const INDUSTRY_TARGETS: { key: keyof DimensionAvg; label: string; target: number; evidence: string }[] = [
  {
    key: "clientCommunication",
    label: "Client Communication",
    target: 4.0,
    evidence: "44% of clients demand AI transparency before engaging",
  },
  {
    key: "teamAdoption",
    label: "Team Adoption",
    target: 4.2,
    evidence: "~50% of agency leaders made AI mandatory firm-wide",
  },
  {
    key: "workflowAutomation",
    label: "Workflow Automation",
    target: 4.0,
    evidence: "Leading agencies cut proposals from 3-4h to <1h",
  },
  {
    key: "servicePositioning",
    label: "Service Positioning",
    target: 3.8,
    evidence: "53% of clients now engage agencies for strategy",
  },
  {
    key: "pricingModel",
    label: "Pricing Model",
    target: 3.5,
    evidence: "Hourly billing most exposed to commoditization",
  },
];

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

function aggregateDimensionsFromAssessments(records: { results: any }[]): Record<keyof DimensionAvg, number[]> {
  const buckets: Record<keyof DimensionAvg, number[]> = {
    clientCommunication: [],
    teamAdoption: [],
    workflowAutomation: [],
    servicePositioning: [],
    pricingModel: [],
  };
  const map: Record<string, keyof DimensionAvg> = {
    "Client Communication": "clientCommunication",
    "Team Adoption": "teamAdoption",
    "Workflow Automation": "workflowAutomation",
    "Service Positioning": "servicePositioning",
    "Pricing Model": "pricingModel",
  };
  records.forEach((r) => {
    const dims = r.results?.dimensions ?? [];
    dims.forEach((d: any) => {
      const key = map[d.shortName];
      if (key && typeof d.score === "number") buckets[key].push(d.score);
    });
  });
  return buckets;
}

function aggregateDimensionsFromTop(records: any[]): Record<keyof DimensionAvg, number[]> {
  const buckets: Record<keyof DimensionAvg, number[]> = {
    clientCommunication: [],
    teamAdoption: [],
    workflowAutomation: [],
    servicePositioning: [],
    pricingModel: [],
  };
  records.forEach((row) => {
    const ds = row.dimension_scores ?? {};
    (Object.keys(buckets) as (keyof DimensionAvg)[]).forEach((k) => {
      if (typeof ds[k] === "number") buckets[k].push(ds[k]);
    });
  });
  return buckets;
}

const ScoreBar = ({
  value,
  max = 5,
  accent,
}: {
  value: number;
  max?: number;
  accent: string;
}) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
    </div>
  );
};

const PanelStat = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="font-body text-[12px] text-muted-foreground">{label}</span>
      <span className="font-display text-sm text-foreground">{value > 0 ? value.toFixed(1) : "—"}</span>
    </div>
    <ScoreBar value={value} accent={accent} />
  </div>
);

const ComparisonRow = ({
  label,
  actual,
  target,
  evidence,
}: {
  label: string;
  actual: number;
  target: number;
  evidence: string;
}) => {
  const gap = actual - target;
  const onTrack = gap >= -0.3;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-[12px] text-muted-foreground">{label}</span>
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="font-display text-sm text-foreground">
            {actual > 0 ? actual.toFixed(1) : "—"}
          </span>
          <span className="font-body text-[11px] text-muted-foreground">
            vs target {target.toFixed(1)}
          </span>
          <span
            className="font-display text-[11px]"
            style={{
              color: onTrack ? "hsl(var(--cxl-cyan))" : "hsl(var(--cxl-red))",
            }}
          >
            {gap >= 0 ? `+${gap.toFixed(1)}` : gap.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 h-full rounded-full"
          style={{
            width: `${Math.min(100, (actual / 5) * 100)}%`,
            backgroundColor: onTrack ? "hsl(var(--cxl-cyan))" : "hsl(var(--cxl-red))",
          }}
        />
        <div
          className="absolute inset-y-0 w-[2px] bg-foreground/60"
          style={{ left: `${(target / 5) * 100}%` }}
          aria-label="industry target"
        />
      </div>
      <p className="font-body text-[11px] text-muted-foreground italic leading-snug">{evidence}</p>
    </div>
  );
};

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
            .select("overall_score, dimension_scores")
            .order("overall_score", { ascending: false })
            .limit(20),
        ]);

        const assessments = assessmentsRes.data ?? [];
        const topAgencies = topAgenciesRes.data ?? [];

        const communityBuckets = aggregateDimensionsFromAssessments(assessments);
        const topBuckets = aggregateDimensionsFromTop(topAgencies);

        const combinedDims: DimensionAvg = {
          clientCommunication: avg([
            ...communityBuckets.clientCommunication,
            ...topBuckets.clientCommunication,
          ]),
          teamAdoption: avg([...communityBuckets.teamAdoption, ...topBuckets.teamAdoption]),
          workflowAutomation: avg([
            ...communityBuckets.workflowAutomation,
            ...topBuckets.workflowAutomation,
          ]),
          servicePositioning: avg([
            ...communityBuckets.servicePositioning,
            ...topBuckets.servicePositioning,
          ]),
          pricingModel: avg([...communityBuckets.pricingModel, ...topBuckets.pricingModel]),
        };

        const combinedOverall = avg([
          ...assessments.map((a) => Number(a.overall_score) || 0),
          ...topAgencies.map((a) => Number(a.overall_score) || 0),
        ]);

        const combined =
          assessments.length + topAgencies.length > 0
            ? {
                n: assessments.length + topAgencies.length,
                avgOverall: combinedOverall,
                avgDimensions: combinedDims,
                communityN: assessments.length,
                topN: topAgencies.length,
              }
            : null;

        if (!cancelled) setData({ combined });
      } catch (e) {
        if (!cancelled) setData({ combined: null });
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
        {data?.combined && (
          <div className="font-body text-[11px] text-muted-foreground">
            {data.combined.communityN} community + {data.combined.topN} top B2B agencies
          </div>
        )}
      </div>
      <p className="mb-6 font-body text-[12px] text-muted-foreground">
        Two views of where the field actually is — and where you'd need to be to lead.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Card 1: Combined community + top-20 average */}
        <div className="rounded-[8px] border border-border bg-background p-5">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-cxl-cyan" />
            <h3 className="font-display text-base text-foreground">Field average</h3>
          </div>
          <p className="font-body text-[11px] text-muted-foreground mb-4">
            Top 20 B2B agencies + every agency that has self-scored, blended into a single benchmark.
          </p>
          {loading && <div className="h-40 animate-pulse rounded bg-muted/40" />}
          {!loading && data?.combined && (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl text-cxl-cyan">
                  {data.combined.avgOverall.toFixed(1)}
                </span>
                <span className="font-body text-sm text-muted-foreground">/ 5 overall</span>
              </div>
              {DIM_LABELS.map((d) => (
                <PanelStat
                  key={d.key}
                  label={d.label}
                  value={data.combined!.avgDimensions[d.key]}
                  accent="hsl(var(--cxl-cyan))"
                />
              ))}
            </div>
          )}
          {!loading && !data?.combined && (
            <p className="font-body text-sm text-muted-foreground">
              No data yet. Be the first to score your agency.
            </p>
          )}
        </div>

        {/* Card 2: Field vs research targets from the dashboard */}
        <div className="rounded-[8px] border border-border bg-background p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cxl-amber" />
            <h3 className="font-display text-base text-foreground">Field vs research targets</h3>
          </div>
          <p className="font-body text-[11px] text-muted-foreground mb-4">
            Where the field actually is vs where the research above says agencies need to be.
          </p>
          {loading && <div className="h-40 animate-pulse rounded bg-muted/40" />}
          {!loading && data?.combined && (
            <div className="space-y-4">
              {INDUSTRY_TARGETS.map((row) => (
                <ComparisonRow
                  key={row.key}
                  label={row.label}
                  actual={data.combined!.avgDimensions[row.key]}
                  target={row.target}
                  evidence={row.evidence}
                />
              ))}
            </div>
          )}
          {!loading && !data?.combined && (
            <p className="font-body text-sm text-muted-foreground">
              Comparison appears once we have field data.
            </p>
          )}
        </div>
      </div>

      {/* Value statement + CTA */}
      <div className="rounded-[8px] border-2 border-cxl-red/30 bg-cxl-red-light p-5">
        <h3 className="font-display text-lg text-foreground mb-2">See where you actually stand</h3>
        <p className="font-body text-sm text-muted-foreground mb-4 leading-relaxed">
          Get a free, AI-generated scorecard benchmarked against the field above and the research
          targets. Your data is anonymized — only the aggregate score appears here. Takes about 3
          minutes.
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
