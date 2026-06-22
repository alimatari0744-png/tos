ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS logo_image text,
  ADD COLUMN IF NOT EXISTS prev_logo_image text,
  ADD COLUMN IF NOT EXISTS primary_color text;