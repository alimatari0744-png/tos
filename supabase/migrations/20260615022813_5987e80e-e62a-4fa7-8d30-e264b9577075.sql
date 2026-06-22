ALTER TABLE public.property_interests
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'form';
