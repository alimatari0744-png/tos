-- ROLES
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table public.site_settings (
  id boolean primary key default true,
  hero_image text,
  hero_title_ar text,
  hero_title_en text,
  hero_subtitle_ar text,
  hero_subtitle_en text,
  whatsapp_number text,
  contact_phone text,
  contact_email text,
  updated_at timestamptz not null default now(),
  constraint single_row check (id)
);
grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;
grant insert, update on public.site_settings to authenticated;
alter table public.site_settings enable row level security;
create policy "anyone reads settings" on public.site_settings for select using (true);
create policy "admin updates settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin inserts settings" on public.site_settings for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create trigger trg_settings_updated before update on public.site_settings for each row execute function public.set_updated_at();

insert into public.site_settings (id, whatsapp_number, contact_phone, contact_email,
  hero_title_ar, hero_title_en, hero_subtitle_ar, hero_subtitle_en)
values (true, '966500000000', '', '',
  'نبني الثقة ونعمر المستقبل', 'Building Trust, Developing the Future',
  'ثقة الإعمار للخدمات العقارية — اكتشف أفضل العروض العقارية في المملكة',
  'Thiqah Al-Emaar — discover the best real estate offers in the Kingdom');

create table public.property_types (
  id text primary key,
  usage text not null,
  label_ar text not null,
  label_en text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.property_types to anon, authenticated;
grant all on public.property_types to service_role;
grant insert, update, delete on public.property_types to authenticated;
alter table public.property_types enable row level security;
create policy "anyone reads types" on public.property_types for select using (true);
create policy "admin writes types" on public.property_types for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.property_types (id, usage, label_ar, label_en, sort) values
('villa','residential','فيلا','Villa',1),
('apartment','residential','شقة','Apartment',2),
('tower-apartment','residential','شقة في برج','Tower Apartment',3),
('duplex','residential','دبلكس','Duplex',4),
('floor','residential','دور','Floor',5),
('palace','residential','قصر','Palace',6),
('residential-land','residential','أرض سكنية','Residential Land',7),
('office','commercial','مكتب','Office',8),
('showroom','commercial','معرض','Showroom',9),
('shop','commercial','محل','Shop',10),
('building','commercial','عمارة','Building',11),
('commercial-land','commercial','أرض تجارية','Commercial Land',12),
('warehouse','industrial','مستودع','Warehouse',13),
('factory','industrial','مصنع','Factory',14),
('industrial-land','industrial','أرض صناعية','Industrial Land',15),
('farm','agricultural','مزرعة','Farm',16),
('agricultural-land','agricultural','أرض زراعية','Agricultural Land',17),
('rest-house','agricultural','استراحة','Rest House',18),
('clinic','health','مجمع طبي','Medical Complex',19),
('pharmacy','health','صيدلية','Pharmacy',20),
('school','educational','مدرسة','School',21),
('kindergarten','educational','روضة','Kindergarten',22);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  ref text not null,
  desire text not null default 'sale',
  usage text not null default 'residential',
  type_id text not null,
  city_id text not null,
  district_id text not null,
  area numeric not null default 0,
  price numeric not null default 0,
  status text not null default 'available',
  image text,
  bedrooms int,
  bathrooms int,
  living_rooms int,
  age int,
  street int,
  street_west int,
  license text,
  description_ar text,
  description_en text,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.properties to anon, authenticated;
grant all on public.properties to service_role;
grant insert, update, delete on public.properties to authenticated;
alter table public.properties enable row level security;
create policy "anyone reads properties" on public.properties for select using (true);
create policy "admin writes properties" on public.properties for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_properties_updated before update on public.properties for each row execute function public.set_updated_at();

create table public.property_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  budget text,
  message text,
  details jsonb,
  created_at timestamptz not null default now()
);
grant insert on public.property_requests to anon, authenticated;
grant select, delete on public.property_requests to authenticated;
grant all on public.property_requests to service_role;
alter table public.property_requests enable row level security;
create policy "anyone submits requests" on public.property_requests for insert with check (true);
create policy "admin reads requests" on public.property_requests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin deletes requests" on public.property_requests for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.property_interests (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  property_ref text,
  created_at timestamptz not null default now()
);
grant insert on public.property_interests to anon, authenticated;
grant select, delete on public.property_interests to authenticated;
grant all on public.property_interests to service_role;
alter table public.property_interests enable row level security;
create policy "anyone submits interests" on public.property_interests for insert with check (true);
create policy "admin reads interests" on public.property_interests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin deletes interests" on public.property_interests for delete to authenticated using (public.has_role(auth.uid(),'admin'));

revoke execute on function public.has_role(uuid, public.app_role) from anon, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS prev_hero_image text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

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

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS logo_image text,
  ADD COLUMN IF NOT EXISTS prev_logo_image text,
  ADD COLUMN IF NOT EXISTS primary_color text;