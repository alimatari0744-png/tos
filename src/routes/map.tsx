import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapSection } from "@/components/MapSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { RequestPropertyDialog } from "@/components/RequestPropertyDialog";
import { SearchFilters } from "@/components/SearchFilters";
import { useProperties } from "@/lib/site-data";
import { useLanguage } from "@/i18n/LanguageContext";
import { applyFilters, defaultFilters, type Filters } from "@/lib/filters";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "الخريطة العقارية | ثقة وإعمار" },
      {
        name: "description",
        content:
          "خريطة عروض ثقة وإعمار العقارية — تصفح مواقع العقارات المتاحة في المملكة العربية السعودية.",
      },
      { property: "og:title", content: "الخريطة العقارية | ثقة وإعمار" },
      {
        property: "og:description",
        content: "تصفح مواقع عروض ثقة وإعمار العقارية على الخريطة.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { t } = useLanguage();
  const [requestOpen, setRequestOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters });
  const { data: properties = [] } = useProperties();

  const filtered = useMemo(() => applyFilters(properties, filters), [properties, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onRequest={() => setRequestOpen(true)} />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 text-start">
          <h1 className="text-3xl font-black text-foreground sm:text-4xl">
            {t("map.pageTitle")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("map.pageSubtitle")}</p>
        </div>

        {/* Search bar to narrow the map results */}
        <div className="mb-6 rounded-3xl border border-border bg-secondary/30 p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-black text-foreground">{t("search.title")}</h3>
          <SearchFilters filters={filters} setFilters={setFilters} countItems={properties} />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-bold text-primary">
              {filtered.length} {t("search.results")}
            </span>
            <button
              onClick={() => setFilters({ ...defaultFilters })}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("search.reset")}
            </button>
          </div>
        </div>

        <MapSection items={filtered} height="70vh" />
      </main>
      <Footer />
      <WhatsAppButton />
      <RequestPropertyDialog open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
