import { useEffect, useRef } from "react";

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

export function LocationPicker({
  lat,
  lng,
  fallback = [24.7136, 46.6753],
  onChange,
  height = "320px",
}: {
  lat?: number | null;
  lng?: number | null;
  fallback?: [number, number];
  onChange: (lat: number, lng: number) => void;
  height?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current) return;
      const hasPoint = typeof lat === "number" && typeof lng === "number";
      const center: [number, number] = hasPoint ? [lat as number, lng as number] : fallback;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current).setView(center, hasPoint ? 14 : 6);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 18,
        }).addTo(mapRef.current);

        mapRef.current.on("click", (e: any) => {
          const { lat: la, lng: ln } = e.latlng;
          placeMarker(L, la, ln);
          onChange(Number(la.toFixed(6)), Number(ln.toFixed(6)));
        });
      }
      if (hasPoint) placeMarker(L, lat as number, lng as number);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeMarker(L: any, la: number, ln: number) {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([la, ln]);
    } else {
      markerRef.current = L.marker([la, ln], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current.getLatLng();
        onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      });
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-xl border border-border"
      style={{ zIndex: 0, height }}
    />
  );
}
