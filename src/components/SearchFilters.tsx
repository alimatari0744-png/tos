import {
  desireLabels,
  usageLabels,
  allCities,
  type Desire,
  type Usage,
} from "@/data/catalog";
import type { Property } from "@/data/properties";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Filters } from "@/lib/filters";
import { useGeo, useTaxonomy } from "@/lib/site-data";

export function SearchFilters({
  filters,
  setFilters,
  countItems = [],
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  countItems?: Property[];
}) {
  const { lang, t } = useLanguage();
  const { data: geo } = useGeo();
  const { data: tax } = useTaxonomy();

  // Cities: DB first, fallback to static catalog
  const cities =
    geo?.cities && geo.cities.length
      ? geo.cities
      : allCities.map((c) => ({
          id: c.id,
          label: c.label,
          districts: c.districts.map((d) => ({ id: d.id, label: d.label })),
        }));

  const desireOptions =
    tax?.desire && tax.desire.length
      ? tax.desire.map((o) => ({ key: o.key, label: o.label }))
      : (["sale", "rent"] as Desire[]).map((k) => ({ key: k, label: desireLabels[k] }));

  const usageOptions =
    tax?.usage && tax.usage.length
      ? tax.usage.map((o) => ({ key: o.key, label: o.label }))
      : (Object.keys(usageLabels) as Usage[]).map((k) => ({ key: k, label: usageLabels[k] }));

  const cityCounts = cities.map((c) => ({
    city: c,
    count: countItems.filter((p) => p.cityId === c.id).length,
  }));

  const selectedCity = filters.cityId !== "all" ? cities.find((c) => c.id === filters.cityId) : null;

  const selectCls =
    "w-full appearance-none rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Desire */}
      <select
        className={selectCls}
        value={filters.desire}
        onChange={(e) =>
          setFilters({ ...filters, desire: e.target.value as Filters["desire"] })
        }
      >
        <option value="all">{t("search.desire")}</option>
        {desireOptions.map((d) => (
          <option key={d.key} value={d.key}>
            {d.label[lang]}
          </option>
        ))}
      </select>

      {/* City */}
      <select
        className={selectCls}
        value={filters.cityId}
        onChange={(e) =>
          setFilters({ ...filters, cityId: e.target.value, districtId: "all" })
        }
      >
        <option value="all">{t("search.city")}</option>
        {cityCounts.map(({ city, count }) => (
          <option key={city.id} value={city.id}>
            {city.label[lang]} ({count})
          </option>
        ))}
      </select>

      {/* District */}
      <select
        className={selectCls}
        value={filters.districtId}
        disabled={!selectedCity}
        onChange={(e) => setFilters({ ...filters, districtId: e.target.value })}
      >
        <option value="all">{t("search.district")}</option>
        {selectedCity?.districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label[lang]}
          </option>
        ))}
      </select>

      {/* Usage */}
      <select
        className={selectCls}
        value={filters.usage}
        onChange={(e) =>
          setFilters({ ...filters, usage: e.target.value as Filters["usage"] })
        }
      >
        <option value="all">{t("search.usage")}</option>
        {usageOptions.map((u) => (
          <option key={u.key} value={u.key}>
            {u.label[lang]}
          </option>
        ))}
      </select>
    </div>
  );
}
