import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AnalysisLoaderProps {
  stage: "scraping" | "analyzing" | null;
}

const STAGES = {
  scraping: {
    label: "Scraping website",
    description: "Reading your agency's website content...",
    estimatedSeconds: 8,
  },
  analyzing: {
    label: "AI analysis",
    description: "Scoring your agency against industry benchmarks...",
    estimatedSeconds: 15,
  },
};

export function AnalysisLoader({ stage }: AnalysisLoaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [stage]);

  if (!stage) return null;

  const info = STAGES[stage];
  const totalEstimate = STAGES.scraping.estimatedSeconds + STAGES.analyzing.estimatedSeconds;
  const baseElapsed = stage === "analyzing" ? STAGES.scraping.estimatedSeconds : 0;
  const progress = Math.min(95, ((baseElapsed + elapsed) / totalEstimate) * 100);
  const remaining = Math.max(0, totalEstimate - baseElapsed - elapsed);

  return (
    <div className="bg-card rounded-xl p-8 shadow-lg space-y-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />

      <div className="space-y-1">
        <p className="text-lg font-bold text-card-foreground">{info.label}</p>
        <p className="text-sm text-muted-foreground">{info.description}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-input rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground font-medium">
        ~{remaining > 0 ? remaining : "<1"}s remaining
      </p>

      {/* Step indicators */}
      <div className="flex justify-center gap-6 text-xs">
        <div className={`flex items-center gap-1.5 ${stage === "scraping" ? "text-primary font-bold" : "text-muted-foreground"}`}>
          <span className={`h-2 w-2 rounded-full ${stage === "scraping" ? "bg-primary animate-pulse" : "bg-score-high"}`} />
          {stage === "analyzing" ? "✓ " : ""}Website scrape
        </div>
        <div className={`flex items-center gap-1.5 ${stage === "analyzing" ? "text-primary font-bold" : "text-muted-foreground"}`}>
          <span className={`h-2 w-2 rounded-full ${stage === "analyzing" ? "bg-primary animate-pulse" : "bg-input"}`} />
          AI analysis
        </div>
      </div>
    </div>
  );
}
