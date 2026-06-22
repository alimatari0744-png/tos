import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  regions,
  citiesByRegion,
  productTypesByUsage,
  type Desire,
  type Usage,
} from "@/data/catalog";
import { useLanguage } from "@/i18n/LanguageContext";

const usageOptionsForm: Usage[] = ["residential", "commercial"];

interface FormState {
  desire: Desire;
  usage: Usage;
  typeId: string;
  regionId: string;
  cityId: string;
  budget: string;
  name: string;
  phone: string;
  message: string;
}

const initial: FormState = {
  desire: "sale",
  usage: "residential",
  typeId: "",
  regionId: "",
  cityId: "",
  budget: "",
  name: "",
  phone: "",
  message: "",
};

export function RequestPropertyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState<FormState>(initial);
  const [touched, setTouched] = useState(false);

  const products = useMemo(
    () => productTypesByUsage(form.usage),
    [form.usage],
  );
  const cities = useMemo(
    () => (form.regionId ? citiesByRegion(form.regionId) : []),
    [form.regionId],
  );

  const phoneValid = /^5\d{8}$/.test(form.phone);
  const nameValid = form.name.trim().length > 0;
  const canSubmit = nameValid && phoneValid;

  const set = (patch: Partial<FormState>) =>
    setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("property_requests").insert({
      name: form.name.trim(),
      phone: `+966${form.phone}`,
      budget: form.budget,
      message: form.message,
      details: {
        desire: form.desire,
        usage: form.usage,
        typeId: form.typeId,
        regionId: form.regionId,
        cityId: form.cityId,
      },
    });

    if (error) {
      toast.error(t("form.error") ?? "حدث خطأ، حاول مرة أخرى");
      return;
    }

    toast.success(t("form.success"));
    setForm(initial);
    setTouched(false);
    onOpenChange(false);
  };


  const selectCls =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary";
  const labelCls = "mb-1.5 block text-xs font-bold text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" dir={lang === "ar" ? "rtl" : "ltr"}>
        <DialogHeader className="text-start">
          <DialogTitle className="text-2xl font-black">{t("form.title")}</DialogTitle>
          <DialogDescription>{t("form.subtitle")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Request details */}
          <div className="space-y-4 rounded-2xl border border-border p-4">
            <h3 className="text-sm font-black text-primary">{t("form.sectionRequest")}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t("form.desire")}</label>
                <select
                  className={selectCls}
                  value={form.desire}
                  onChange={(e) => set({ desire: e.target.value as Desire })}
                >
                  <option value="sale">{t("form.buy")}</option>
                  <option value="rent">{t("form.rent")}</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>{t("form.usage")}</label>
                <select
                  className={selectCls}
                  value={form.usage}
                  onChange={(e) =>
                    set({ usage: e.target.value as Usage, typeId: "" })
                  }
                >
                  {usageOptionsForm.map((u) => (
                    <option key={u} value={u}>
                      {u === "residential"
                        ? lang === "ar"
                          ? "سكني"
                          : "Residential"
                        : lang === "ar"
                          ? "تجاري"
                          : "Commercial"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>{t("form.product")}</label>
              <select
                className={selectCls}
                value={form.typeId}
                onChange={(e) => set({ typeId: e.target.value })}
              >
                <option value="">{t("form.select")}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label[lang]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t("form.region")}</label>
                <select
                  className={selectCls}
                  value={form.regionId}
                  onChange={(e) =>
                    set({ regionId: e.target.value, cityId: "" })
                  }
                >
                  <option value="">{t("form.select")}</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label[lang]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t("form.city")}</label>
                <select
                  className={selectCls}
                  value={form.cityId}
                  disabled={!form.regionId}
                  onChange={(e) => set({ cityId: e.target.value })}
                >
                  <option value="">{t("form.select")}</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>{t("form.budget")}</label>
              <input
                type="text"
                inputMode="numeric"
                className={selectCls}
                value={form.budget}
                onChange={(e) =>
                  set({ budget: e.target.value.replace(/[^0-9]/g, "") })
                }
                placeholder="0"
              />
            </div>
          </div>

          {/* Contact details */}
          <div className="space-y-4 rounded-2xl border border-border p-4">
            <h3 className="text-sm font-black text-primary">{t("form.sectionContact")}</h3>


            <div>
              <label className={labelCls}>
                {t("form.name")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                className={selectCls}
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
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
                  className={selectCls}
                  value={form.phone}
                  onChange={(e) =>
                    set({ phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 9) })
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

            <div>
              <label className={labelCls}>{t("form.message")}</label>
              <textarea
                className={`${selectCls} min-h-[90px] resize-y`}
                value={form.message}
                onChange={(e) => set({ message: e.target.value })}
                placeholder={t("form.messagePlaceholder")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="gradient-primary w-full rounded-full py-3 text-base font-bold text-primary-foreground shadow-card transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("form.submit")}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
