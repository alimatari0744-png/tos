-- Restrict column-level read access so anonymous/public visitors cannot read
-- the stale signed URLs stored in prev_hero_image / prev_logo_image.
-- RLS policies cannot restrict columns, so use column privileges.

-- Revoke broad table-level SELECT from public/anon (granted implicitly via GRANT).
REVOKE SELECT ON public.site_settings FROM anon;

-- Grant SELECT only on the safe, non-sensitive columns to anonymous users.
GRANT SELECT (
  id,
  hero_image,
  hero_title_ar,
  hero_title_en,
  hero_subtitle_ar,
  hero_subtitle_en,
  whatsapp_number,
  contact_phone,
  contact_email,
  updated_at,
  logo_image,
  primary_color,
  terms_ar,
  terms_en,
  privacy_ar,
  privacy_en,
  footer_text_ar,
  footer_text_en
) ON public.site_settings TO anon;

-- Authenticated users (admins/staff) retain full table access.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
