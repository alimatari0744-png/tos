import { productTypes as fallbackTypes, type ProductType } from "@/data/catalog";
import { type Property } from "@/data/properties";
import { useLanguage } from "@/i18n/LanguageContext";
import { defaultFilters, type Filters } from "@/lib/filters";
import { PropertyCard } from "./PropertyCard";
import { SearchFilters } from "./SearchFilters";

export function PropertiesSection({
  items,
  allItems,
  types,
  filters,
  setFilters,
}: {
  items: Property[];
  allItems?: Property[];
  types?: ProductType[];
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const { t, lang } = useLanguage();

  const typeList = types && types.length > 0 ? types : fallbackTypes;
  const chips: { id: string; label: string }[] = [
    { id: "all", label: t("search.all") },
    ...typeList.map((p) => ({ id: p.id, label: p.label[lang] })),
  ];

  return (
    <section id="properties" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-start">
        <h2 className="text-3xl font-black text-foreground sm:text-4xl">
          {t("properties.title")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("properties.subtitle")}</p>
      </div>

      {/* Category chips — scrollbar fully hidden, drag/scroll still works */}
      <div className="no-scrollbar mb-6 -mx-4 overflow-x-auto px-4 pb-2">
        <div className="flex w-max gap-2">
          {chips.map((chip) => {
            const active = filters.typeId === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilters({ ...filters, typeId: chip.id })}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "gradient-primary border-transparent text-primary-foreground shadow-card"
                    : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search bar — matches reference layout */}
      <div className="mb-6 rounded-3xl border border-border bg-secondary/30 p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-black text-foreground">
          {t("search.title")}
        </h3>
        <SearchFilters filters={filters} setFilters={setFilters} countItems={allItems ?? items} />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-bold text-primary">
            {items.length} {t("search.results")}
          </span>
          <button
            onClick={() => setFilters({ ...defaultFilters })}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("search.reset")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {items.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          {t("properties.noResults")}
        </p>
      )}
    </section>
  );
}
