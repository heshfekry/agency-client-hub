// One-time admin seeder: scrapes top B2B agencies, scores them with AI,
// and inserts anonymized rows into public.top_agencies.
//
// Invoke with: supabase.functions.invoke("seed-top-agencies")
// Idempotent: clears the table before re-seeding when ?reseed=true

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SeedAgency {
  url: string;
  region: "US" | "EU";
  services: string[];
}

// Curated list of well-known B2B-focused marketing/digital agencies.
// We never persist the URL or real name — only an anonymous label.
const SEED_AGENCIES: SeedAgency[] = [
  // US
  { url: "https://www.refinelabs.com", region: "US", services: ["Demand generation", "Content marketing"] },
  { url: "https://www.newbreedrevenue.com", region: "US", services: ["Demand generation", "RevOps"] },
  { url: "https://www.gripped.io", region: "EU", services: ["Demand generation", "Paid media / PPC"] },
  { url: "https://www.kalungi.com", region: "US", services: ["Strategy / consulting", "Demand generation"] },
  { url: "https://2x.marketing", region: "US", services: ["Demand generation", "Strategy / consulting"] },
  { url: "https://www.directiveconsulting.com", region: "US", services: ["SEO", "Paid media / PPC"] },
  { url: "https://www.singlegrain.com", region: "US", services: ["SEO", "Content marketing"] },
  { url: "https://www.firstpagesage.com", region: "US", services: ["SEO", "Content marketing"] },
  { url: "https://www.foundationinc.co", region: "US", services: ["Content marketing", "SEO"] },
  { url: "https://www.animalz.co", region: "US", services: ["Content marketing", "SEO"] },
  { url: "https://www.gotomarkets.io", region: "US", services: ["Strategy / consulting", "Demand generation"] },
  // EU
  { url: "https://www.theblueprint.agency", region: "EU", services: ["Strategy / consulting", "Demand generation"] },
  { url: "https://earnest-agency.com", region: "EU", services: ["Brand / creative", "Strategy / consulting"] },
  { url: "https://www.transmissionagency.com", region: "EU", services: ["Demand generation", "Strategy / consulting"] },
  { url: "https://www.thinkmasters.com", region: "EU", services: ["Strategy / consulting", "Brand / creative"] },
  { url: "https://www.bloofusion.de", region: "EU", services: ["SEO", "Paid media / PPC"] },
  { url: "https://www.thehoxtonpress.com", region: "EU", services: ["Brand / creative", "Web design / dev"] },
  { url: "https://www.modernb2b.com", region: "EU", services: ["Demand generation", "Strategy / consulting"] },
  { url: "https://www.silverbean.com", region: "EU", services: ["SEO", "Paid media / PPC"] },
  { url: "https://www.koalifyed.com", region: "EU", services: ["Strategy / consulting", "Demand generation"] },
];

const SYSTEM_PROMPT = `You are an expert analyst scoring B2B marketing agencies on AI readiness.

Score the agency on five dimensions, each from 1 (very low) to 5 (leading):
1. clientCommunication — How clearly the agency communicates AI capabilities to clients.
2. teamAdoption — How widely AI tools appear used across the team.
3. workflowAutomation — Evidence of AI-automated workflows / production.
4. servicePositioning — Repositioning of services for the AI era (strategy/judgment over production).
5. pricingModel — Evolution away from hourly billing toward retainers/value-based/productized.

Score from website evidence only. Where evidence is absent, score conservatively (2 or 3).

Return ONLY valid JSON in this shape:
{
  "scores": { "clientCommunication": <1-5>, "teamAdoption": <1-5>, "workflowAutomation": <1-5>, "servicePositioning": <1-5>, "pricingModel": <1-5> },
  "strengths": ["<short strength 1>", "<short strength 2>"],
  "gaps": ["<short gap 1>", "<short gap 2>"]
}`;

async function scrapeAgency(url: string, firecrawlKey: string): Promise<string> {
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Firecrawl ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.data?.markdown ?? data?.markdown ?? "";
}

async function scoreAgency(
  url: string,
  websiteContent: string,
  lovableKey: string
): Promise<{
  scores: Record<string, number>;
  strengths: string[];
  gaps: string[];
}> {
  const userMessage = `Agency website: ${url}\n\n--- WEBSITE CONTENT ---\n${websiteContent.slice(
    0,
    6000
  )}\n\nScore this agency and return only the JSON object described.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    throw new Error(`AI gateway ${response.status}: ${t.slice(0, 200)}`);
  }

  const completion = await response.json();
  const raw = completion.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(raw);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!firecrawlKey) {
      return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const url = new URL(req.url);
    const reseed = url.searchParams.get("reseed") === "true";

    if (reseed) {
      await supabase.from("top_agencies").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const inserted: { label: string; score: number }[] = [];
    const errors: { url: string; error: string }[] = [];

    for (let i = 0; i < SEED_AGENCIES.length; i++) {
      const agency = SEED_AGENCIES[i];
      const label = `Top B2B Agency #${i + 1}`;
      try {
        console.log(`[${i + 1}/${SEED_AGENCIES.length}] Scraping ${agency.url}`);
        const content = await scrapeAgency(agency.url, firecrawlKey);
        if (!content || content.length < 200) {
          errors.push({ url: agency.url, error: "No usable content scraped" });
          continue;
        }

        const analysis = await scoreAgency(agency.url, content, lovableKey);
        const scores = analysis.scores ?? {};
        const dimScores = {
          clientCommunication: Number(scores.clientCommunication) || 0,
          teamAdoption: Number(scores.teamAdoption) || 0,
          workflowAutomation: Number(scores.workflowAutomation) || 0,
          servicePositioning: Number(scores.servicePositioning) || 0,
          pricingModel: Number(scores.pricingModel) || 0,
        };
        const overall =
          Math.round(
            ((dimScores.clientCommunication +
              dimScores.teamAdoption +
              dimScores.workflowAutomation +
              dimScores.servicePositioning +
              dimScores.pricingModel) /
              5) *
              10
          ) / 10;

        const { error: insertErr } = await supabase.from("top_agencies").insert({
          anonymous_label: label,
          region: agency.region,
          services: agency.services,
          overall_score: overall,
          dimension_scores: dimScores,
          strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
          gaps: Array.isArray(analysis.gaps) ? analysis.gaps : [],
          raw_analysis: analysis as unknown,
        });

        if (insertErr) {
          errors.push({ url: agency.url, error: insertErr.message });
        } else {
          inserted.push({ label, score: overall });
        }

        // Gentle pacing to avoid rate limits
        await new Promise((r) => setTimeout(r, 600));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "unknown";
        console.error(`Failed ${agency.url}:`, msg);
        errors.push({ url: agency.url, error: msg });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        attempted: SEED_AGENCIES.length,
        inserted: inserted.length,
        errors: errors.length,
        details: { inserted, errors },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("seed-top-agencies error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
