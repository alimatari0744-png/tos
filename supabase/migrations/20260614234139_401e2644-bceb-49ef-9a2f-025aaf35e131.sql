ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS footer_text_ar TEXT,
  ADD COLUMN IF NOT EXISTS footer_text_en TEXT;