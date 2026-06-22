
-- Hero revert + property gallery columns
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS prev_hero_image text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

-- ===== Regions =====
CREATE TABLE IF NOT EXISTS public.regions (
  id text PRIMARY KEY,
  label_ar text NOT NULL,
  label_en text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.regions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.regions TO authenticated;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "admin writes regions" ON public.regions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== Cities =====
CREATE TABLE IF NOT EXISTS public.cities (
  id text PRIMARY KEY,
  region_id text NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  label_ar text NOT NULL,
  label_en text NOT NULL DEFAULT '',
  lat numeric NOT NULL DEFAULT 24.7136,
  lng numeric NOT NULL DEFAULT 46.6753,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cities TO authenticated;
GRANT ALL ON public.cities TO service_role;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "admin writes cities" ON public.cities FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== Districts =====
CREATE TABLE IF NOT EXISTS public.districts (
  id text PRIMARY KEY,
  city_id text NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  label_ar text NOT NULL,
  label_en text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.districts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.districts TO authenticated;
GRANT ALL ON public.districts TO service_role;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "admin writes districts" ON public.districts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== Taxonomy options (desire / status / usage) =====
CREATE TABLE IF NOT EXISTS public.taxonomy_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  key text NOT NULL,
  label_ar text NOT NULL,
  label_en text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, key)
);
GRANT SELECT ON public.taxonomy_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.taxonomy_options TO authenticated;
GRANT ALL ON public.taxonomy_options TO service_role;
ALTER TABLE public.taxonomy_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads taxonomy" ON public.taxonomy_options FOR SELECT USING (true);
CREATE POLICY "admin writes taxonomy" ON public.taxonomy_options FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== Seed regions/cities/districts from existing catalog =====
INSERT INTO public.regions (id, label_ar, label_en, sort) VALUES
  ('riyadh-region','منطقة الرياض','Riyadh Region',1),
  ('makkah-region','منطقة مكة المكرمة','Makkah Region',2),
  ('eastern-region','المنطقة الشرقية','Eastern Region',3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, region_id, label_ar, label_en, lat, lng, sort) VALUES
  ('riyadh','riyadh-region','الرياض','Riyadh',24.7136,46.6753,1),
  ('kharj','riyadh-region','الخرج','Al Kharj',24.1556,47.335,2),
  ('jeddah','makkah-region','جدة','Jeddah',21.4858,39.1925,1),
  ('taif','makkah-region','الطائف','Taif',21.2854,40.4183,2),
  ('dammam','eastern-region','الدمام','Dammam',26.4207,50.0888,1),
  ('khobar','eastern-region','الخبر','Khobar',26.2172,50.1971,2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (id, city_id, label_ar, label_en, sort) VALUES
  ('sulimaniyah','riyadh','حي السليمانية','Al Sulimaniyah',1),
  ('narjis','riyadh','حي النرجس','Al Narjis',2),
  ('rimal','riyadh','حي الرمال','Al Rimal',3),
  ('malqa','riyadh','حي الملقا','Al Malqa',4),
  ('yasmin','riyadh','حي الياسمين','Al Yasmin',5),
  ('kharj-north','kharj','حي الشمالي','North District',1),
  ('kharj-nahda','kharj','حي النهضة','Al Nahda',2),
  ('shati','jeddah','حي الشاطئ','Al Shati',1),
  ('rawdah','jeddah','حي الروضة','Al Rawdah',2),
  ('hamra','jeddah','حي الحمراء','Al Hamra',3),
  ('shafa','taif','حي الشفا','Al Shafa',1),
  ('hawiyah','taif','حي الحوية','Al Hawiyah',2),
  ('shulah','dammam','حي الشعلة','Al Shulah',1),
  ('faisaliyah','dammam','حي الفيصلية','Al Faisaliyah',2),
  ('olaya','khobar','حي العليا','Al Olaya',1),
  ('rakah','khobar','حي الراكة','Al Rakah',2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_options (kind, key, label_ar, label_en, sort) VALUES
  ('desire','sale','للبيع','For Sale',1),
  ('desire','rent','للإيجار','For Rent',2),
  ('status','available','متاح','Available',1),
  ('status','sold','مباع','Sold',2),
  ('usage','residential','سكني','Residential',1),
  ('usage','commercial','تجاري','Commercial',2),
  ('usage','industrial','صناعي','Industrial',3),
  ('usage','agricultural','زراعي','Agricultural',4),
  ('usage','health','صحي','Health',5),
  ('usage','educational','تعليمي','Educational',6)
ON CONFLICT (kind, key) DO NOTHING;
