import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import villa1 from "@/assets/property-villa1.jpg";
import villa2 from "@/assets/property-villa2.jpg";
import land1 from "@/assets/property-land1.jpg";
import apartment1 from "@/assets/property-apartment1.jpg";
import interior1 from "@/assets/property-interior1.jpg";
import type { Property } from "@/data/properties";
import type { ProductType, Usage } from "@/data/catalog";

export const DEFAULT_WHATSAPP = "966500000000";

export const fallbackGallery = [villa1, villa2, interior1, apartment1, land1];

export interface SiteSettings {
  hero_image: string | null;
  hero_title_ar: string | null;
  hero_title_en: string | null;
  hero_subtitle_ar: string | null;
  hero_subtitle_en: string | null;
  whatsapp_number: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  logo_image: string | null;
  primary_color: string | null;
  terms_ar: string | null;
  terms_en: string | null;
  privacy_ar: string | null;
  privacy_en: string | null;
  footer_text_ar: string | null;
  footer_text_en: string | null;
}

// ---- mappers ----
function fallbackImage(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return fallbackGallery[h % fallbackGallery.length];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProperty(row: any): Property {
  return {
    id: row.id,
    ref: row.ref,
    desire: row.desire,
    usage: row.usage,
    typeId: row.type_id,
    cityId: row.city_id,
    districtId: row.district_id,
    area: Number(row.area) || 0,
    price: Number(row.price) || 0,
    status: row.status,
    image: row.image || (Array.isArray(row.images) && row.images[0]) || fallbackImage(row.id),
    images: Array.isArray(row.images) && row.images.length ? row.images : undefined,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    livingRooms: row.living_rooms ?? undefined,
    age: row.age ?? undefined,
    street: row.street ?? undefined,
    streetWest: row.street_west ?? undefined,
    license: row.license ?? undefined,
    description:
      row.description_ar || row.description_en
        ? { ar: row.description_ar ?? "", en: row.description_en ?? "" }
        : undefined,
    lat: row.lat != null ? Number(row.lat) : undefined,
    lng: row.lng != null ? Number(row.lng) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapType(row: any): ProductType {
  return {
    id: row.id,
    usage: row.usage as Usage,
    label: { ar: row.label_ar, en: row.label_en },
  };
}

// ---- hooks ----
export function useSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings | null> => {
      const { data } = await supabase
        .from("site_settings")
        .select(
          "hero_image, hero_title_ar, hero_title_en, hero_subtitle_ar, hero_subtitle_en, whatsapp_number, contact_phone, contact_email, logo_image, primary_color, terms_ar, terms_en, privacy_ar, privacy_en, footer_text_ar, footer_text_en",
        )
        .maybeSingle();
      return (data as SiteSettings) ?? null;
    },
    staleTime: 60_000,
  });
}

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async (): Promise<Property[]> => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("sort", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapProperty);
    },
    staleTime: 30_000,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async (): Promise<Property | null> => {
      const { data } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      return data ? mapProperty(data) : null;
    },
  });
}

export function usePropertyTypes() {
  return useQuery({
    queryKey: ["property_types"],
    queryFn: async (): Promise<ProductType[]> => {
      const { data, error } = await supabase
        .from("property_types")
        .select("*")
        .order("sort", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapType);
    },
    staleTime: 60_000,
  });
}

export function whatsappNumber(settings?: SiteSettings | null): string {
  return settings?.whatsapp_number?.trim() || DEFAULT_WHATSAPP;
}

/* ---------------- Geo (regions / cities / districts) ---------------- */
export interface GeoDistrict {
  id: string;
  label: { ar: string; en: string };
}
export interface GeoCity {
  id: string;
  regionId: string;
  label: { ar: string; en: string };
  lat: number;
  lng: number;
  districts: GeoDistrict[];
}
export interface GeoRegion {
  id: string;
  label: { ar: string; en: string };
  cities: GeoCity[];
}

export function useGeo() {
  return useQuery({
    queryKey: ["geo"],
    queryFn: async (): Promise<{ regions: GeoRegion[]; cities: GeoCity[] }> => {
      const [r, c, d] = await Promise.all([
        supabase.from("regions").select("*").order("sort"),
        supabase.from("cities").select("*").order("sort"),
        supabase.from("districts").select("*").order("sort"),
      ]);
      const cities: GeoCity[] = (c.data ?? []).map((city) => ({
        id: city.id,
        regionId: city.region_id,
        label: { ar: city.label_ar, en: city.label_en },
        lat: Number(city.lat),
        lng: Number(city.lng),
        districts: (d.data ?? [])
          .filter((x) => x.city_id === city.id)
          .map((x) => ({ id: x.id, label: { ar: x.label_ar, en: x.label_en } })),
      }));
      const regions: GeoRegion[] = (r.data ?? []).map((reg) => ({
        id: reg.id,
        label: { ar: reg.label_ar, en: reg.label_en },
        cities: cities.filter((x) => x.regionId === reg.id),
      }));
      return { regions, cities };
    },
    staleTime: 60_000,
  });
}

/* ---------------- Taxonomy (desire / status / usage) ---------------- */
export type TaxonomyKind = "desire" | "status" | "usage";
export interface TaxonomyOption {
  id: string;
  kind: TaxonomyKind;
  key: string;
  label: { ar: string; en: string };
  sort: number;
}

export function useTaxonomy() {
  return useQuery({
    queryKey: ["taxonomy"],
    queryFn: async (): Promise<Record<TaxonomyKind, TaxonomyOption[]>> => {
      const { data } = await supabase.from("taxonomy_options").select("*").order("sort");
      const grouped: Record<TaxonomyKind, TaxonomyOption[]> = {
        desire: [],
        status: [],
        usage: [],
      };
      (data ?? []).forEach((row) => {
        const opt: TaxonomyOption = {
          id: row.id,
          kind: row.kind as TaxonomyKind,
          key: row.key,
          label: { ar: row.label_ar, en: row.label_en },
          sort: row.sort,
        };
        if (grouped[opt.kind]) grouped[opt.kind].push(opt);
      });
      return grouped;
    },
    staleTime: 60_000,
  });
}

