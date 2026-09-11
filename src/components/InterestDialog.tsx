import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/LanguageContext";

export function InterestDialog({
  open,
  onOpenChange,
  propertyRef,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  propertyRef?: string;
}) {
  const { t, lang } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  const phoneValid = /^5\d{8}$/.test(phone);
  const nameValid = name.trim().length > 0;
  const canSubmit = nameValid && phoneValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    const { localDb } = await import("@/lib/local-db");
    const { error } = await localDb.from("property_interests").insert({
      name: name.trim(),
      phone: `+966${phone}`,
      property_ref: propertyRef ?? null,
    });

    if (error) {
      toast.error("حدث خطأ، حاول مرة أخرى");
      return;
    }

    toast.success(t("interest.success"));
    setName("");
    setPhone("");
    setTouched(false);
    onOpenChange(false);
  };


  const inputCls =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary";
  const labelCls = "mb-1.5 block text-xs font-bold text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={lang === "ar" ? "rtl" : "ltr"}>
        <DialogHeader className="text-start">
          <DialogTitle className="text-2xl font-black">{t("interest.title")}</DialogTitle>
          <DialogDescription>{t("interest.subtitle")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>
              {t("form.name")} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("form.namePlaceholder")}
            />
            {touched && !nameValid && (
              <p className="mt-1 text-xs font-semibold text-destructive">
                {t("form.errName")}
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>
              {t("form.phone")} <span className="text-destructive">*</span>
            </label>
            <div className="flex items-stretch gap-2" dir="ltr">
              <span className="flex items-center rounded-xl border border-border bg-secondary px-3 text-sm font-bold text-foreground">
                +966
              </span>
              <input
                type="tel"
                inputMode="numeric"
                className={inputCls}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 9))
                }
                placeholder="5XXXXXXXX"
              />
            </div>
            {touched && !phoneValid && (
              <p className="mt-1 text-xs font-semibold text-destructive">
                {t("form.errPhone")}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="gradient-primary w-full rounded-full py-3 text-base font-bold text-primary-foreground shadow-card transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("interest.submit")}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
