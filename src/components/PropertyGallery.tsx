import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function PropertyGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: ReactNode;
}) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  const count = images.length;
  const current = images[Math.min(active, Math.max(count - 1, 0))] ?? images[0];

  const move = (dir: number) => {
    if (count < 2) return;
    setActive((i) => (i + dir + count) % count);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    swiped.current = false;
    if (count < 2) return;
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const origin = startX.current;
    startX.current = null;
    if (origin == null) return;
    const dx = e.clientX - origin;
    if (Math.abs(dx) > 40) {
      swiped.current = true;
      move(dx > 0 ? -1 : 1);
    }
  };

  const onMainClick = () => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") move(1);
      if (e.key === "ArrowRight") move(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, count]);

  return (
    <>
      <div className="grid gap-3">
        <div
          className="relative aspect-[4/3] cursor-zoom-in touch-pan-y select-none overflow-hidden rounded-3xl border border-border"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            startX.current = null;
          }}
          onClick={onMainClick}
        >
          {images.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt={alt}
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {badge}
          {count > 1 && (
            <div className="absolute bottom-3 start-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-5 bg-primary-foreground" : "w-1.5 bg-primary-foreground/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {open && current && (
        <div
          className="fixed inset-0 z-[90] flex flex-col bg-foreground/90"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label={t("detail.closeGallery")}
            onClick={() => setOpen(false)}
            className="absolute end-4 top-4 z-10 rounded-full bg-background/90 p-2 text-foreground shadow-card"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="flex min-h-0 flex-1 items-center justify-center px-4 py-16"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              startX.current = null;
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current}
              alt={alt}
              draggable={false}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
          </div>
          {count > 1 && (
            <div className="flex justify-center gap-1.5 pb-8" onClick={(e) => e.stopPropagation()}>
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === active ? "w-6 bg-background" : "w-2 bg-background/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
