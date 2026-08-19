import { useState } from "react";
import { ChevronDown, ListFilter } from "lucide-react";
import {
  desireLabels,
  productTypes as fallbackTypes,
  usageLabels,
  allCities,
  type Desire,
  type Usage,
} from "@/data/catalog";
import type { Property } from "@/data/properties";
import { useLanguage } from "@/i18n/LanguageContext";
import { type Filters } from "@/lib/filters";
import { useGeo, useTaxonomy, usePropertyTypes } from "@/lib/site-data";

export function SearchFilters({
  filters,
  setFilters,
  countItems = [],
  resultCount,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  countItems?: Property[];
  resultCount?: number;
}) {
  const { lang, t } = useLanguage();
  const { data: geo } = useGeo();
  const { data: tax } = useTaxonomy();
  const { data: dbTypes } = usePropertyTypes();
  const [open, setOpen] = useState(false);

  const typeList = dbTypes && dbTypes.length > 0 ? dbTypes : fallbackTypes;

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

  const visibleTypes =
    filters.usage === "all"
      ? typeList
      : typeList.filter((p) => p.usage === filters.usage);

  const selectedCity = filters.cityId !== "all" ? cities.find((c) => c.id === filters.cityId) : null;
  const shownCount = resultCount ?? countItems.length;
  const extraActive =
    filters.usage !== "all" ||
    filters.cityId !== "all" ||
    filters.districtId !== "all" ||
    filters.typeId !== "all";
  const extraCount = [
    filters.usage !== "all",
    filters.typeId !== "all",
    filters.cityId !== "all",
    filters.districtId !== "all",
  ].filter(Boolean).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card" data-tour="search">
      <div className="flex items-center gap-1 p-1.5">
        <div className="flex min-w-0 flex-1">
          <PurposeTab
            active={filters.desire === "all"}
            onClick={() => setFilters({ ...filters, desire: "all" })}
          >
            {t("search.all")}
          </PurposeTab>
          {desireOptions.map((d) => (
            <PurposeTab
              key={d.key}
              active={filters.desire === d.key}
              onClick={() => setFilters({ ...filters, desire: d.key as Filters["desire"] })}
            >
              {d.key === "sale"
                ? t("search.forSale")
                : d.key === "rent"
                  ? t("search.forRent")
                  : d.label[lang]}
            </PurposeTab>
          ))}
        </div>
        <button
          type="button"
          aria-label={t("search.filters")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            open || extraActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          }`}
        >
          <ListFilter className="h-5 w-5" />
          {extraCount > 0 && (
            <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
              {extraCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <>
          <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <FilterField label={t("search.usage")}>
              <NativeSelect
                value={filters.usage}
                onChange={(value) =>
                  setFilters({ ...filters, usage: value as Filters["usage"], typeId: "all" })
                }
              >
                <option value="all">{t("search.allUsages")}</option>
                {usageOptions.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.label[lang]}
                  </option>
                ))}
              </NativeSelect>
            </FilterField>

            <FilterField label={t("search.type")}>
              <NativeSelect
                value={filters.typeId}
                onChange={(value) => setFilters({ ...filters, typeId: value })}
              >
                <option value="all">{t("search.allTypes")}</option>
                {visibleTypes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label[lang]}
                  </option>
                ))}
              </NativeSelect>
            </FilterField>

            <FilterField label={t("search.city")}>
              <NativeSelect
                value={filters.cityId}
                onChange={(value) => setFilters({ ...filters, cityId: value, districtId: "all" })}
              >
                <option value="all">{t("search.allCities")}</option>
                {cities.map((city) => {
                  const count = countItems.filter((p) => p.cityId === city.id).length;
                  return (
                    <option key={city.id} value={city.id}>
                      {city.label[lang]}
                      {count ? ` (${count})` : ""}
                    </option>
                  );
                })}
              </NativeSelect>
            </FilterField>

            <FilterField label={t("search.district")}>
              <NativeSelect
                value={filters.districtId}
                disabled={!selectedCity}
                onChange={(value) => setFilters({ ...filters, districtId: value })}
              >
                <option value="all">{t("search.allDistricts")}</option>
                {selectedCity?.districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label[lang]}
                  </option>
                ))}
              </NativeSelect>
            </FilterField>
          </div>

          {extraActive && (
            <div className="flex justify-end border-t border-border px-4 py-2.5">
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    ...filters,
                    usage: "all",
                    typeId: "all",
                    cityId: "all",
                    districtId: "all",
                  })
                }
                className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {t("search.reset")}
              </button>
            </div>
          )}
        </>
      )}

      <div className="border-t border-border bg-secondary/20 px-4 py-2.5">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{shownCount}</span> {t("search.results")}
        </p>
      </div>
    </div>
  );
}

function PurposeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-bold transition-colors sm:px-3 ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer flex-col gap-1.5 bg-card px-4 py-3">
      <span className="text-[11px] font-bold tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function NativeSelect({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none bg-transparent pe-6 text-sm font-semibold text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
