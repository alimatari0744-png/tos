-- 1) Hide stale signed-URL backup columns from anonymous (public) readers.
REVOKE SELECT (prev_hero_image, prev_logo_image) ON public.site_settings FROM anon;

-- 2) Tighten activity_log inserts so authenticated users cannot forge actor_email.
DROP POLICY IF EXISTS "authenticated logs own activity" ON public.activity_log;
CREATE POLICY "authenticated logs own activity"
  ON public.activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      actor_email IS NULL
      OR actor_email = (auth.jwt() ->> 'email')
    )
  );
