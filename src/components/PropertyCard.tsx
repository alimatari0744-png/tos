import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type Property,
  formatPrice,
  propertyTitle,
  propertyLocation,
} from "@/data/properties";
import { desireLabels } from "@/data/catalog";
import { useLanguage } from "@/i18n/LanguageContext";

export function PropertyCard({ property }: { property: Property }) {
  const { t, lang } = useLanguage();
  const isSold = property.status === "sold";
  const title = propertyTitle(property, lang);

  const gallery =
    property.images && property.images.length ? property.images : [property.image];
  const [index, setIndex] = useState(0);
  const dragStart = useState<{ x: number } | null>(null);
  const startX = dragStart[0];
  const setStartX = dragStart[1];

  const move = (dir: number) =>
    setIndex((i) => (i + dir + gallery.length) % gallery.length);

  const go = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    move(dir);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (gallery.length < 2) return;
    setStartX({ x: e.clientX });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!startX) return;
    const dx = e.clientX - startX.x;
    setStartX(null);
    if (Math.abs(dx) > 40) {
      e.preventDefault();
      // RTL-friendly: drag right -> previous, drag left -> next
      move(dx > 0 ? -1 : 1);
    }
  };

  return (
    <Link
      to="/properties/$id"
      params={{ id: property.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-transform duration-300 hover:-translate-y-1"
    >
      <article>
        <div
          className="relative aspect-[4/3] touch-pan-y select-none overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {gallery.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={title}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              width={800}
              height={600}
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                i === index ? "opacity-100" : "opacity-0"
              } ${i === index ? "group-hover:scale-105" : ""} transition-transform`}
            />
          ))}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="prev"
                onClick={(e) => go(e, -1)}
                className="absolute start-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow-card transition-colors hover:bg-background"
              >
                <ChevronRight className="h-4 w-4 rtl:hidden" />
                <ChevronLeft className="hidden h-4 w-4 rtl:block" />
              </button>
              <button
                type="button"
                aria-label="next"
                onClick={(e) => go(e, 1)}
                className="absolute end-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow-card transition-colors hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4 rtl:hidden" />
                <ChevronRight className="hidden h-4 w-4 rtl:block" />
              </button>
              <div className="absolute bottom-2 start-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                {gallery.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-4 bg-primary-foreground" : "w-1.5 bg-primary-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <span className="absolute start-3 top-3 z-10 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-foreground shadow-card">
            {desireLabels[property.desire][lang]}
          </span>
          <span
            className={`absolute end-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-bold text-primary-foreground ${
              isSold ? "bg-destructive" : "bg-emerald-600"
            }`}
          >
            {isSold ? t("properties.sold") : t("properties.available")} · #
            {property.ref}
          </span>
          {isSold && (
            <span className="absolute start-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-md border-4 border-destructive bg-background/80 px-6 py-2 text-2xl font-black text-destructive">
              {t("properties.soldStamp")}
            </span>
          )}
        </div>
        <div className="space-y-2 p-5">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {propertyLocation(property, lang)}
          </p>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-muted-foreground">
              {formatPrice(property.area)} {t("properties.areaUnit")}
            </span>
            <span className="text-lg font-black text-primary">
              {formatPrice(property.price)} {t("properties.currency")}
              {property.desire === "rent" ? t("properties.perYear") : ""}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
