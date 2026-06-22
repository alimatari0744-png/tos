import villa1 from "@/assets/property-villa1.jpg";
import villa2 from "@/assets/property-villa2.jpg";
import land1 from "@/assets/property-land1.jpg";
import apartment1 from "@/assets/property-apartment1.jpg";
import interior1 from "@/assets/property-interior1.jpg";
import {
  type Desire,
  type Usage,
  type PropertyStatus,
  type Bilingual,
  type Lang,
  getCity,
  getProductType,
  getRegionByCity,
} from "./catalog";

export type { PropertyStatus };

export interface Property {
  id: string;
  ref: string;
  desire: Desire;
  usage: Usage;
  typeId: string;
  cityId: string;
  districtId: string;
  area: number;
  price: number;
  status: PropertyStatus;
  image: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  livingRooms?: number;
  age?: number;
  street?: number;
  streetWest?: number;
  license?: string;
  description?: Bilingual;
  lat?: number;
  lng?: number;
}

export const properties: Property[] = [
  { id: "1", ref: "9050934", desire: "sale", usage: "residential", typeId: "villa", cityId: "riyadh", districtId: "sulimaniyah", area: 1720, price: 9625000, status: "available", image: villa1, bedrooms: 6, bathrooms: 7, livingRooms: 3, age: 1, street: 20, streetWest: 15 },
  { id: "2", ref: "7082296", desire: "sale", usage: "residential", typeId: "residential-land", cityId: "riyadh", districtId: "rimal", area: 17464, price: 78588000, status: "sold", image: land1, street: 30 },
  { id: "3", ref: "7561563", desire: "sale", usage: "commercial", typeId: "commercial-land", cityId: "riyadh", districtId: "malqa", area: 34836, price: 59222050, status: "available", image: land1, street: 36 },
  { id: "4", ref: "5208456", desire: "rent", usage: "residential", typeId: "apartment", cityId: "riyadh", districtId: "rimal", area: 168, price: 55000, status: "available", image: interior1, bedrooms: 3, bathrooms: 2, livingRooms: 1, age: 2, street: 15 },
  { id: "5", ref: "4807763", desire: "sale", usage: "residential", typeId: "villa", cityId: "riyadh", districtId: "narjis", area: 560, price: 5500000, status: "available", image: villa2, bedrooms: 5, bathrooms: 6, livingRooms: 2, age: 0, street: 18, streetWest: 12 },
  { id: "6", ref: "5144521", desire: "sale", usage: "residential", typeId: "duplex", cityId: "jeddah", districtId: "rawdah", area: 298, price: 3200000, status: "available", image: villa1, bedrooms: 4, bathrooms: 4, livingRooms: 2, age: 3, street: 16 },
  { id: "7", ref: "7458753", desire: "sale", usage: "residential", typeId: "villa", cityId: "jeddah", districtId: "shati", area: 1717, price: 10302000, status: "available", image: villa2, bedrooms: 7, bathrooms: 8, livingRooms: 3, age: 1, street: 25 },
  { id: "8", ref: "8335869", desire: "rent", usage: "residential", typeId: "tower-apartment", cityId: "jeddah", districtId: "hamra", area: 475, price: 120000, status: "available", image: apartment1, bedrooms: 4, bathrooms: 4, livingRooms: 1, age: 2, street: 20 },
  { id: "9", ref: "1544148", desire: "sale", usage: "agricultural", typeId: "farm", cityId: "kharj", districtId: "kharj-nahda", area: 10000, price: 6000000, status: "available", image: land1, street: 12 },
  { id: "10", ref: "2274891", desire: "rent", usage: "commercial", typeId: "office", cityId: "dammam", districtId: "faisaliyah", area: 220, price: 90000, status: "available", image: interior1, bathrooms: 2, street: 30 },
  { id: "11", ref: "3398120", desire: "sale", usage: "commercial", typeId: "building", cityId: "khobar", districtId: "olaya", area: 640, price: 7800000, status: "available", image: apartment1, age: 4, street: 24 },
  { id: "12", ref: "6611204", desire: "sale", usage: "residential", typeId: "villa", cityId: "taif", districtId: "shafa", area: 520, price: 2900000, status: "available", image: villa2, bedrooms: 5, bathrooms: 5, livingRooms: 2, age: 2, street: 15 },
  { id: "13", ref: "9921455", desire: "rent", usage: "industrial", typeId: "warehouse", cityId: "dammam", districtId: "shulah", area: 1200, price: 180000, status: "available", image: land1, street: 40 },
  { id: "14", ref: "4455012", desire: "sale", usage: "residential", typeId: "apartment", cityId: "khobar", districtId: "rakah", area: 190, price: 980000, status: "available", image: interior1, bedrooms: 3, bathrooms: 2, livingRooms: 1, age: 5, street: 15 },
];

export function getProperty(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

const galleryPool = [villa1, villa2, interior1, apartment1, land1];

export function propertyImages(p: Property): string[] {
  // Prefer the uploaded gallery if present
  if (p.images && p.images.length) return p.images;
  const start = galleryPool.indexOf(p.image);
  const rest = galleryPool.filter((_, i) => i !== start);
  return [p.image, ...rest].slice(0, 4);
}

export interface PropertyView extends Property {
  cityLat: number;
  cityLng: number;
}

export const propertyViews: PropertyView[] = properties.map((p) => {
  const city = getCity(p.cityId);
  return {
    ...p,
    cityLat: city?.lat ?? 24.7136,
    cityLng: city?.lng ?? 46.6753,
  };
});

export function propertyTitle(p: Property, lang: Lang): string {
  const type = getProductType(p.typeId);
  const typeName = type ? type.label[lang] : "";
  const desireName =
    p.desire === "sale"
      ? lang === "ar"
        ? "للبيع"
        : "For Sale"
      : lang === "ar"
        ? "للإيجار"
        : "For Rent";
  return `${typeName} ${desireName}`;
}

export function propertyLocation(p: Property, lang: Lang): string {
  const city = getCity(p.cityId);
  const district = city?.districts.find((d) => d.id === p.districtId);
  const districtName = district?.label[lang] ?? "";
  const cityName = city?.label[lang] ?? "";
  return `${districtName}، ${cityName}`.replace(/^،\s*/, "");
}

export function propertyRegion(p: Property, lang: Lang): string {
  return getRegionByCity(p.cityId)?.label[lang] ?? "";
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US").format(price);

export function propertyLicense(p: Property): string {
  return p.license ?? `72000${p.ref}`;
}

export function similarProperties(p: Property, count = 3): Property[] {
  const scored = properties
    .filter((x) => x.id !== p.id)
    .map((x) => {
      let score = 0;
      if (x.typeId === p.typeId) score += 4;
      if (x.usage === p.usage) score += 2;
      if (x.cityId === p.cityId) score += 2;
      if (x.desire === p.desire) score += 1;
      return { x, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.x);
}
