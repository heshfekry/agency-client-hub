import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { parseAIResponse, type ScorecardResult } from "@/lib/scorecard-engine";
import type { Json } from "@/integrations/supabase/types";
import type { MCQAnswers } from "@/components/ScorecardForm";
import type { GateData } from "@/components/GateModal";

import SiteHeader from "@/components/SiteHeader";
import { ScorecardForm } from "@/components/ScorecardForm";
import { ScorecardResults } from "@/components/ScorecardResults";
import { AnalysisLoader } from "@/components/AnalysisLoader";

const GATE_DATA_KEY = "agency_gate_data_v2";

type View = "form" | "loading" | "results";

const Scorecard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("form");
  const [loadingStage, setLoadingStage] = useState<"scraping" | "analyzing" | null>(null);
  const [result, setResult] = useState<ScorecardResult | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view]);

  const handleSubmit = async (submittedUrl: string, answers: MCQAnswers) => {
    setUrl(submittedUrl);
    setView("loading");
    setLoadingStage("scraping");
    setError(null);

    let gateAnswer = "";
    let gateRole = "";
    try {
      const raw = sessionStorage.getItem(GATE_DATA_KEY);
      if (raw) {
        const gd: GateData = JSON.parse(raw);
        gateAnswer = gd.answer;
        gateRole = gd.role;
      }
    } catch (_) {}

    try {
      const scrapeRes = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url: submittedUrl },
      });
      if (scrapeRes.error) throw new Error(scrapeRes.error.message);
      const websiteContent: string =
        scrapeRes.data?.data?.markdown ?? scrapeRes.data?.markdown ?? "";

      setLoadingStage("analyzing");

      const analyzeRes = await supabase.functions.invoke("analyze-agency", {
        body: { url: submittedUrl, websiteContent, answers, gateAnswer, gateRole },
      });
      if (analyzeRes.error) throw new Error(analyzeRes.error.message);

      const parsed = parseAIResponse(analyzeRes.data);
      setResult(parsed);

      try {
        await supabase.from("assessments").insert([{
          url: submittedUrl,
          answers: answers as unknown as Json,
          results: parsed as unknown as Json,
          overall_score: parsed.overallScore,
          gate_answer: gateAnswer || null,
          gate_role: gateRole || null,
        }]);
      } catch (_) {}

      setView("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setView("form");
    } finally {
      setLoadingStage(null);
    }
  };

  const handleReset = () => {
    setResult(null);
    setUrl("");
    setError(null);
    setView("form");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[900px] px-4 pb-32 pt-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 font-body text-sm text-primary hover:text-primary/80 font-bold transition-colors"
        >
          ← Back to dashboard
        </button>

        {view === "form" && (
          <div className="rounded-[10px] border-2 border-primary/30 bg-card p-6 md:p-8 shadow-lg">
            <div className="mb-6 space-y-1">
              <h1 className="font-display text-2xl md:text-3xl text-card-foreground tracking-tight">
                Score your agency's AI readiness
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Answer a few questions about your agency. We'll scrape your site and benchmark you against the field.
              </p>
            </div>
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 font-body text-sm text-destructive">
                {error}
              </div>
            )}
            <ScorecardForm onSubmit={handleSubmit} isLoading={false} />
          </div>
        )}

        {view === "loading" && (
          <div className="rounded-[10px] border-2 border-primary/30 bg-card p-6 md:p-8 shadow-lg">
            <AnalysisLoader stage={loadingStage} />
          </div>
        )}

        {view === "results" && result && (
          <ScorecardResults result={result} url={url} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default Scorecard;
