import type { MCQAnswers } from "@/components/ScorecardForm";

export interface DimensionScore {
  name: string;
  shortName: string;
  score: number;
  reasoning: string;
  benchmark: string;
  benchmarkStats: BenchmarkStat[];
}

export interface BenchmarkStat {
  stat: string;
  source: string;
}

export interface ScorecardResult {
  overallScore: number;
  dimensions: DimensionScore[];
  observations: string[];
  gaps: { dimension: string; why: string; action: string; benchmarkStat?: string }[];
  warnings: string[];
  quickWins: string[];
}

const BENCHMARKS: Record<string, string> = {
  clientCommunication: "44% of clients demand AI transparency; 40% actively evaluate agency AI adoption before engaging",
  teamAdoption: "Majority of agency leaders say AI proficiency is non-negotiable; most report 4-5x speed gains once adoption is firm-wide",
  workflowAutomation: "Content creation 60% faster; proposals cut from 3-4 hours to under 1 hour at leading agencies",
  servicePositioning: "53% of clients now engage agencies for strategy, not production; 38% repositioned agency value toward judgment and expertise",
  pricingModel: "Leading agencies moving to value-based and retainer models; hourly billing signals commoditization risk to buyers",
};

// Stats shown in the benchmark panels on each dimension card in the results view.
// These mirror what is shown in the dashboard so users see the same evidence twice.
export const BENCHMARK_STATS: Record<string, BenchmarkStat[]> = {
  clientCommunication: [
    { stat: "44% of clients demand that agencies disclose how they use AI", source: "Wynter panel, n=15" },
    { stat: "40% actively evaluate agency AI adoption before engaging", source: "Wynter panel, n=15" },
    { stat: "31% of in-house leaders now use AI adoption as an agency selection criterion", source: "Wynter panel, n=15" },
  ],
  teamAdoption: [
    { stat: "7 of 15 agency leaders have made AI use mandatory for all staff", source: "Wynter panel, n=15" },
    { stat: "AI amplifies skill gaps in junior staff — senior-over-junior recomposition is the dominant structural shift", source: "Wynter panel, n=15" },
    { stat: "60% of agency founders have stopped filling junior roles they previously would have hired", source: "Growth Syndicate, n=110" },
  ],
  workflowAutomation: [
    { stat: "Content creation 60% faster; scripts from 8-16 hours to under 2 hours", source: "Wynter agency survey, n=15" },
    { stat: "Client onboarding compressed from weeks to days; audits from months to minutes", source: "Wynter agency survey, n=15" },
    { stat: "Proposals cut from 3-4 hours to under 1 hour at agencies with strong workflow automation", source: "Growth Syndicate, n=110" },
  ],
  servicePositioning: [
    { stat: "53% of clients now engage agencies for strategy and direction, not production", source: "Wynter working with agencies, n=15" },
    { stat: "38% of in-house leaders explicitly repositioned agency value toward strategic judgment", source: "Wynter working with agencies, n=15" },
    { stat: "56% reported pulling specific production tasks in-house using AI", source: "Wynter working with agencies, n=15" },
  ],
  pricingModel: [
    { stat: "Hourly billing is the pricing model most associated with commoditization risk", source: "Wynter + Growth Syndicate" },
    { stat: "Leading agencies shifting to retainers, value-based, and productized fixed-scope packages", source: "Wynter agency survey, n=15" },
    { stat: "Clients expect AI to lower agency costs — hourly models invite direct price pressure", source: "Wynter working with agencies, n=15" },
  ],
};

const DIMENSION_NAMES: Record<string, { name: string; shortName: string }> = {
  clientCommunication: { name: "Client Communication of AI Capability", shortName: "Client Communication" },
  teamAdoption: { name: "Team Adoption of AI Tools", shortName: "Team Adoption" },
  workflowAutomation: { name: "Workflow Automation", shortName: "Workflow Automation" },
  servicePositioning: { name: "Service Positioning for AI Era", shortName: "Service Positioning" },
  pricingModel: { name: "Pricing Model Evolution", shortName: "Pricing Model" },
};

// Gap benchmark callouts shown inline in the gap cards
export const GAP_BENCHMARK: Record<string, string> = {
  clientCommunication: "44% of clients demand AI transparency — Wynter panel, n=15",
  teamAdoption: "Half of agency leaders say AI proficiency is non-negotiable for all staff — Wynter panel, n=15",
  workflowAutomation: "Leading agencies report proposals cut to under 1 hour — Growth Syndicate, n=110",
  servicePositioning: "53% of clients engage agencies for strategy, not production — Wynter working with agencies, n=15",
  pricingModel: "Hourly billing is the model most exposed to commoditization — Wynter + Growth Syndicate",
};

export function parseAIResponse(aiData: any): ScorecardResult {
  // clientCommunication always surfaces first if scored 2 or below
  const rawDimensions = Object.keys(DIMENSION_NAMES).map((key) => ({
    key,
    name: DIMENSION_NAMES[key].name,
    shortName: DIMENSION_NAMES[key].shortName,
    score: Math.round(Math.min(5, Math.max(1, aiData.scores?.[key] ?? 2)) * 10) / 10,
    reasoning: aiData.scoreReasons?.[key] ?? "No reasoning provided",
    benchmark: BENCHMARKS[key],
    benchmarkStats: BENCHMARK_STATS[key] ?? [],
  }));

  // Sort so clientCommunication is first when it scores 2 or below
  const clientComm = rawDimensions.find((d) => d.key === "clientCommunication");
  const sortedDimensions = clientComm && clientComm.score <= 2
    ? [clientComm, ...rawDimensions.filter((d) => d.key !== "clientCommunication")]
    : rawDimensions;

  const dimensions: DimensionScore[] = sortedDimensions.map(({ key: _key, ...rest }) => rest);

  const overallScore = Math.round((dimensions.reduce((s, d) => s + d.score, 0) / 5) * 10) / 10;

  // Attach benchmark callout to each gap
  const gaps = (aiData.gaps ?? []).map((gap: any) => {
    const dimKey = Object.keys(DIMENSION_NAMES).find(
      (k) => DIMENSION_NAMES[k].shortName.toLowerCase() === gap.dimension?.toLowerCase()
        || DIMENSION_NAMES[k].name.toLowerCase().includes(gap.dimension?.toLowerCase() ?? "")
    );
    return {
      ...gap,
      benchmarkStat: dimKey ? GAP_BENCHMARK[dimKey] : undefined,
    };
  });

  return {
    overallScore,
    dimensions,
    observations: aiData.observations ?? [],
    gaps,
    warnings: aiData.warnings ?? [],
    quickWins: aiData.quickWins ?? [],
  };
}
