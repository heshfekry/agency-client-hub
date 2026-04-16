const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are an expert analyst scoring marketing agencies on their AI readiness.

Score the agency on five dimensions, each from 1 (very low) to 5 (leading):

1. clientCommunication — How clearly and proactively the agency communicates its AI capabilities to clients and prospects.
   Benchmark: 44% of in-house marketers demand AI transparency; 40% evaluate AI adoption before engaging an agency.

2. teamAdoption — How widely and consistently AI tools are used across the team.
   Benchmark: 7 of 15 agency leaders surveyed have made AI use mandatory for all staff; majority report 4-5x speed gains once adoption is firm-wide.

3. workflowAutomation — The degree to which repeatable tasks and production workflows are AI-automated.
   Benchmark: Content creation 60% faster; proposals cut from 3-4 hours to under 1 hour at leading agencies.

4. servicePositioning — How well the agency's service offer is repositioned for an AI era (strategy/judgment over production).
   Benchmark: 53% of in-house leaders now engage agencies for strategy, not production. 56% are pulling production in-house.

5. pricingModel — How evolved the pricing model is away from hourly/time-based billing.
   Benchmark: Hourly billing is the model most exposed to commoditization. Leading agencies are moving to retainers, value-based, and productized packages.

Scoring guidance:
- 1: No evidence of this dimension at all
- 2: Early/informal attempts only
- 3: Solid foundation, some gaps
- 4: Strong and consistent
- 5: Best-in-class, clearly differentiated

Use the website content AND the self-reported MCQ answers together. Where they conflict, weight the website content more heavily (it is observable evidence). Where the MCQs provide context the website doesn't reveal (e.g., internal workflow), give them appropriate weight.

Return ONLY valid JSON in this exact shape:
{
  "scores": {
    "clientCommunication": <number 1-5>,
    "teamAdoption": <number 1-5>,
    "workflowAutomation": <number 1-5>,
    "servicePositioning": <number 1-5>,
    "pricingModel": <number 1-5>
  },
  "scoreReasons": {
    "clientCommunication": "<1-2 sentence explanation citing specific evidence>",
    "teamAdoption": "<1-2 sentence explanation>",
    "workflowAutomation": "<1-2 sentence explanation>",
    "servicePositioning": "<1-2 sentence explanation>",
    "pricingModel": "<1-2 sentence explanation>"
  },
  "observations": ["<observation 1>", "<observation 2>", "<observation 3>"],
  "gaps": [
    {
      "dimension": "<shortName>",
      "why": "<why it scored low, 1 sentence>",
      "action": "<specific +1 action, 1 sentence>"
    }
  ],
  "warnings": ["<competitive warning signal>"],
  "quickWins": ["<actionable quick win for next 30 days>", "<quick win 2>", "<quick win 3>"]
}

- observations: exactly 3, each a specific insight grounded in the evidence
- gaps: only dimensions scoring 3 or below; max 3 gaps; ordered lowest score first
- warnings: 1-3 signals of competitive risk; omit if overall score is 4+
- quickWins: exactly 3, each a concrete action the agency can take within 30 days
- Use the respondent's own words from their gate answer where relevant to personalise observations or quick wins`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      url,
      websiteContent,
      answers,
      gateAnswer,
      gateRole,
    } = await req.json();

    if (!url || !answers) {
      return new Response(
        JSON.stringify({ error: 'url and answers are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the MCQ summary
    const mcqSummary = [
      `Team size: ${answers.teamSize}`,
      `Services: ${Array.isArray(answers.services) ? answers.services.join(', ') : answers.services}`,
      `AI tool usage across team: ${answers.aiToolUsage}`,
      `AI in workflows: ${answers.aiInWorkflows}`,
      `AI on website: ${answers.aiOnWebsite}`,
      `Primary pricing model: ${answers.pricingModel}`,
      `AI service positioning: ${answers.aiServices}`,
      `How often clients ask about AI process: ${answers.clientAskFrequency}`,
      `Headcount vs revenue (last 12 months): ${answers.headcountChange}`,
      `How they measure ROI of AI investment: ${answers.roiMeasurement}`,
    ].join('\n');

    const gateContext = gateAnswer
      ? `\n\n---\nRespondent background (role: ${gateRole ?? 'unknown'}):\n"${gateAnswer}"`
      : '';

    const userMessage = `Agency website: ${url}

--- WEBSITE CONTENT ---
${websiteContent ? websiteContent.slice(0, 6000) : '(no website content available — score from MCQ answers only)'}

--- SELF-REPORTED MCQ ANSWERS ---
${mcqSummary}${gateContext}

Score this agency on all five dimensions and return only the JSON object described in the system prompt.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('AI gateway error:', errBody);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds in Settings > Workspace > Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: `AI request failed: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const completion = await response.json();
    const raw = completion.choices?.[0]?.message?.content ?? '{}';

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('Failed to parse AI JSON:', raw);
      return new Response(
        JSON.stringify({ error: 'AI returned invalid JSON' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('analyze-agency error:', err);
    const msg = err instanceof Error ? err.message : 'Internal error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
