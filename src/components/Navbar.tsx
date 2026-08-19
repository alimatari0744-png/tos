import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSettings } from "@/lib/site-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function Navbar({ onRequest }: { onRequest: () => void }) {
  const { t } = useLanguage();
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  const logoUrl = settings?.logo_image?.trim() || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Right (in RTL): mobile menu button + logo */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger — on the right */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex items-center justify-center rounded-md border border-border p-2 text-foreground md:hidden"
                aria-label="القائمة"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-48 sm:w-56">
              <SheetHeader>
                <SheetTitle className="text-right">القائمة</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                <SheetClose asChild>
                  <Link
                    to="/"
                    className="rounded-lg px-4 py-3 text-base font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                  >
                    {t("nav.home")}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/map"
                    className="rounded-lg px-4 py-3 text-base font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                  >
                    {t("nav.map")}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/"
                    hash="properties"
                    className="rounded-lg px-4 py-3 text-base font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                  >
                    {t("nav.properties")}
                  </Link>
                </SheetClose>
                <button
                  onClick={() => {
                    setOpen(false);
                    onRequest();
                  }}
                  className="gradient-primary mt-2 rounded-full px-5 py-3 text-base font-bold text-primary-foreground shadow-card"
                >
                  {t("nav.requestCta")}
                </button>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="منصة العقارات"
                className="h-16 w-auto"
              />
            ) : (
              <span className="sr-only">منصة العقارات</span>
            )}
          </Link>
        </div>


        {/* Center: nav links (desktop) */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/"
            className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
          >
            {t("nav.home")}
          </Link>
          <Link
            to="/map"
            className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
          >
            {t("nav.map")}
          </Link>
          <Link
            to="/"
            hash="properties"
            className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
          >
            {t("nav.properties")}
          </Link>
          <button
            onClick={onRequest}
            className="gradient-primary rounded-full px-5 py-2 text-sm font-bold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
          >
            {t("nav.requestCta")}
          </button>
        </nav>

        {/* Left (in RTL): language toggle */}
        <LanguageButton />

      </div>
    </header>
  );
}

function LanguageButton() {
  const { toggle, t } = useLanguage();
  return (
    <button
      onClick={toggle}
      className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      {t("nav.langToggle")}
    </button>
  );
}
