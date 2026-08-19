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
      { title: "الخريطة العقارية | ثقة الإعمار" },
      {
        name: "description",
        content:
          "خريطة عروض ثقة الإعمار العقارية — تصفح مواقع العقارات المتاحة في المملكة العربية السعودية.",
      },
      { property: "og:title", content: "الخريطة العقارية | ثقة الإعمار" },
      {
        property: "og:description",
        content: "تصفح مواقع عروض ثقة الإعمار العقارية على الخريطة.",
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

        <div className="mb-6">
          <SearchFilters
            filters={filters}
            setFilters={setFilters}
            countItems={properties}
            resultCount={filtered.length}
          />
        </div>

        <MapSection items={filtered} height="70vh" />
      </main>
      <Footer />
      <WhatsAppButton />
      <RequestPropertyDialog open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
