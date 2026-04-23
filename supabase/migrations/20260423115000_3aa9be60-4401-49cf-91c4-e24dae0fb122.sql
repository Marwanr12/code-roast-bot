CREATE TABLE public.roasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  opener TEXT NOT NULL,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  verdict TEXT NOT NULL,
  backhanded_compliment TEXT NOT NULL,
  flames INTEGER NOT NULL CHECK (flames BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.roasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roasts"
ON public.roasts FOR SELECT
USING (true);

CREATE POLICY "Anyone can create roasts"
ON public.roasts FOR INSERT
WITH CHECK (true);

CREATE INDEX idx_roasts_created_at ON public.roasts (created_at DESC);