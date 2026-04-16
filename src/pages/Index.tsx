import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseAIResponse, type ScorecardResult } from "@/lib/scorecard-engine";
import type { MCQAnswers } from "@/components/ScorecardForm";
import type { GateData } from "@/components/GateModal";

import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import MetricCards from "@/components/MetricCards";
import DonutCharts from "@/components/DonutCharts";
import AdoptionChart from "@/components/AdoptionChart";
import FutureChart from "@/components/FutureChart";
import QuotesSection from "@/components/QuotesSection";
import TechBars from "@/components/TechBars";
import ScorecardBridge from "@/components/ScorecardBridge";
import GateModal from "@/components/GateModal";
import { ScorecardForm } from "@/components/ScorecardForm";
import { ScorecardResults } from "@/components/ScorecardResults";
import { AnalysisLoader } from "@/components/AnalysisLoader";

const GATE_KEY = "agency_dashboard_unlocked_v2";
const GATE_DATA_KEY = "agency_gate_data_v2";

type ScorecardView = "hidden" | "form" | "loading" | "results";

const Index = () => {
  const [gateUnlocked, setGateUnlocked] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(GATE_KEY) === "true"
  );
  const [gateOpen, setGateOpen] = useState(false);

  const [scorecardView, setScorecardView] = useState<ScorecardView>("hidden");
  const [loadingStage, setLoadingStage] = useState<"scraping" | "analyzing" | null>(null);
  const [scorecardResult, setScorecardResult] = useState<ScorecardResult | null>(null);
  const [scorecardUrl, setScorecardUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const scorecardRef = useRef<HTMLDivElement>(null);

  // Show gate on load if not already unlocked
  useEffect(() => {
    if (!gateUnlocked) {
      setGateOpen(true);
    }
  }, [gateUnlocked]);

  // Scroll into scorecard section when view changes away from hidden
  useEffect(() => {
    if (scorecardView !== "hidden" && scorecardRef.current) {
      scorecardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scorecardView]);

  const handleGateUnlock = async (data: GateData) => {
    // Persist unlock state
    localStorage.setItem(GATE_KEY, "true");
    sessionStorage.setItem(GATE_DATA_KEY, JSON.stringify(data));
    setGateUnlocked(true);
    setGateOpen(false);

    // Write gate response to Supabase (best-effort, don't block UX)
    try {
      await supabase.from("gate_responses").insert({
        role: data.role,
        answer: data.answer,
        structured_answer: data.structuredAnswer,
      });
    } catch (_) {
      // non-blocking
    }
  };

  const handleScorecardStart = () => {
    setScorecardView("form");
  };

  const handleScorecardSubmit = async (url: string, answers: MCQAnswers) => {
    setScorecardUrl(url);
    setScorecardView("loading");
    setLoadingStage("scraping");
    setError(null);

    // Retrieve gate data saved at unlock time
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
      // Step 1: scrape the agency website
      const scrapeRes = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url },
      });

      if (scrapeRes.error) throw new Error(scrapeRes.error.message);

      const websiteContent: string =
        scrapeRes.data?.data?.markdown ?? scrapeRes.data?.markdown ?? "";

      setLoadingStage("analyzing");

      // Step 2: AI analysis
      const analyzeRes = await supabase.functions.invoke("analyze-agency", {
        body: { url, websiteContent, answers, gateAnswer, gateRole },
      });

      if (analyzeRes.error) throw new Error(analyzeRes.error.message);

      const result = parseAIResponse(analyzeRes.data);
      setScorecardResult(result);

      // Step 3: Persist assessment (best-effort)
      try {
        await supabase.from("assessments").insert([{
          url,
          answers: answers as unknown as Json,
          results: result as unknown as Json,
          overall_score: result.overallScore,
          gate_answer: gateAnswer || null,
          gate_role: gateRole || null,
        }]);
      } catch (_) {}

      setScorecardView("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setScorecardView("form");
    } finally {
      setLoadingStage(null);
    }
  };

  const handleScorecardReset = () => {
    setScorecardResult(null);
    setScorecardUrl("");
    setError(null);
    setScorecardView("form");
  };

  return (
    <div className="min-h-screen bg-background">
      <GateModal open={gateOpen} onUnlock={handleGateUnlock} />

      <SiteHeader />

      {/* ── Act 1: Dashboard ── */}
      <Hero />

      <main className="mx-auto max-w-[900px] px-4 pb-20 pt-8 space-y-10">
        <MetricCards />
        <DonutCharts />
        <AdoptionChart />
        <FutureChart />
        <QuotesSection />
        <TechBars />

        {/* ── Bridge ── */}
        {scorecardView === "hidden" && (
          <ScorecardBridge onStart={handleScorecardStart} />
        )}

        {/* ── Act 2: Scorecard ── */}
        {scorecardView !== "hidden" && (
          <div ref={scorecardRef} className="scroll-mt-20">
            <div className="mt-14 mb-2 rounded-[10px] border-2 border-primary/30 bg-card p-6 md:p-8 shadow-lg">
              {scorecardView === "form" && (
                <>
                  {error && (
                    <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <ScorecardForm onSubmit={handleScorecardSubmit} isLoading={false} />
                </>
              )}

              {scorecardView === "loading" && (
                <AnalysisLoader stage={loadingStage} />
              )}

              {scorecardView === "results" && scorecardResult && (
                <ScorecardResults
                  result={scorecardResult}
                  url={scorecardUrl}
                  onReset={handleScorecardReset}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
