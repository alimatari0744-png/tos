CREATE POLICY "public read site bucket" ON storage.objects FOR SELECT USING (bucket_id = 'site');
CREATE POLICY "admin upload site bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site' AND public.has_perm(auth.uid(),'settings'));
CREATE POLICY "admin update site bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site' AND public.has_perm(auth.uid(),'settings'));
CREATE POLICY "admin delete site bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site' AND public.has_perm(auth.uid(),'settings'));