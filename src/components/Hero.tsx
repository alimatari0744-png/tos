import heroBg from "@/assets/hero-bg.jpg";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSettings } from "@/lib/site-data";

export function Hero({ onRequest }: { onRequest: () => void }) {
  const { t, lang } = useLanguage();
  const { data: settings } = useSettings();

  const heroImage = settings?.hero_image || heroBg;
  const title =
    (lang === "ar" ? settings?.hero_title_ar : settings?.hero_title_en) || t("hero.title");
  const subtitle =
    (lang === "ar" ? settings?.hero_subtitle_ar : settings?.hero_subtitle_en) ||
    t("hero.subtitle");

  return (
    <section id="home" className="relative isolate overflow-hidden">
      <img
        src={heroImage}
        alt={t("hero.badge")}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
      />
      <div className="gradient-hero-overlay absolute inset-0 -z-10" />

      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <span className="mb-5 rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur">
          {t("hero.badge")}
        </span>
        <h1 className="max-w-3xl text-4xl font-black leading-tight text-foreground sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#properties"
            className="gradient-primary rounded-full px-7 py-3 text-base font-bold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
          >
            {t("hero.explore")}
          </a>
          <button
            onClick={onRequest}
            className="rounded-full border border-border bg-background/80 px-7 py-3 text-base font-bold text-foreground backdrop-blur transition-colors hover:bg-secondary"
          >
            {t("nav.requestCta")}
          </button>
        </div>
      </div>
    </section>
  );
}
