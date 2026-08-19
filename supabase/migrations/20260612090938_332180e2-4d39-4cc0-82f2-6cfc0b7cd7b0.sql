
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

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- SITE SETTINGS (single row)
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

-- PROPERTY TYPES
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

-- PROPERTIES
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

-- PROPERTY REQUESTS
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

-- PROPERTY INTERESTS
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
