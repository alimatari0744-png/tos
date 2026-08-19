import { Link } from "@tanstack/react-router";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSettings, whatsappNumber } from "@/lib/site-data";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  const { t, lang } = useLanguage();
  const { data: settings } = useSettings();
  const phone = settings?.contact_phone?.trim();
  const email = settings?.contact_email?.trim();
  const wa = whatsappNumber(settings);
  const footerText = (lang === "ar" ? settings?.footer_text_ar : settings?.footer_text_en)?.trim();

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex justify-center">
          <BrandLogo variant="wide" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Contact — start (right in RTL) */}
          <div className="text-center sm:text-start">
            <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-foreground">
              {t("footer.contactTitle")}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                {phone ? (
                  <a href={`tel:${phone}`} className="hover:text-primary" dir="ltr">
                    {phone}
                  </a>
                ) : (
                  <span>{t("footer.soon")}</span>
                )}
              </li>
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                {email ? (
                  <a href={`mailto:${email}`} className="hover:text-primary" dir="ltr">
                    {email}
                  </a>
                ) : (
                  <span>{t("footer.soon")}</span>
                )}
              </li>
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                  dir="ltr"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Important links — end (left in RTL) */}
          <div className="text-center sm:text-end">
            <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-foreground">
              {lang === "ar" ? "روابط مهمة" : "Important"}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/terms" className="transition-colors hover:text-primary">
                  {lang === "ar" ? "شروط الاستخدام" : "Terms of Use"}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-primary">
                  {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {footerText && (
          <p className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            {footerText}
          </p>
        )}
      </div>
    </footer>
  );
}
