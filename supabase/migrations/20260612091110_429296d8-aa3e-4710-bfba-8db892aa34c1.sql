
create policy "public read site bucket" on storage.objects for select using (bucket_id = 'site');
create policy "admin upload site bucket" on storage.objects for insert to authenticated with check (bucket_id = 'site' and public.has_role(auth.uid(),'admin'));
create policy "admin update site bucket" on storage.objects for update to authenticated using (bucket_id = 'site' and public.has_role(auth.uid(),'admin'));
create policy "admin delete site bucket" on storage.objects for delete to authenticated using (bucket_id = 'site' and public.has_role(auth.uid(),'admin'));
