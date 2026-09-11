import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LogoMark } from "@/components/BrandLogo";

const STORAGE_KEY = "tawoos-tour-seen-v1";

const STEPS = [
  { id: null, title: "tour.welcomeTitle", body: "tour.welcomeBody" },
  { id: "search", title: "tour.searchTitle", body: "tour.searchBody" },
  { id: "listings", title: "tour.listingsTitle", body: "tour.listingsBody" },
  { id: "request", title: "tour.requestTitle", body: "tour.requestBody" },
  { id: "whatsapp", title: "tour.whatsappTitle", body: "tour.whatsappBody" },
  { id: null, title: "tour.finishTitle", body: "tour.finishBody" },
] as const;

type Rect = { top: number; left: number; width: number; height: number };

function measure(id: string | null): Rect | null {
  if (!id || typeof document === "undefined") return null;
  const root = document.querySelector(`[data-tour="${id}"]`);
  if (!root) return null;
  const el =
    id === "listings" ? (root.querySelector("a, article") as HTMLElement | null) ?? root : root;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return null;
  const pad = 8;
  return {
    top: r.top - pad,
    left: r.left - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  };
}

export function AppTour() {
  const { t, dir } = useLanguage();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setActive(false);
  }, []);

  const go = useCallback(
    (next: number) => {
      if (next >= STEPS.length) {
        finish();
        return;
      }
      if (next < 0) return;
      const target = STEPS[next].id;
      if (target) {
        const el = document.querySelector(`[data-tour="${target}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        window.setTimeout(() => setRect(measure(target)), 380);
      } else {
        setRect(null);
      }
      setStep(next);
    },
    [finish],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const start = window.setTimeout(() => {
      setActive(true);
      setStep(0);
      setRect(null);
    }, 700);
    return () => window.clearTimeout(start);
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = STEPS[step].id;
    const root = id ? document.querySelector(`[data-tour="${id}"]`) : null;
    const el = (
      id === "listings" ? root?.querySelector("a, article") ?? root : root
    ) as HTMLElement | null;
    const update = () => setRect(measure(id));
    update();
    const prevZ = el?.style.zIndex;
    const prevPos = el?.style.position;
    if (el) {
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.style.zIndex = "90";
    }
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      if (el) {
        el.style.zIndex = prevZ ?? "";
        el.style.position = prevPos ?? "";
      }
    };
  }, [active, step]);

  if (!active) return null;

  const last = step === STEPS.length - 1;
  const current = STEPS[step];
  const tooltipStyle = tooltipPosition(rect, dir, last);

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {!rect && <div className="absolute inset-0 bg-foreground/55" />}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-2xl border-2 border-primary shadow-[0_0_0_9999px_rgba(15,23,42,0.55)] ring-4 ring-primary/25"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}
      <div
        className="absolute z-[81] w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-border bg-card p-5 text-start shadow-elegant"
        style={tooltipStyle}
      >
        {last ? (
          <div className="mb-3 flex justify-center">
            <LogoMark className="h-20 w-20" />
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-primary">
            {t("tour.step")} {step + 1} / {STEPS.length}
          </p>
          {last ? (
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-black text-primary">
              {t("tour.lastSlide")}
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-5 bg-primary" : i < step ? "w-3 bg-primary/50" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
        <h2 id="tour-title" className="mt-3 text-lg font-black text-foreground">
          {t(current.title)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(current.body)}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          {last ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={finish}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              {t("tour.skip")}
            </button>
          )}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => go(step - 1)}
                className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary"
              >
                {t("tour.back")}
              </button>
            )}
            <button
              type="button"
              onClick={() => go(step + 1)}
              className="gradient-primary rounded-full px-5 py-2 text-sm font-bold text-primary-foreground"
            >
              {last ? t("tour.done") : t("tour.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function tooltipPosition(rect: Rect | null, dir: "rtl" | "ltr", last: boolean): CSSProperties {
  const width = Math.min(352, typeof window !== "undefined" ? window.innerWidth - 24 : 352);
  if (!rect || last) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width,
    };
  }
  const gap = 14;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const placeBelow = rect.top + rect.height / 2 < vh / 2;
  let top = placeBelow ? rect.top + rect.height + gap : rect.top - gap;
  let left = dir === "rtl" ? rect.left + rect.width - width : rect.left;
  left = Math.max(12, Math.min(left, vw - width - 12));
  const estimatedHeight = 230;
  if (placeBelow && top + estimatedHeight > vh - 12) {
    top = Math.max(12, rect.top - estimatedHeight - gap);
  }
  if (!placeBelow) {
    top = Math.max(12, top - estimatedHeight);
  }
  return { top, left, width };
}
