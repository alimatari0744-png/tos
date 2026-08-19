import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapSection } from "@/components/MapSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { RequestPropertyDialog } from "@/components/RequestPropertyDialog";
import { InterestDialog } from "@/components/InterestDialog";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGallery } from "@/components/PropertyGallery";
import {
  propertyImages,
  propertyTitle,
  propertyLocation,
  propertyRegion,
  propertyLicense,
  formatPrice,
  type Property,
} from "@/data/properties";
import {
  getCity,
  usageLabels,
  type Usage,
} from "@/data/catalog";
import { useProperty, useProperties, useSettings, whatsappNumber } from "@/lib/site-data";
import { recordContact } from "@/lib/leads";

import { useLanguage } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/properties/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل العقار | ثقة الإعمار" },
      {
        name: "description",
        content: "تفاصيل العقار وعروض ثقة الإعمار العقارية في المملكة العربية السعودية.",
      },
      { property: "og:title", content: "تفاصيل العقار | ثقة الإعمار" },
    ],
  }),
  component: PropertyDetail,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      {error.message}
    </div>
  ),
});

function computeSimilar(p: Property, all: Property[], count = 3): Property[] {
  return all
    .filter((x) => x.id !== p.id)
    .map((x) => {
      let score = 0;
      if (x.typeId === p.typeId) score += 4;
      if (x.usage === p.usage) score += 2;
      if (x.cityId === p.cityId) score += 2;
      if (x.desire === p.desire) score += 1;
      return { x, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.x);
}

function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <p className="text-lg font-bold text-foreground">{t("detail.notFound")}</p>
      <Link to="/" hash="properties" className="text-primary underline">
        {t("detail.back")}
      </Link>
    </div>
  );
}


function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xl font-black text-foreground">{children}</h2>
  );
}

function PropertyDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useLanguage();
  const { data: property, isLoading } = useProperty(id);
  const { data: allProperties = [] } = useProperties();
  const { data: settings } = useSettings();
  const [requestOpen, setRequestOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        …
      </div>
    );
  }
  if (!property) return <NotFound />;

  const images = propertyImages(property);
  const title = propertyTitle(property, lang);
  const city = getCity(property.cityId);
  const district = city?.districts.find((d) => d.id === property.districtId);
  const isSold = property.status === "sold";
  const similar = computeSimilar(property, allProperties);


  // Basic specs (medium elegant cards)
  const basicSpecs: { label: string; value: string }[] = [
    {
      label: t("detail.area"),
      value: `${formatPrice(property.area)} ${t("properties.areaUnit")}`,
    },
  ];
  if (property.bedrooms != null)
    basicSpecs.push({ label: t("detail.bedrooms"), value: String(property.bedrooms) });
  if (property.bathrooms != null)
    basicSpecs.push({ label: t("detail.bathrooms"), value: String(property.bathrooms) });
  if (property.livingRooms != null)
    basicSpecs.push({ label: t("detail.livingRooms"), value: String(property.livingRooms) });
  if (property.age != null)
    basicSpecs.push({
      label: t("detail.age"),
      value: property.age === 0 ? t("detail.ageNew") : `${property.age} ${t("detail.years")}`,
    });

  const services = ["service.electricity", "service.water", "service.sewage"];

  const features = [
    "feature.finishing",
    "feature.parking",
    "feature.security",
    "feature.location",
    "feature.services",
    "feature.ac",
  ];

  // Characteristics
  const characteristics: { label: string; value: string }[] = [];
  if (property.street != null)
    characteristics.push({
      label: t("detail.streetEast"),
      value: `${property.street} ${t("detail.meter")}`,
    });
  if (property.streetWest != null)
    characteristics.push({
      label: t("detail.streetWest"),
      value: `${property.streetWest} ${t("detail.meter")}`,
    });
  characteristics.push({
    label: t("detail.region"),
    value: propertyRegion(property, lang),
  });
  characteristics.push({
    label: t("detail.district"),
    value: district?.label[lang] ?? "",
  });

  const mapsUrl = city
    ? `https://www.google.com/maps/search/?api=1&query=${city.lat},${city.lng}`
    : "https://www.google.com/maps";

  return (
    <div className="min-h-screen bg-background">
      <Navbar onRequest={() => setRequestOpen(true)} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          hash="properties"
          className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          ← {t("detail.back")}
        </Link>

        {/* Top: gallery (right) + summary specs (left) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PropertyGallery
            images={images}
            alt={title}
            badge={
              <span
                className={`absolute end-4 top-4 z-10 rounded-full px-4 py-1.5 text-sm font-bold text-primary-foreground ${
                  isSold ? "bg-destructive" : "bg-emerald-600"
                }`}
              >
                {isSold ? t("properties.sold") : t("properties.available")}
              </span>
            }
          />

          {/* Summary — title, price, key specs, contact */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-foreground sm:text-3xl">{title}</h1>
            <p className="mt-2 text-muted-foreground">
              {propertyLocation(property, lang)}
            </p>
            <p className="mt-4 text-3xl font-black text-primary">
              {formatPrice(property.price)} {t("properties.currency")}
              {property.desire === "rent" ? t("properties.perYear") : ""}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {basicSpecs.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border bg-card px-3 py-3 text-center shadow-card"
                >
                  <p className="text-lg font-black text-foreground">{s.value}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              <a
                href={`https://wa.me/${whatsappNumber(settings)}?text=${encodeURIComponent(
                  `${title} - #${property.ref}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void recordContact({ source: "whatsapp", propertyRef: property.ref })}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-card transition-transform hover:scale-[1.02]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.027zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                {t("detail.contactWhatsapp")}
              </a>
              <button
                onClick={() => setInterestOpen(true)}
                className="gradient-primary flex-1 rounded-full px-6 py-3 text-sm font-bold text-primary-foreground shadow-card transition-transform hover:scale-[1.02]"
              >
                {t("detail.registerInterest")}
              </button>
            </div>
          </div>
        </div>



        {/* 2. Services */}
        <section className="mt-10">
          <SectionTitle>{t("detail.sectionServices")}</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm font-semibold text-foreground/80"
              >
                {t(s)}
              </span>
            ))}
          </div>
        </section>

        {/* 3. Usage */}
        <section className="mt-10">
          <SectionTitle>{t("detail.sectionUsage")}</SectionTitle>
          <span className="inline-block rounded-full bg-primary/10 px-5 py-2 text-sm font-bold text-primary">
            {usageLabels[property.usage as Usage][lang]}
          </span>
        </section>

        {/* 4. Unit features + description */}
        <section className="mt-10">
          <SectionTitle>{t("detail.sectionUnitFeatures")}</SectionTitle>
          <div className="mb-4 flex flex-wrap gap-2">
            {features.map((f) => (
              <span
                key={f}
                className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm font-semibold text-foreground/80"
              >
                {t(f)}
              </span>
            ))}
          </div>
          <p className="leading-relaxed text-muted-foreground">
            {property.description?.[lang] ?? t("detail.descGeneric")}
          </p>
        </section>

        {/* 5. Characteristics */}
        <section className="mt-10">
          <SectionTitle>{t("detail.sectionCharacteristics")}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {characteristics.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
              >
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="text-sm font-bold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Listing information + map */}
        <section className="mt-10">
          <SectionTitle>{t("detail.sectionAdInfo")}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <span className="text-sm text-muted-foreground">{t("detail.ref")}</span>
              <span className="text-sm font-bold text-foreground">#{property.ref}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <span className="text-sm text-muted-foreground">{t("detail.license")}</span>
              <span className="text-sm font-bold text-foreground">
                {propertyLicense(property)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-base font-black text-foreground">
              {t("detail.locationTitle")}
            </h3>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {t("detail.viewOnMap")}
            </a>
          </div>
          <div className="mt-3">
            <MapSection items={[property]} height="360px" />
          </div>
        </section>

        {/* 7. Similar properties */}
        {similar.length > 0 && (
          <section className="mt-12">
            <SectionTitle>{t("detail.similar")}</SectionTitle>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
      <RequestPropertyDialog open={requestOpen} onOpenChange={setRequestOpen} />
      <InterestDialog
        open={interestOpen}
        onOpenChange={setInterestOpen}
        propertyRef={property.ref}
      />
    </div>
  );
}
