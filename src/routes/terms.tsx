import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSettings } from "@/lib/site-data";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "شروط الاستخدام | مكتب طوس العقارية" },
      { name: "description", content: "شروط استخدام موقع مكتب طوس العقارية." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { lang } = useLanguage();
  const { data: settings } = useSettings();
  const content = (lang === "ar" ? settings?.terms_ar : settings?.terms_en)?.trim();

  return (
    <div className="min-h-screen bg-background" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar onRequest={() => {}} />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-6 text-3xl font-black text-foreground">
          {lang === "ar" ? "شروط الاستخدام" : "Terms of Use"}
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
