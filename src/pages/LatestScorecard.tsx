import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { ScorecardResult } from "@/lib/scorecard-engine";

import SiteHeader from "@/components/SiteHeader";
import { ScorecardResults } from "@/components/ScorecardResults";

interface LatestAssessment {
  url: string;
  results: ScorecardResult;
}

const LatestScorecard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<LatestAssessment | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadLatestAssessment = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from("assessments")
          .select("url, overall_score, results")
          .order("created_at", { ascending: false })
          .limit(1);

        if (queryError) throw queryError;

        const latestRow = data?.[0];
        if (!latestRow) {
          if (!cancelled) setLatestAssessment(null);
          return;
        }

        const rawResults = latestRow.results as unknown as Partial<ScorecardResult>;
        const parsedResult: ScorecardResult = {
          overallScore: rawResults.overallScore ?? Number(latestRow.overall_score) ?? 0,
          dimensions: rawResults.dimensions ?? [],
          observations: rawResults.observations ?? [],
          gaps: rawResults.gaps ?? [],
          warnings: rawResults.warnings ?? [],
          quickWins: rawResults.quickWins ?? [],
        };

        if (!cancelled) {
          setLatestAssessment({
            url: latestRow.url,
            results: parsedResult,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load the latest scorecard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLatestAssessment();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[900px] px-4 pb-32 pt-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 font-body text-sm font-bold text-primary transition-colors hover:text-primary/80"
        >
          ← Back to dashboard
        </button>

        {loading && (
          <div className="rounded-[10px] border-2 border-primary/30 bg-card p-6 shadow-lg md:p-8">
            <p className="font-body text-sm text-muted-foreground">Loading your latest scorecard...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[10px] border border-destructive/40 bg-destructive/10 p-4 font-body text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && !latestAssessment && (
          <div className="rounded-[10px] border-2 border-primary/30 bg-card p-6 shadow-lg md:p-8">
            <h1 className="font-display text-2xl text-card-foreground tracking-tight md:text-3xl">
              No saved scorecard yet
            </h1>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Run the scorecard once and your latest result will appear here.
            </p>
            <button
              onClick={() => navigate("/scorecard")}
              className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Score my agency
            </button>
          </div>
        )}

        {!loading && !error && latestAssessment && (
          <ScorecardResults
            result={latestAssessment.results}
            url={latestAssessment.url}
            onReset={() => navigate("/scorecard")}
          />
        )}
      </main>
    </div>
  );
};

export default LatestScorecard;
