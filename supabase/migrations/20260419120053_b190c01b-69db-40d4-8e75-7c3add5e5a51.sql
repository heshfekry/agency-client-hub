-- Anonymized leaderboard of top B2B agencies (seeded by an admin edge function)
CREATE TABLE public.top_agencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_label text NOT NULL,
  region text NOT NULL CHECK (region IN ('US', 'EU')),
  services text[] NOT NULL DEFAULT '{}',
  overall_score numeric NOT NULL,
  dimension_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  strengths text[] NOT NULL DEFAULT '{}',
  gaps text[] NOT NULL DEFAULT '{}',
  raw_analysis jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.top_agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view top agencies"
ON public.top_agencies FOR SELECT
USING (true);

CREATE INDEX idx_top_agencies_region ON public.top_agencies(region);
CREATE INDEX idx_top_agencies_score ON public.top_agencies(overall_score DESC);

-- Allow the dashboard to read anonymized aggregates from community submissions
CREATE POLICY "Anyone can view assessments for benchmarks"
ON public.assessments FOR SELECT
USING (true);