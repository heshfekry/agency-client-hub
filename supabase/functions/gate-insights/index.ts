// Public aggregator for gate_responses.
// Returns theme counts + curated quotes, never raw rows.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Theme = { key: string; label: string; patterns: RegExp[] };

const AGENCY_THEMES: Theme[] = [
  { key: "strategy", label: "Strategy & strategic thinking", patterns: [/strateg/i, /consult/i, /direction/i, /planning/i] },
  { key: "orchestration", label: "AI orchestration & agent building", patterns: [/orchestrat/i, /agent/i, /workflow/i, /automat/i, /prompt/i, /agentic/i, /process design/i, /feedback loop/i] },
  { key: "judgment", label: "Critical thinking & judgment", patterns: [/critical thinking/i, /judg/i, /discern/i, /validate/i, /invalidat/i, /quality/i, /reduse|reduce.*false/i, /not creating slop/i, /attention to detail/i, /structured thinking/i] },
  { key: "creativity", label: "Creativity & creative direction", patterns: [/creativ/i, /conceptual/i, /finnesse|finesse/i] },
  { key: "human", label: "Human & soft skills", patterns: [/soft skill/i, /people skill/i, /human/i, /relationship/i, /mindset/i, /curiosity/i, /open mind/i, /problem solving/i, /managers? /i, /managing agents/i] },
  { key: "expertise", label: "Business & domain expertise", patterns: [/business knowledge/i, /expertise/i, /experience/i, /in.?depth/i, /fundamentals/i, /field experience/i, /t.?shaped/i, /data analysis/i, /analytics/i] },
  { key: "adaptability", label: "Adaptability & growth", patterns: [/adapt/i, /agility/i, /growth mindset/i, /scaling/i, /scale/i] },
  { key: "speed", label: "Speed & efficiency", patterns: [/speed/i, /faster/i, /efficien/i, /lower cost/i, /optimi[sz]ation/i] },
];

const INHOUSE_THEMES: Theme[] = [
  { key: "in_house", label: "Doing more in-house", patterns: [/in.?house/i, /do more (ourselves|on my own|myself)/i, /can do more/i, /bring.*jobs in/i, /no longer need|dont longer need|don'?t longer/i, /self.?learn/i] },
  { key: "speed_cost", label: "Expecting more speed & lower cost", patterns: [/speed/i, /faster/i, /less cost|lower cost|reduce cost/i, /cheaper/i, /price/i, /unit economics/i, /productiv/i, /speeded/i] },
  { key: "higher_bar", label: "Higher bar — only top strategic work", patterns: [/strateg/i, /brilliant/i, /proven track record/i, /creative ideas/i, /strategic thinking/i, /not for any easy/i, /more.*strategy/i] },
  { key: "ai_maturity", label: "Evaluating agency's AI maturity", patterns: [/ai (integration|shift|strategy|maturity)/i, /how.*adapt/i, /improve their productivity/i, /sharpened.*ai/i, /transparen/i, /how they plan/i, /selection criteria/i] },
  { key: "no_change", label: "No real change", patterns: [/hasn'?t changed/i, /still focus/i, /not really/i, /not relevant/i] },
  { key: "drop_services", label: "Dropping specific services", patterns: [/seo/i, /performance agency|ad performance/i, /website design/i, /creative assets/i] },
];

function isJunk(text: string): boolean {
  const t = text.trim();
  if (t.length < 8) return true;
  // mostly non-letters or random keyboard mash
  const letters = (t.match(/[a-zA-Z]/g) || []).length;
  if (letters / t.length < 0.5) return true;
  // very long runs of consonants = mash
  if (/[bcdfghjklmnpqrstvwxyz]{8,}/i.test(t)) return true;
  if (/^(test|asdf|qwer|jasd|sdsd|dggf|xadf|i ?dont know|idk)/i.test(t)) return true;
  if (/^(\.|-){2,}/.test(t)) return true;
  return false;
}

function classify(text: string, themes: Theme[]): string[] {
  const matched: string[] = [];
  for (const theme of themes) {
    if (theme.patterns.some((p) => p.test(text))) matched.push(theme.key);
  }
  return matched;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rows, error } = await supabase
      .from("gate_responses")
      .select("role, answer, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) throw error;

    const agencyRows = (rows ?? []).filter((r) => r.role === "agency" && !isJunk(r.answer));
    const inhouseRows = (rows ?? []).filter((r) => r.role === "in-house" && !isJunk(r.answer));

    function aggregate(list: typeof agencyRows, themes: Theme[]) {
      const counts: Record<string, { label: string; count: number; quotes: string[] }> = {};
      themes.forEach((t) => (counts[t.key] = { label: t.label, count: 0, quotes: [] }));
      let classifiedCount = 0;
      for (const row of list) {
        const matches = classify(row.answer, themes);
        if (matches.length === 0) continue;
        classifiedCount++;
        for (const key of matches) {
          counts[key].count++;
          // collect quotes that look "clean" — punctuation + reasonable length
          if (
            counts[key].quotes.length < 3 &&
            row.answer.length >= 25 &&
            row.answer.length <= 220 &&
            /[.!?]/.test(row.answer)
          ) {
            counts[key].quotes.push(row.answer.trim());
          }
        }
      }
      const total = list.length;
      const themesArr = themes.map((t) => ({
        key: t.key,
        label: t.label,
        count: counts[t.key].count,
        pct: total > 0 ? Math.round((counts[t.key].count / total) * 100) : 0,
        quotes: counts[t.key].quotes,
      }));
      themesArr.sort((a, b) => b.count - a.count);
      return { total, classified: classifiedCount, themes: themesArr };
    }

    const result = {
      generatedAt: new Date().toISOString(),
      agency: aggregate(agencyRows, AGENCY_THEMES),
      inhouse: aggregate(inhouseRows, INHOUSE_THEMES),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "content-type": "application/json", "cache-control": "public, max-age=60" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
