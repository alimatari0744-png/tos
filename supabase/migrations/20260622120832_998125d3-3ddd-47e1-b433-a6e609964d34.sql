ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS terms_ar text,
  ADD COLUMN IF NOT EXISTS terms_en text,
  ADD COLUMN IF NOT EXISTS privacy_ar text,
  ADD COLUMN IF NOT EXISTS privacy_en text,
  ADD COLUMN IF NOT EXISTS footer_text_ar text,
  ADD COLUMN IF NOT EXISTS footer_text_en text;

CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_permissions TO authenticated;
GRANT ALL ON public.staff_permissions TO service_role;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_label text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_perm(_user_id uuid, _perm text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin')
    OR EXISTS (SELECT 1 FROM public.staff_permissions WHERE user_id = _user_id AND permission = _perm)
$$;

CREATE POLICY "admin manages staff permissions" ON public.staff_permissions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "staff read own permissions" ON public.staff_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin reads activity" ON public.activity_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "authenticated logs own activity" ON public.activity_log
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND (actor_email IS NULL OR actor_email = (auth.jwt() ->> 'email'))
  );

CREATE POLICY "staff writes properties" ON public.properties
  FOR ALL USING (public.has_perm(auth.uid(), 'properties'))
  WITH CHECK (public.has_perm(auth.uid(), 'properties'));
CREATE POLICY "staff writes taxonomy" ON public.taxonomy_options
  FOR ALL USING (public.has_perm(auth.uid(), 'taxonomy'))
  WITH CHECK (public.has_perm(auth.uid(), 'taxonomy'));
CREATE POLICY "staff writes types" ON public.property_types
  FOR ALL USING (public.has_perm(auth.uid(), 'taxonomy'))
  WITH CHECK (public.has_perm(auth.uid(), 'taxonomy'));
CREATE POLICY "staff writes regions" ON public.regions
  FOR ALL USING (public.has_perm(auth.uid(), 'geo'))
  WITH CHECK (public.has_perm(auth.uid(), 'geo'));
CREATE POLICY "staff writes cities" ON public.cities
  FOR ALL USING (public.has_perm(auth.uid(), 'geo'))
  WITH CHECK (public.has_perm(auth.uid(), 'geo'));
CREATE POLICY "staff writes districts" ON public.districts
  FOR ALL USING (public.has_perm(auth.uid(), 'geo'))
  WITH CHECK (public.has_perm(auth.uid(), 'geo'));
CREATE POLICY "staff reads requests" ON public.property_requests
  FOR SELECT USING (public.has_perm(auth.uid(), 'requests'));
CREATE POLICY "staff deletes requests" ON public.property_requests
  FOR DELETE USING (public.has_perm(auth.uid(), 'requests'));
CREATE POLICY "staff reads interests" ON public.property_interests
  FOR SELECT USING (public.has_perm(auth.uid(), 'interests'));
CREATE POLICY "staff deletes interests" ON public.property_interests
  FOR DELETE USING (public.has_perm(auth.uid(), 'interests'));
CREATE POLICY "staff inserts settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_perm(auth.uid(), 'settings'));
CREATE POLICY "staff updates settings" ON public.site_settings
  FOR UPDATE USING (public.has_perm(auth.uid(), 'settings'))
  WITH CHECK (public.has_perm(auth.uid(), 'settings'));

REVOKE EXECUTE ON FUNCTION public.has_perm(uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_perm(uuid, text) TO authenticated, service_role;

ALTER TABLE public.property_interests
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'form';

REVOKE SELECT ON public.site_settings FROM anon;
GRANT SELECT (
  id, hero_image, hero_title_ar, hero_title_en, hero_subtitle_ar, hero_subtitle_en,
  whatsapp_number, contact_phone, contact_email, updated_at, logo_image, primary_color,
  terms_ar, terms_en, privacy_ar, privacy_en, footer_text_ar, footer_text_en
) ON public.site_settings TO anon;