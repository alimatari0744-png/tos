import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { correctBrandName } from "@/lib/utils";
import {
  DEMO_GALLERY,
  properties as fallbackProperties,
  type Property,
} from "@/data/properties";
import type { ProductType, Usage } from "@/data/catalog";

export const DEFAULT_WHATSAPP = "966500000000";

export const fallbackGallery = DEMO_GALLERY;

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

function isBrokenImageUrl(url?: string | null): boolean {
  if (!url) return true;
  if (url.startsWith("/demo-properties/")) return false;
  if (url.startsWith("/") || url.startsWith("blob:") || url.startsWith("data:")) return false;
  return /unsplash\.com|lovable\.app|__l5e\/|r2\.dev/i.test(url);
}

function resolveMedia(row: {
  id?: string;
  ref?: string;
  type_id?: string;
  image?: string | null;
  images?: string[] | null;
}): { image: string; images?: string[] } {
  const byRef = fallbackProperties.find((p) => p.ref === row.ref);
  const byType = fallbackProperties.find((p) => p.typeId === row.type_id);
  const local = byRef?.images?.length
    ? { image: byRef.image, images: byRef.images }
    : byType?.images?.length
      ? { image: byType.image, images: byType.images }
      : {
          image: fallbackImage(String(row.id ?? row.ref ?? "x")),
          images: fallbackGallery.slice(0, 4),
        };

  const rawImages = Array.isArray(row.images) ? row.images.filter(Boolean) : [];
  const rawImage = row.image || rawImages[0];
  if (!isBrokenImageUrl(rawImage) && rawImages.every((u) => !isBrokenImageUrl(u))) {
    return { image: rawImage as string, images: rawImages.length ? rawImages : undefined };
  }
  return local;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProperty(row: any): Property {
  const media = resolveMedia(row);
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
    image: media.image,
    images: media.images,
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
      return correctBrandName((data as SiteSettings) ?? null);
    },
    staleTime: 60_000,
  });
}

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async (): Promise<Property[]> => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .order("sort", { ascending: true });
        if (error) throw error;
        const mapped = (data ?? []).map(mapProperty);
        if (mapped.length >= 8) return mapped;
        const refs = new Set(mapped.map((p) => p.ref));
        return [...mapped, ...fallbackProperties.filter((p) => !refs.has(p.ref))];
      } catch {
        return fallbackProperties;
      }
    },
    staleTime: 30_000,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async (): Promise<Property | null> => {
      try {
        const { data } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
        if (data) return mapProperty(data);
      } catch {
        /* demo catalog */
      }
      return fallbackProperties.find((p) => p.id === id) ?? null;
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

