import { type ProductType } from "@/data/catalog";
import { type Property } from "@/data/properties";
import { useLanguage } from "@/i18n/LanguageContext";
import { type Filters } from "@/lib/filters";
import { PropertyCard } from "./PropertyCard";
import { SearchFilters } from "./SearchFilters";

export function PropertiesSection({
  items,
  allItems,
  types: _types,
  filters,
  setFilters,
}: {
  items: Property[];
  allItems?: Property[];
  types?: ProductType[];
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const { t } = useLanguage();

  return (
    <section id="properties" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-start">
        <h2 className="text-3xl font-black text-foreground sm:text-4xl">
          {t("properties.title")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("properties.subtitle")}</p>
      </div>

      <div className="mb-8">
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          countItems={allItems ?? items}
          resultCount={items.length}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-tour="listings">
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
