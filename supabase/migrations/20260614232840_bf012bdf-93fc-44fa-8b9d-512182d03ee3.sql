
CREATE OR REPLACE FUNCTION public.has_perm(_user_id uuid, _perm text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
    OR EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE user_id = _user_id AND permission = _perm
    )
$$;

-- staff_permissions policies
CREATE POLICY "admin manages staff permissions" ON public.staff_permissions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "staff read own permissions" ON public.staff_permissions
  FOR SELECT USING (auth.uid() = user_id);

-- activity_log policies
CREATE POLICY "admin reads activity" ON public.activity_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "authenticated logs own activity" ON public.activity_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- staff write access on content tables
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
