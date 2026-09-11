import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { BrandLogo } from "@/components/BrandLogo";
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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 overflow-visible px-4 sm:px-6">
        <div className="flex min-w-0 items-center">
          <BrandLogo variant="auto" />
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
            to="/"
            hash="properties"
            className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
          >
            {t("nav.properties")}
          </Link>
          <Link
            to="/map"
            className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
          >
            {t("nav.map")}
          </Link>
          <button
            onClick={onRequest}
            className="gradient-primary rounded-full px-5 py-2 text-sm font-bold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
          >
            {t("nav.requestCta")}
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageButton />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex items-center justify-center rounded-md border border-border p-2 text-foreground md:hidden"
                aria-label="القائمة"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-64 flex-col items-center sm:w-72">
              <SheetHeader className="w-full items-center space-y-3 pt-8 text-center">
                <SheetTitle className="sr-only">القائمة</SheetTitle>
                <BrandLogo variant="wide" className="justify-center" onClick={() => setOpen(false)} />
              </SheetHeader>
              <nav className="mt-8 flex w-full flex-col items-center gap-1">
                <SheetClose asChild>
                  <Link
                    to="/"
                    className="w-full rounded-lg px-4 py-3 text-center text-base font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                  >
                    {t("nav.home")}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/"
                    hash="properties"
                    className="w-full rounded-lg px-4 py-3 text-center text-base font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                  >
                    {t("nav.properties")}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/map"
                    className="w-full rounded-lg px-4 py-3 text-center text-base font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                  >
                    {t("nav.map")}
                  </Link>
                </SheetClose>
                <button
                  onClick={() => {
                    setOpen(false);
                    onRequest();
                  }}
                  className="gradient-primary mt-4 w-full rounded-full px-5 py-3 text-center text-base font-bold text-primary-foreground shadow-card"
                >
                  {t("nav.requestCta")}
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
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
