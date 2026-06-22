import type { Desire, Usage } from "@/data/catalog";

export interface Filters {
  desire: Desire | "all";
  usage: Usage | "all";
  cityId: string | "all";
  districtId: string | "all";
  typeId: string | "all";
}

export const defaultFilters: Filters = {
  desire: "all",
  usage: "all",
  cityId: "all",
  districtId: "all",
  typeId: "all",
};

import type { Property } from "@/data/properties";

export function applyFilters(list: Property[], f: Filters): Property[] {
  return list.filter((p) => {
    if (f.desire !== "all" && p.desire !== f.desire) return false;
    if (f.usage !== "all" && p.usage !== f.usage) return false;
    if (f.cityId !== "all" && p.cityId !== f.cityId) return false;
    if (f.districtId !== "all" && p.districtId !== f.districtId) return false;
    if (f.typeId !== "all" && p.typeId !== f.typeId) return false;
    return true;
  });
}
