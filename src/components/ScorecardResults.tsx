import { ScorecardResult } from "@/lib/scorecard-engine";
import { ScoreGauge } from "./ScoreGauge";
import { AlertTriangle, Target, Eye, Zap, TrendingDown } from "lucide-react";

interface ScorecardResultsProps {
  result: ScorecardResult;
  url: string;
  onReset: () => void;
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
        <div className="mb-1 font-body text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'hsl(var(--cxl-text-faint))' }}>
          Benchmarked against Wynter research · n=15 agency leaders + 15 in-house leaders
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-card-foreground tracking-tight">
          AI Readiness Scorecard
        </h2>
        <p className="text-sm text-muted-foreground truncate">{url}</p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="text-muted-foreground text-lg font-medium">Overall Score:</span>
          <span className={`text-5xl font-black ${getOverallColor()}`}>
            {result.overallScore}
          </span>
          <span className="text-muted-foreground text-2xl font-medium">/ 5</span>
        </div>
      </div>

      {/* Score Breakdown — with benchmark panels */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-6">
        <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Score Breakdown
        </h3>
        {result.dimensions.map((dim, i) => (
          <ScoreGauge
            key={dim.shortName}
            score={dim.score}
            label={dim.shortName}
            reasoning={dim.reasoning}
            benchmarkStats={dim.benchmarkStats}
            delay={i * 150}
          />
        ))}
      </div>

      {/* Key Observations */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-4">
        <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Key Observations
        </h3>
        <ul className="space-y-3">
          {result.observations.map((obs, i) => (
            <li key={i} className="flex gap-3 text-sm text-card-foreground leading-relaxed">
              <span className="text-primary font-black shrink-0">{i + 1}.</span>
              {obs}
            </li>
          ))}
        </ul>
      </div>

      {/* Biggest Gaps — with benchmark callout per gap */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-4">
        <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-score-low" />
          Biggest Gaps
        </h3>
        {result.gaps.map((gap, i) => (
          <div key={i} className="border-l-4 border-score-low pl-4 space-y-2 py-2">
            <p className="font-bold text-card-foreground">{gap.dimension}</p>
            <p className="text-sm text-muted-foreground italic">Why it scored low: {gap.why}</p>
            <div className="bg-[hsl(var(--surface-warm))] rounded-lg p-3 space-y-1.5">
              <p className="text-sm text-card-foreground">
                <span className="font-bold text-score-high">+1 Action:</span> {gap.action}
              </p>
              {gap.benchmarkStat && (
                <p className="text-[11px] text-muted-foreground">
                  {gap.benchmarkStat}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Competitive Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-score-mid" />
            Competitive Warning Signals
          </h3>
          <ul className="space-y-3">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex gap-3 text-sm text-card-foreground leading-relaxed">
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
          <h3 className="text-lg font-bold text-secondary-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Wins — Next 30 Days
          </h3>
          <ul className="space-y-3">
            {result.quickWins.map((win, i) => (
              <li key={i} className="flex gap-3 text-sm text-secondary-foreground/90 leading-relaxed">
                <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA 1: Live course */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-4 border-2 border-primary/20">
        <h3 className="text-lg font-bold text-card-foreground">
          Make your agency AI-ready
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
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

      {/* CTA 2: Agency team training */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg space-y-4 border-2 border-primary/20">
        <h3 className="text-lg font-bold text-card-foreground">
          Level up your entire agency
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
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
