export type Lang = "ar" | "en";
export type Desire = "sale" | "rent";
export type Usage =
  | "residential"
  | "commercial"
  | "industrial"
  | "agricultural"
  | "health"
  | "educational";
export type PropertyStatus = "available" | "sold";

export interface Bilingual {
  ar: string;
  en: string;
}

export const desireLabels: Record<Desire, Bilingual> = {
  sale: { ar: "بيع / شراء", en: "Sale / Buy" },
  rent: { ar: "إيجار", en: "Rent" },
};

export const usageLabels: Record<Usage, Bilingual> = {
  residential: { ar: "سكني", en: "Residential" },
  commercial: { ar: "تجاري", en: "Commercial" },
  industrial: { ar: "صناعي", en: "Industrial" },
  agricultural: { ar: "زراعي", en: "Agricultural" },
  health: { ar: "صحي", en: "Health" },
  educational: { ar: "تعليمي", en: "Educational" },
};

export interface ProductType {
  id: string;
  usage: Usage;
  label: Bilingual;
}

export const productTypes: ProductType[] = [
  { id: "villa", usage: "residential", label: { ar: "فيلا", en: "Villa" } },
  { id: "apartment", usage: "residential", label: { ar: "شقة", en: "Apartment" } },
  { id: "tower-apartment", usage: "residential", label: { ar: "شقة في برج", en: "Tower Apartment" } },
  { id: "duplex", usage: "residential", label: { ar: "دبلكس", en: "Duplex" } },
  { id: "floor", usage: "residential", label: { ar: "دور", en: "Floor" } },
  { id: "palace", usage: "residential", label: { ar: "قصر", en: "Palace" } },
  { id: "residential-land", usage: "residential", label: { ar: "أرض سكنية", en: "Residential Land" } },
  { id: "office", usage: "commercial", label: { ar: "مكتب", en: "Office" } },
  { id: "showroom", usage: "commercial", label: { ar: "معرض", en: "Showroom" } },
  { id: "shop", usage: "commercial", label: { ar: "محل", en: "Shop" } },
  { id: "building", usage: "commercial", label: { ar: "عمارة", en: "Building" } },
  { id: "commercial-land", usage: "commercial", label: { ar: "أرض تجارية", en: "Commercial Land" } },
  { id: "warehouse", usage: "industrial", label: { ar: "مستودع", en: "Warehouse" } },
  { id: "factory", usage: "industrial", label: { ar: "مصنع", en: "Factory" } },
  { id: "industrial-land", usage: "industrial", label: { ar: "أرض صناعية", en: "Industrial Land" } },
  { id: "farm", usage: "agricultural", label: { ar: "مزرعة", en: "Farm" } },
  { id: "agricultural-land", usage: "agricultural", label: { ar: "أرض زراعية", en: "Agricultural Land" } },
  { id: "rest-house", usage: "agricultural", label: { ar: "استراحة", en: "Rest House" } },
  { id: "clinic", usage: "health", label: { ar: "مجمع طبي", en: "Medical Complex" } },
  { id: "pharmacy", usage: "health", label: { ar: "صيدلية", en: "Pharmacy" } },
  { id: "school", usage: "educational", label: { ar: "مدرسة", en: "School" } },
  { id: "kindergarten", usage: "educational", label: { ar: "روضة", en: "Kindergarten" } },
];

export function productTypesByUsage(usage: Usage): ProductType[] {
  return productTypes.filter((p) => p.usage === usage);
}

export function getProductType(id: string): ProductType | undefined {
  return productTypes.find((p) => p.id === id);
}

export interface District {
  id: string;
  label: Bilingual;
}

export interface City {
  id: string;
  label: Bilingual;
  lat: number;
  lng: number;
  districts: District[];
}

export interface Region {
  id: string;
  label: Bilingual;
  cities: City[];
}

export const regions: Region[] = [
  {
    id: "riyadh-region",
    label: { ar: "منطقة الرياض", en: "Riyadh Region" },
    cities: [
      {
        id: "riyadh",
        label: { ar: "الرياض", en: "Riyadh" },
        lat: 24.7136,
        lng: 46.6753,
        districts: [
          { id: "sulimaniyah", label: { ar: "حي السليمانية", en: "Al Sulimaniyah" } },
          { id: "narjis", label: { ar: "حي النرجس", en: "Al Narjis" } },
          { id: "rimal", label: { ar: "حي الرمال", en: "Al Rimal" } },
          { id: "malqa", label: { ar: "حي الملقا", en: "Al Malqa" } },
          { id: "yasmin", label: { ar: "حي الياسمين", en: "Al Yasmin" } },
        ],
      },
      {
        id: "kharj",
        label: { ar: "الخرج", en: "Al Kharj" },
        lat: 24.1556,
        lng: 47.335,
        districts: [
          { id: "kharj-north", label: { ar: "حي الشمالي", en: "North District" } },
          { id: "kharj-nahda", label: { ar: "حي النهضة", en: "Al Nahda" } },
        ],
      },
    ],
  },
  {
    id: "makkah-region",
    label: { ar: "منطقة مكة المكرمة", en: "Makkah Region" },
    cities: [
      {
        id: "jeddah",
        label: { ar: "جدة", en: "Jeddah" },
        lat: 21.4858,
        lng: 39.1925,
        districts: [
          { id: "shati", label: { ar: "حي الشاطئ", en: "Al Shati" } },
          { id: "rawdah", label: { ar: "حي الروضة", en: "Al Rawdah" } },
          { id: "hamra", label: { ar: "حي الحمراء", en: "Al Hamra" } },
        ],
      },
      {
        id: "taif",
        label: { ar: "الطائف", en: "Taif" },
        lat: 21.2854,
        lng: 40.4183,
        districts: [
          { id: "shafa", label: { ar: "حي الشفا", en: "Al Shafa" } },
          { id: "hawiyah", label: { ar: "حي الحوية", en: "Al Hawiyah" } },
        ],
      },
    ],
  },
  {
    id: "eastern-region",
    label: { ar: "المنطقة الشرقية", en: "Eastern Region" },
    cities: [
      {
        id: "dammam",
        label: { ar: "الدمام", en: "Dammam" },
        lat: 26.4207,
        lng: 50.0888,
        districts: [
          { id: "shulah", label: { ar: "حي الشعلة", en: "Al Shulah" } },
          { id: "faisaliyah", label: { ar: "حي الفيصلية", en: "Al Faisaliyah" } },
        ],
      },
      {
        id: "khobar",
        label: { ar: "الخبر", en: "Khobar" },
        lat: 26.2172,
        lng: 50.1971,
        districts: [
          { id: "olaya", label: { ar: "حي العليا", en: "Al Olaya" } },
          { id: "rakah", label: { ar: "حي الراكة", en: "Al Rakah" } },
        ],
      },
    ],
  },
];

export const allCities: City[] = regions.flatMap((r) => r.cities);

export function getCity(id: string): City | undefined {
  return allCities.find((c) => c.id === id);
}

export function getRegionByCity(cityId: string): Region | undefined {
  return regions.find((r) => r.cities.some((c) => c.id === cityId));
}

export function citiesByRegion(regionId: string): City[] {
  return regions.find((r) => r.id === regionId)?.cities ?? [];
}

export function label(b: Bilingual, lang: Lang): string {
  return b[lang];
}
