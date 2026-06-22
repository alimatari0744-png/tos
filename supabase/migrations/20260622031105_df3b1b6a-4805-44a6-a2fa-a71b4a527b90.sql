INSERT INTO public.site_settings (id) VALUES (true)
ON CONFLICT (id) DO NOTHING;

UPDATE public.site_settings SET
  hero_title_ar    = 'نبني الثقة ونعمر المستقبل',
  hero_title_en    = 'Building Trust, Developing the Future',
  hero_subtitle_ar = 'روابي المتحدة — اكتشف أفضل العروض العقارية في المملكة',
  hero_subtitle_en = 'Rawabi United — discover the best real estate offers in the Kingdom',
  footer_text_ar   = '© 2026 روابي المتحدة . جميع الحقوق محفوظة.',
  footer_text_en   = '© 2026 Rawabi United. All rights reserved.',
  primary_color    = '#c97b3c',
  whatsapp_number  = '966500000000'
WHERE id = true;

INSERT INTO public.taxonomy_options (id, kind, key, label_ar, label_en, sort) VALUES
  ('df11c5c0-14cd-4771-8450-ea6412990c10', 'desire', '0000', 'للتقبيل', 'lltkfdg', 3),
  ('69760ca9-bda9-43e4-814e-fc1637a515f8', 'status', '1111', 'محجوز', 'mhgo.', 3),
  ('2bd1fd7b-75af-4858-be56-4b05b20340a0', 'usage',  '2222', 'استوديو', 'hsj,]d,', 7)
ON CONFLICT (id) DO UPDATE SET
  kind = EXCLUDED.kind, key = EXCLUDED.key,
  label_ar = EXCLUDED.label_ar, label_en = EXCLUDED.label_en, sort = EXCLUDED.sort;

INSERT INTO public.property_types (id, usage, label_ar, label_en, sort) VALUES
  ('5555', '2222', 'gufm', 'gggg', 23)
ON CONFLICT (id) DO UPDATE SET
  usage = EXCLUDED.usage, label_ar = EXCLUDED.label_ar,
  label_en = EXCLUDED.label_en, sort = EXCLUDED.sort;

INSERT INTO public.regions (id, label_ar, label_en, sort) VALUES
  ('8888', 'خميس مشيط', 'خميس مشيط', 4)
ON CONFLICT (id) DO UPDATE SET
  label_ar = EXCLUDED.label_ar, label_en = EXCLUDED.label_en, sort = EXCLUDED.sort;

INSERT INTO public.cities (id, region_id, label_ar, label_en, lat, lng, sort) VALUES
  ('7777', '8888', 'عسير', 'نتىت', 24.7136, 46.6753, 0)
ON CONFLICT (id) DO UPDATE SET
  region_id = EXCLUDED.region_id, label_ar = EXCLUDED.label_ar,
  label_en = EXCLUDED.label_en, lat = EXCLUDED.lat, lng = EXCLUDED.lng, sort = EXCLUDED.sort;

INSERT INTO public.districts (id, city_id, label_ar, label_en, sort) VALUES
  ('444444', '7777', 'حي الربيع', 'ةهنةخمه', 0)
ON CONFLICT (id) DO UPDATE SET
  city_id = EXCLUDED.city_id, label_ar = EXCLUDED.label_ar,
  label_en = EXCLUDED.label_en, sort = EXCLUDED.sort;