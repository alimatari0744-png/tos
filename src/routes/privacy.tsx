import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSettings } from "@/lib/site-data";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية | ثقة الإعمار" },
      { name: "description", content: "سياسة الخصوصية لموقع ثقة الإعمار للخدمات العقارية." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useLanguage();
  const { data: settings } = useSettings();
  const content = (lang === "ar" ? settings?.privacy_ar : settings?.privacy_en)?.trim();

  return (
    <div className="min-h-screen bg-background" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar onRequest={() => {}} />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-6 text-3xl font-black text-foreground">
          {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        {content ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/80">
            {content}
          </div>
        ) : (
          <p className="text-muted-foreground">
            {lang === "ar" ? "لا يوجد محتوى بعد." : "No content yet."}
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
