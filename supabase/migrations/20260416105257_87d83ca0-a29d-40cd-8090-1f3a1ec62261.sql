CREATE TABLE public.gate_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  answer TEXT NOT NULL,
  structured_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gate_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert gate responses"
  ON public.gate_responses FOR INSERT
  WITH CHECK (true);

CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  answers JSONB NOT NULL,
  results JSONB NOT NULL,
  overall_score NUMERIC NOT NULL,
  gate_answer TEXT,
  gate_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (true);