import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PropertiesSection } from "@/components/PropertiesSection";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { RequestPropertyDialog } from "@/components/RequestPropertyDialog";
import { AppTour } from "@/components/AppTour";
import { useProperties, usePropertyTypes } from "@/lib/site-data";
import { applyFilters, defaultFilters, type Filters } from "@/lib/filters";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مكتب طوس العقارية | Tawoos Real Estate Office" },
      {
        name: "description",
        content:
          "مكتب طوس العقارية — اكتشف أفضل العروض العقارية في المملكة العربية السعودية من فلل وأراضٍ وشقق ومشاريع استثمارية.",
      },
      { property: "og:title", content: "مكتب طوس العقارية" },
      {
        property: "og:description",
        content: "اكتشف أفضل العروض العقارية في المملكة العربية السعودية.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [requestOpen, setRequestOpen] = useState(false);
  const { data: properties = [] } = useProperties();
  const { data: types = [] } = usePropertyTypes();

  const filtered = useMemo(() => applyFilters(properties, filters), [properties, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onRequest={() => setRequestOpen(true)} />
      <main>
        <Hero onRequest={() => setRequestOpen(true)} />
        <PropertiesSection
          items={filtered}
          allItems={properties}
          types={types}
          filters={filters}
          setFilters={setFilters}
        />
      </main>
      <Footer />
      <WhatsAppButton />
      <RequestPropertyDialog open={requestOpen} onOpenChange={setRequestOpen} />
      <AppTour />
    </div>
  );
}
