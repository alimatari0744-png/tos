import { useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  formatPrice,
  propertyTitle,
  propertyLocation,
  type Property,
} from "@/data/properties";
import { publicUrl } from "@/lib/public-url";
import { getCity } from "@/data/catalog";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

declare global {
  interface Window {
    L?: any;
  }
}

function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("no window");
    if (window.L) return resolve(window.L);

    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L));
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function MapSection({
  items,
  height = "420px",
}: {
  items: Property[];
  height?: string;
}) {
  const { t, lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView([23.8859, 45.0792], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 18,
        }).addTo(mapRef.current);
      }
      renderMarkers(L);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (window.L && mapRef.current) renderMarkers(window.L);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang]);

  function renderMarkers(L: any) {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];

    const latLngs: [number, number][] = [];
    items.forEach((p) => {
      let lat: number;
      let lng: number;
      if (typeof p.lat === "number" && typeof p.lng === "number") {
        lat = p.lat;
        lng = p.lng;
      } else {
        const city = getCity(p.cityId);
        if (!city) return;
        lat = city.lat + (Math.random() - 0.5) * 0.04;
        lng = city.lng + (Math.random() - 0.5) * 0.04;
      }
      const marker = L.marker([lat, lng]).addTo(mapRef.current);
      const viewLabel = t("map.viewOffer");
      marker.bindPopup(
        `<div style="font-family:Cairo,sans-serif;min-width:170px;text-align:${
          lang === "ar" ? "right" : "left"
        }">
          <strong style="font-size:14px">${propertyTitle(p, lang)}</strong><br/>
          <span style="color:#777">${propertyLocation(p, lang)}</span><br/>
          <span style="color:#c2410c;font-weight:700">${formatPrice(p.price)} ${
            lang === "ar" ? "ر.س" : "SAR"
          }</span><br/>
          <a href="${publicUrl(`/properties/${p.id}`)}" style="display:inline-block;margin-top:8px;background:#ea7317;color:#fff;padding:6px 14px;border-radius:9999px;font-weight:700;text-decoration:none;font-size:13px">${viewLabel}</a>
        </div>`,
      );
      markersRef.current.push(marker);
      latLngs.push([lat, lng]);
    });

    if (latLngs.length > 0) {
      mapRef.current.fitBounds(latLngs, { padding: [40, 40], maxZoom: 11 });
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-3xl border border-border shadow-card"
      style={{ zIndex: 0, height }}
    />
  );
}
