import { ScorecardResult, BENCHMARK_STATS } from "@/lib/scorecard-engine";
import { ScoreGauge } from "./ScoreGauge";
import BenchmarkPanel from "./BenchmarkPanel";
import { AlertTriangle, Target, Eye, Zap, TrendingDown } from "lucide-react";

interface ScorecardResultsProps {
  result: ScorecardResult;
  url: string;
  onReset: () => void;
}

// Map a gap dimension label back to the engine key used for benchmarks
const DIM_KEY_BY_LABEL: Record<string, keyof typeof BENCHMARK_STATS> = {
  "Client Communication": "clientCommunication",
  "Team Adoption": "teamAdoption",
  "Workflow Automation": "workflowAutomation",
  "Service Positioning": "servicePositioning",
  "Pricing Model": "pricingModel",
};

function lookupDimensionKey(label: string): keyof typeof BENCHMARK_STATS | null {
  if (!label) return null;
  const exact = DIM_KEY_BY_LABEL[label];
  if (exact) return exact;
  const lower = label.toLowerCase();
  const match = Object.entries(DIM_KEY_BY_LABEL).find(([k]) => lower.includes(k.toLowerCase()));
  return match ? match[1] : null;
}

export function ScorecardResults({ result, url, onReset }: ScorecardResultsProps) {
  const getOverallColor = () => {
    if (result.overallScore <= 2) return "text-score-low";
    if (result.overallScore <= 3.5) return "text-score-mid";
    return "text-score-high";
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Reset link */}
      <button
        onClick={onReset}
        className="font-body text-sm text-primary hover:text-primary/80 font-bold transition-colors"
      >
        ← Score another agency
      </button>

      {/* Header */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg text-center space-y-3">
        <h2 className="font-display text-2xl md:text-3xl text-card-foreground tracking-tight">
          AI Readiness Scorecard
        </h2>
        <p className="font-body text-sm text-muted-foreground truncate">{url}</p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="font-body text-muted-foreground text-lg font-medium">Overall Score:</span>
          <span className={`font-display text-5xl ${getOverallColor()}`}>
            {result.overallScore}
          </span>
          <span className="font-body text-muted-foreground text-2xl font-medium">/ 5</span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-6">
        <h3 className="font-display text-lg text-card-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Score Breakdown
        </h3>
        {result.dimensions.map((dim, i) => (
          <ScoreGauge
            key={dim.shortName}
            score={dim.score}
            label={dim.shortName}
            reasoning={dim.reasoning}
            delay={i * 150}
          />
        ))}
      </div>

      {/* Key Observations */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-4">
        <h3 className="font-display text-lg text-card-foreground flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Key Observations
        </h3>
        <ul className="space-y-3">
          {result.observations.map((obs, i) => (
            <li key={i} className="flex gap-3 font-body text-sm text-card-foreground leading-relaxed">
              <span className="text-primary font-black shrink-0">{i + 1}.</span>
              {obs}
            </li>
          ))}
        </ul>
      </div>

      {/* Biggest Gaps — recommendation paired with research cards */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-6">
        <h3 className="font-display text-lg text-card-foreground flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-score-low" />
          Biggest Gaps & What the Research Says
        </h3>
        {result.gaps.map((gap, i) => {
          const key = lookupDimensionKey(gap.dimension);
          const stats = key ? BENCHMARK_STATS[key] : [];
          return (
            <div
              key={i}
              className="rounded-xl border border-border bg-background/40 p-4 md:p-5 space-y-4"
            >
              <div>
                <p className="font-display text-base text-card-foreground">{gap.dimension}</p>
                <p className="font-body text-sm text-muted-foreground italic mt-1">
                  Why it scored low: {gap.why}
                </p>
              </div>

              {/* Side by side: action + research cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-primary/30 bg-[hsl(var(--surface-warm))] p-4 space-y-1.5">
                  <div className="font-display text-[11px] uppercase tracking-wider text-score-high">
                    +1 Action — do this next
                  </div>
                  <p className="font-body text-sm text-card-foreground leading-relaxed">
                    {gap.action}
                  </p>
                </div>
                <BenchmarkPanel
                  stats={stats}
                  variant="cards"
                  title="Why this matters — what the research says"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Competitive Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-4">
          <h3 className="font-display text-lg text-card-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-score-mid" />
            Competitive Warning Signals
          </h3>
          <ul className="space-y-3">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex gap-3 font-body text-sm text-card-foreground leading-relaxed">
                <AlertTriangle className="h-4 w-4 text-score-mid shrink-0 mt-0.5" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Wins */}
      {result.quickWins.length > 0 && (
        <div className="bg-secondary rounded-xl p-6 md:p-8 shadow-lg space-y-4">
          <h3 className="font-display text-lg text-secondary-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Wins — Next 30 Days
          </h3>
          <ul className="space-y-3">
            {result.quickWins.map((win, i) => (
              <li key={i} className="flex gap-3 font-body text-sm text-secondary-foreground/90 leading-relaxed">
                <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA 1 */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-4 border-2 border-primary/20">
        <h3 className="font-display text-lg text-card-foreground">
          Make your agency AI-ready
        </h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          Audit your service and pitch readiness against client criteria, map your agents, and build an AI-ready client-facing product.
        </p>
        <a
          href="https://cxl.com/institute/live-course/agency-ai-product/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Join our live course
        </a>
      </div>

      {/* CTA 2 */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-4 border-2 border-primary/20">
        <h3 className="font-display text-lg text-card-foreground">
          Level up your entire agency
        </h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          CXL gives your entire agency team access to the most rigorous B2B marketing training in the industry. Courses built by practitioners who run campaigns at the same scale your clients need.
        </p>
        <a
          href="https://cxl.com/institute/for-agencies/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Book a demo
        </a>
      </div>
    </div>
  );
}
