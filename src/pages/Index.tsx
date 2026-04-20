import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { GateData } from "@/components/GateModal";

import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import MetricCards from "@/components/MetricCards";
import DonutCharts from "@/components/DonutCharts";
import AdoptionChart from "@/components/AdoptionChart";
import FutureChart from "@/components/FutureChart";
import QuotesSection from "@/components/QuotesSection";
import TechBars from "@/components/TechBars";
import CommunityInsights from "@/components/CommunityInsights";
import AgencyBenchmarks from "@/components/AgencyBenchmarks";
import StickyScorecardCTA from "@/components/StickyScorecardCTA";
import GateModal from "@/components/GateModal";

const GATE_KEY = "agency_dashboard_unlocked_v2";
const GATE_DATA_KEY = "agency_gate_data_v2";

const Index = () => {
  const navigate = useNavigate();
  const [gateUnlocked, setGateUnlocked] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(GATE_KEY) === "true"
  );
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    if (!gateUnlocked) setGateOpen(true);
  }, [gateUnlocked]);

  const handleGateUnlock = async (data: GateData) => {
    localStorage.setItem(GATE_KEY, "true");
    sessionStorage.setItem(GATE_DATA_KEY, JSON.stringify(data));
    setGateUnlocked(true);
    setGateOpen(false);
    try {
      await supabase.from("gate_responses").insert({
        role: data.role,
        answer: data.answer,
        structured_answer: data.structuredAnswer,
      });
    } catch (_) {}
  };

  const handleResetGate = () => {
    localStorage.removeItem(GATE_KEY);
    sessionStorage.removeItem(GATE_DATA_KEY);
    setGateUnlocked(false);
    setGateOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <GateModal open={gateOpen} onUnlock={handleGateUnlock} />

      <SiteHeader />
      <Hero />

      <main className="mx-auto max-w-[900px] px-4 pb-32 pt-8 space-y-10">
        <MetricCards />
        <DonutCharts />
        <AdoptionChart />
        <FutureChart />
        <QuotesSection />
        <TechBars />
        <CommunityInsights />
        <AgencyBenchmarks />
      </main>

      <StickyScorecardCTA
        onStart={() => navigate("/scorecard")}
        visible={!gateOpen}
      />

      {gateUnlocked && !gateOpen && (
        <button
          onClick={handleResetGate}
          className="fixed bottom-4 left-4 z-40 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 font-body text-xs text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
          aria-label="Reset gate modal"
        >
          Reset gate
        </button>
      )}
    </div>
  );
};

export default Index;
