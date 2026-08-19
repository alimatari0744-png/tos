import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapAdmin } from "@/lib/admin.functions";
import {
  listStaff,
  createStaff,
  updateStaffPermissions,
  deleteStaff,
  ALL_PERMISSIONS,
} from "@/lib/staff.functions";
import { logActivity, diffChanges, parseDetails } from "@/lib/activity";
import { usageLabels, type Usage } from "@/data/catalog";
import { useGeo, useTaxonomy, mapProperty } from "@/lib/site-data";
import { LocationPicker } from "@/components/LocationPicker";
import heroBg from "@/assets/hero-bg.jpg";

const PROP_FIELD_LABELS: Record<string, string> = {
  ref: "رقم الإعلان",
  desire: "الغرض",
  usage: "الاستخدام",
  type_id: "نوع العقار",
  city_id: "المدينة",
  district_id: "الحي",
  area: "المساحة",
  price: "السعر",
  status: "الحالة",
  bedrooms: "غرف النوم",
  bathrooms: "دورات المياه",
  living_rooms: "غرف المعيشة",
  age: "عمر العقار",
  street: "عرض الشارع",
  street_west: "الشارع الغربي",
  license: "رقم الرخصة",
  description_ar: "الوصف (عربي)",
  description_en: "الوصف (إنجليزي)",
  images: "الصور",
};

const SETTINGS_FIELD_LABELS: Record<string, string> = {
  hero_image: "صورة الغلاف",
  logo_image: "الشعار",
  primary_color: "اللون الرئيسي",
  hero_title_ar: "العنوان (عربي)",
  hero_title_en: "العنوان (إنجليزي)",
  hero_subtitle_ar: "الوصف (عربي)",
  hero_subtitle_en: "الوصف (إنجليزي)",
  whatsapp_number: "رقم واتساب",
  contact_phone: "رقم الهاتف",
  contact_email: "البريد الإلكتروني",
  terms_ar: "شروط الاستخدام (عربي)",
  terms_en: "شروط الاستخدام (إنجليزي)",
  privacy_ar: "سياسة الخصوصية (عربي)",
  privacy_en: "سياسة الخصوصية (إنجليزي)",
  footer_text_ar: "نص التذييل (عربي)",
  footer_text_en: "نص التذييل (إنجليزي)",
};

const PERMISSION_LABELS: Record<string, string> = {
  properties: "العروض العقارية",
  taxonomy: "التصنيفات والأنواع",
  geo: "المناطق والأحياء",
  requests: "الطلبات",
  interests: "الاهتمامات",
  settings: "الإعدادات العامة",
};

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "لوحة التحكم | منصة العقارات" }] }),
  component: AdminPage,
});

const SIGNED_TEN_YEARS = 315360000;

async function uploadImage(folder: string, file: File): Promise<string | null> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from("site").upload(path, file, {
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) {
    toast.error("تعذّر رفع الصورة");
    return null;
  }
  const { data } = await supabase.storage.from("site").createSignedUrl(path, SIGNED_TEN_YEARS);
  return data?.signedUrl ?? null;
}

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary";
const labelCls = "mb-1.5 block text-xs font-bold text-muted-foreground";
const btnPrimary =
  "gradient-primary rounded-full px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition-transform hover:scale-[1.02] disabled:opacity-50";
const btnGhost =
  "rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary";

const AUTH_CHECK_TIMEOUT_MS = 3500;

function withTimeout<T>(promise: PromiseLike<T>, ms = AUTH_CHECK_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("auth-check-timeout")), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/* Styled file-picker button (with background) */
function FileButton({
  onPick,
  label = "اختيار ملف",
  className = "",
}: {
  onPick: (file: File) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground shadow-card transition-colors hover:bg-primary hover:text-primary-foreground ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
      {label}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("dashboard");

  async function refreshRole() {
    setChecking(true);
    try {
      const { data: userData } = await withTimeout(supabase.auth.getUser());
      const uid = userData.user?.id;
      if (!uid) {
        setIsAdmin(false);
        setPermissions([]);
        return;
      }
      const { data } = await withTimeout(
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid)
          .eq("role", "admin")
          .maybeSingle(),
      );
      const admin = !!data;
      setIsAdmin(admin);
      if (admin) {
        setPermissions([...ALL_PERMISSIONS]);
      } else {
        const { data: perms } = await withTimeout(
          supabase.from("staff_permissions").select("permission").eq("user_id", uid),
        );
        setPermissions((perms ?? []).map((p) => p.permission));
      }
    } catch {
      setIsAdmin(false);
      setPermissions([]);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    const fallback = setTimeout(() => setChecking(false), AUTH_CHECK_TIMEOUT_MS + 500);
    void refreshRole().finally(() => clearTimeout(fallback));
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => void refreshRole(), 0);
    });
    return () => {
      clearTimeout(fallback);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await bootstrapAdmin();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("بيانات الدخول غير صحيحة");
        return;
      }
      await refreshRole();
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setPermissions([]);
  }

  const hasAccess = isAdmin || permissions.length > 0;

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        …
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card"
        >
          <h1 className="text-center text-2xl font-black text-foreground">لوحة التحكم</h1>
          <p className="text-center text-sm text-muted-foreground">تسجيل دخول المسؤول</p>
          <div>
            <label className={labelCls}>البريد الإلكتروني</label>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              required
            />
          </div>
          <div>
            <label className={labelCls}>كلمة المرور</label>
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              required
            />
          </div>
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            {loading ? "..." : "دخول"}
          </button>
        </form>
      </div>
    );
  }

  const can = (perm: string) => isAdmin || permissions.includes(perm);
  const NAV = [
    { key: "dashboard", label: "لوحة المعلومات", show: true },
    { key: "settings", label: "الإعدادات العامة", show: can("settings") },
    { key: "properties", label: "العروض العقارية", show: can("properties") },
    { key: "taxonomy", label: "التصنيفات والأنواع", show: can("taxonomy") },
    { key: "geo", label: "المناطق والأحياء", show: can("geo") },
    { key: "requests", label: "الطلبات", show: can("requests") },
    { key: "interests", label: "الاهتمامات", show: can("interests") },
    { key: "staff", label: "الموظفون", show: isAdmin },
    { key: "activity", label: "سجل النشاط", show: isAdmin },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-black text-foreground">لوحة تحكم منصة العقارات</h1>
          <div className="flex items-center gap-2">
            <a href="/" className={btnGhost}>عرض الموقع</a>
            <button onClick={handleLogout} className={btnGhost}>خروج</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
        {/* Right-side navigation (RTL: first in DOM = right) */}
        <aside className="lg:w-60 lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible">
            {NAV.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-start text-sm font-bold transition-colors ${
                  tab === item.key
                    ? "gradient-primary text-primary-foreground shadow-card"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {tab === "dashboard" && <DashboardTab onNavigate={setTab} />}
          {tab === "settings" && can("settings") && <SettingsTab />}
          {tab === "properties" && can("properties") && <PropertiesTab />}
          {tab === "taxonomy" && can("taxonomy") && <TaxonomyTab />}
          {tab === "geo" && can("geo") && <GeoTab />}
          {tab === "requests" && can("requests") && <RequestsTab />}
          {tab === "interests" && can("interests") && <InterestsTab />}
          {tab === "staff" && isAdmin && <StaffTab />}
          {tab === "activity" && isAdmin && <ActivityTab />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function periodGrowth(dates: string[]) {
  const now = Date.now();
  const day = 86400000;
  const last30 = dates.filter((d) => now - new Date(d).getTime() <= 30 * day).length;
  const prev30 = dates.filter((d) => {
    const diff = now - new Date(d).getTime();
    return diff > 30 * day && diff <= 60 * day;
  }).length;
  let pct: number | null;
  if (prev30 === 0) pct = last30 > 0 ? 100 : 0;
  else pct = Math.round(((last30 - prev30) / prev30) * 100);
  return { last30, prev30, pct };
}

function StatCard({
  label, value, hint, growth, accent = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  growth?: { last30: number; pct: number | null };
  accent?: boolean;
}) {
  const up = growth ? (growth.pct ?? 0) >= 0 : true;
  return (
    <div className={`rounded-2xl border border-border p-5 shadow-card ${accent ? "gradient-primary text-primary-foreground" : "bg-card"}`}>
      <p className={`text-xs font-bold ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      {growth && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${accent ? "text-primary-foreground/90" : up ? "text-emerald-600" : "text-destructive"}`}>
          <span>{up ? "▲" : "▼"}</span>
          <span dir="ltr">{up ? "+" : ""}{growth.pct ?? 0}%</span>
          <span className={accent ? "text-primary-foreground/70" : "text-muted-foreground"}>آخر ٣٠ يوم ({growth.last30})</span>
        </div>
      )}
      {hint && !growth && (
        <p className={`mt-2 text-xs ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{hint}</p>
      )}
    </div>
  );
}

function DashboardTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { data: properties = [] } = useQuery({
    queryKey: ["admin_properties"],
    queryFn: async () => (await supabase.from("properties").select("*").order("sort")).data ?? [],
  });
  const { data: requests = [] } = useQuery({
    queryKey: ["admin_requests"],
    queryFn: async () => (await supabase.from("property_requests").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: interests = [] } = useQuery({
    queryKey: ["admin_interests"],
    queryFn: async () => (await supabase.from("property_interests").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: types = [] } = useQuery({
    queryKey: ["admin_types"],
    queryFn: async () => (await supabase.from("property_types").select("*")).data ?? [],
  });
  const { data: geo } = useGeo();

  const cities = geo?.cities ?? [];
  const districts = cities.reduce((acc, c) => acc + c.districts.length, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const available = properties.filter((p: any) => p.status !== "sold").length;
  const sold = properties.length - available;
  const located = properties.filter((p: any) => p.lat != null && p.lng != null).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalValue = properties.reduce((s: number, p: any) => s + (Number(p.price) || 0), 0);

  const reqGrowth = periodGrowth(requests.map((r: any) => r.created_at));
  const intGrowth = periodGrowth(interests.map((r: any) => r.created_at));
  const propGrowth = periodGrowth(properties.map((p: any) => p.created_at));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recent = [
    ...requests.map((r: any) => ({ kind: "طلب", name: r.name, phone: r.phone, at: r.created_at })),
    ...interests.map((r: any) => ({ kind: r.source === "whatsapp" ? "واتساب" : "اهتمام", name: r.name || (r.source === "whatsapp" ? "تواصل واتساب" : "—"), phone: r.phone || "—", at: r.created_at })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  const shortcuts = [
    { key: "properties", label: "إضافة / إدارة العروض", icon: "🏢" },
    { key: "requests", label: "مراجعة الطلبات", icon: "📥" },
    { key: "interests", label: "متابعة الاهتمامات", icon: "⭐" },
    { key: "geo", label: "المناطق والأحياء", icon: "🗺️" },
    { key: "taxonomy", label: "التصنيفات والأنواع", icon: "🏷️" },
    { key: "settings", label: "الإعدادات العامة", icon: "⚙️" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-foreground">لوحة المعلومات</h2>
        <p className="text-sm text-muted-foreground">نظرة سريعة على كل شيء في المنصّة.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي العروض" value={properties.length} growth={propGrowth} accent />
        <StatCard label="الطلبات" value={requests.length} growth={reqGrowth} />
        <StatCard label="الاهتمامات" value={interests.length} growth={intGrowth} />
        <StatCard label="القيمة الإجمالية (ر.س)" value={totalValue.toLocaleString("en-US")} hint="مجموع أسعار العروض" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="عروض متاحة" value={available} />
        <StatCard label="عروض مباعة" value={sold} />
        <StatCard label="عروض محدّدة على الخريطة" value={`${located} / ${properties.length}`} hint="عروض لها موقع دقيق" />
        <StatCard label="أنواع العقار" value={types.length} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="المدن" value={cities.length} />
        <StatCard label="الأحياء" value={districts} />
        <StatCard label="المناطق" value={geo?.regions.length ?? 0} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-base font-black text-foreground">اختصارات سريعة</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((s) => (
            <button
              key={s.key}
              onClick={() => onNavigate(s.key)}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-start transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-sm font-bold text-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-black text-foreground">أحدث النشاطات</h3>
          <button onClick={() => onNavigate("requests")} className="text-xs font-bold text-primary hover:underline">عرض الكل</button>
        </div>
        <div className="grid gap-2">
          {recent.length === 0 && <p className="text-sm text-muted-foreground">لا يوجد نشاط بعد.</p>}
          {recent.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">{r.kind}</span>
                <div>
                  <p className="text-sm font-bold text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{r.phone}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(r.at).toLocaleDateString("ar-SA")}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function SettingsTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*").maybeSingle()).data,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setForm(data); }, [data]);
  if (!form) return <p className="text-muted-foreground">جارٍ التحميل…</p>;

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  async function onHero(file: File) {
    const url = await uploadImage("hero", file);
    if (url) setForm({ ...form, prev_hero_image: form.hero_image, hero_image: url });
  }
  function deleteHero() {
    setForm({ ...form, prev_hero_image: form.hero_image, hero_image: "" });
  }
  function revertHero() {
    setForm({ ...form, hero_image: form.prev_hero_image, prev_hero_image: form.hero_image });
  }

  async function save() {
    setSaving(true);
    const payload = {
      hero_image: form.hero_image || null,
      prev_hero_image: form.prev_hero_image || null,
      hero_title_ar: form.hero_title_ar,
      hero_title_en: form.hero_title_en,
      hero_subtitle_ar: form.hero_subtitle_ar,
      hero_subtitle_en: form.hero_subtitle_en,
      whatsapp_number: form.whatsapp_number,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
      terms_ar: form.terms_ar || null,
      terms_en: form.terms_en || null,
      privacy_ar: form.privacy_ar || null,
      privacy_en: form.privacy_en || null,
      footer_text_ar: form.footer_text_ar || null,
      footer_text_en: form.footer_text_en || null,
    };
    const changes = diffChanges(data ?? {}, payload, SETTINGS_FIELD_LABELS);
    const { error } = await supabase.from("site_settings").update(payload).eq("id", true);
    setSaving(false);
    if (error) return toast.error("تعذّر الحفظ");
    toast.success("تم الحفظ");
    void logActivity({ action: "update", entity: "settings", entityLabel: "الإعدادات العامة", changes });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    qc.invalidateQueries({ queryKey: ["admin_settings"] });
  }



  return (
    <div className="space-y-6">


      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-black text-foreground">الصورة الكبيرة (خلفية العنوان)</h2>
        <img
          src={form.hero_image || heroBg}
          alt=""
          className="mb-2 h-40 w-full rounded-xl object-cover"
        />
        {!form.hero_image && (
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            هذه هي الصورة الافتراضية الظاهرة حاليًا خلف العنوان الرئيسي. ارفع صورة جديدة لتغييرها.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <FileButton onPick={onHero} label="اختيار صورة جديدة" />
          {form.hero_image && (
            <button onClick={deleteHero} className="rounded-full bg-destructive px-5 py-2.5 text-sm font-bold text-destructive-foreground shadow-card transition-transform hover:scale-[1.02]">
              حذف الصورة
            </button>
          )}
          {form.prev_hero_image && (
            <button onClick={revertHero} className={btnGhost}>
              ↺ إرجاع الصورة السابقة
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">لا تُحفظ التغييرات إلا بالضغط على «حفظ التغييرات».</p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <div><label className={labelCls}>العنوان (عربي)</label><input className={inputCls} value={form.hero_title_ar ?? ""} onChange={(e) => set("hero_title_ar", e.target.value)} /></div>
        <div><label className={labelCls}>العنوان (إنجليزي)</label><input className={inputCls} value={form.hero_title_en ?? ""} onChange={(e) => set("hero_title_en", e.target.value)} /></div>
        <div><label className={labelCls}>الوصف (عربي)</label><input className={inputCls} value={form.hero_subtitle_ar ?? ""} onChange={(e) => set("hero_subtitle_ar", e.target.value)} /></div>
        <div><label className={labelCls}>الوصف (إنجليزي)</label><input className={inputCls} value={form.hero_subtitle_en ?? ""} onChange={(e) => set("hero_subtitle_en", e.target.value)} /></div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
        <div><label className={labelCls}>رقم واتساب (مثال: 9665XXXXXXXX)</label><input className={inputCls} dir="ltr" value={form.whatsapp_number ?? ""} onChange={(e) => set("whatsapp_number", e.target.value)} /></div>
        <div><label className={labelCls}>رقم الهاتف (التذييل)</label><input className={inputCls} dir="ltr" value={form.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} /></div>
        <div><label className={labelCls}>البريد الرسمي (التذييل)</label><input className={inputCls} dir="ltr" value={form.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} /></div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="mb-1 text-lg font-black text-foreground">نص حقوق النشر (أسفل الموقع)</h2>
          <p className="text-xs text-muted-foreground">يظهر في تذييل الموقع. اتركه فارغًا لإخفائه.</p>
        </div>
        <div><label className={labelCls}>النص (عربي)</label><input className={inputCls} value={form.footer_text_ar ?? ""} placeholder="© 2026 منصة العقارات. جميع الحقوق محفوظة." onChange={(e) => set("footer_text_ar", e.target.value)} /></div>
        <div><label className={labelCls}>النص (إنجليزي)</label><input className={inputCls} dir="ltr" value={form.footer_text_en ?? ""} placeholder="© 2026 Real Estate Platform. All rights reserved." onChange={(e) => set("footer_text_en", e.target.value)} /></div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-black text-foreground">الصفحات القانونية</h2>
        <p className="text-xs text-muted-foreground">المحتوى يظهر في صفحتي «شروط الاستخدام» و«سياسة الخصوصية» المرتبطتين من تذييل الموقع. اتركه فارغًا لإخفاء المحتوى.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelCls}>شروط الاستخدام (عربي)</label><textarea className={`${inputCls} min-h-40`} value={form.terms_ar ?? ""} onChange={(e) => set("terms_ar", e.target.value)} /></div>
          <div><label className={labelCls}>شروط الاستخدام (إنجليزي)</label><textarea className={`${inputCls} min-h-40`} dir="ltr" value={form.terms_en ?? ""} onChange={(e) => set("terms_en", e.target.value)} /></div>
          <div><label className={labelCls}>سياسة الخصوصية (عربي)</label><textarea className={`${inputCls} min-h-40`} value={form.privacy_ar ?? ""} onChange={(e) => set("privacy_ar", e.target.value)} /></div>
          <div><label className={labelCls}>سياسة الخصوصية (إنجليزي)</label><textarea className={`${inputCls} min-h-40`} dir="ltr" value={form.privacy_en ?? ""} onChange={(e) => set("privacy_en", e.target.value)} /></div>
        </div>
      </section>


      <button onClick={save} disabled={saving} className={btnPrimary}>{saving ? "..." : "حفظ التغييرات"}</button>
    </div>
  );
}

/* ---------------- Taxonomy (desires / statuses / usages / types) ---------------- */
const usageKeys = Object.keys(usageLabels) as Usage[];

function OptionGroup({ kind, title }: { kind: "desire" | "status" | "usage"; title: string }) {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin_tax", kind],
    queryFn: async () =>
      (await supabase.from("taxonomy_options").select("*").eq("kind", kind).order("sort")).data ?? [],
  });
  const [n, setN] = useState({ key: "", label_ar: "", label_en: "" });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin_tax", kind] });
    qc.invalidateQueries({ queryKey: ["taxonomy"] });
  }
  async function add() {
    if (!n.key || !n.label_ar) return toast.error("أدخل المعرّف والاسم");
    const { error } = await supabase.from("taxonomy_options").insert({
      kind, key: n.key.trim(), label_ar: n.label_ar, label_en: n.label_en, sort: rows.length + 1,
    });
    if (error) return toast.error("تعذّر الإضافة (المعرّف مكرر؟)");
    void logActivity({ action: "create", entity: "taxonomy", entityLabel: `${title}: ${n.label_ar}`, note: `إضافة عنصر «${n.label_ar}»` });
    setN({ key: "", label_ar: "", label_en: "" });
    refresh();
    toast.success("تمت الإضافة");
  }
  async function del(id: string) {
    if (!confirm("حذف هذا العنصر؟")) return;
    const item = rows.find((r) => r.id === id);
    await supabase.from("taxonomy_options").delete().eq("id", id);
    void logActivity({ action: "delete", entity: "taxonomy", entityLabel: `${title}: ${item?.label_ar ?? id}`, note: `حذف عنصر «${item?.label_ar ?? id}»` });
    refresh();
  }


  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 text-base font-black text-foreground">{title}</h3>
      <div className="mb-3 grid gap-2 sm:grid-cols-4">
        <input className={inputCls} dir="ltr" placeholder="المعرّف (إنجليزي)" value={n.key} onChange={(e) => setN({ ...n, key: e.target.value })} />
        <input className={inputCls} placeholder="الاسم (عربي)" value={n.label_ar} onChange={(e) => setN({ ...n, label_ar: e.target.value })} />
        <input className={inputCls} dir="ltr" placeholder="الاسم (إنجليزي)" value={n.label_en} onChange={(e) => setN({ ...n, label_en: e.target.value })} />
        <button onClick={add} className={btnPrimary}>إضافة</button>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5">
            <span className="text-sm font-bold text-foreground">{r.label_ar} <span className="text-muted-foreground">/ {r.label_en} <span dir="ltr">({r.key})</span></span></span>
            <button onClick={() => del(r.id)} className="text-sm font-bold text-destructive hover:underline">حذف</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function TypesGroup() {
  const qc = useQueryClient();
  const { data: types = [] } = useQuery({
    queryKey: ["admin_types"],
    queryFn: async () => (await supabase.from("property_types").select("*").order("sort")).data ?? [],
  });
  const { data: tax } = useTaxonomy();
  const usages =
    tax?.usage && tax.usage.length ? tax.usage.map((u) => ({ key: u.key, ar: u.label.ar })) : usageKeys.map((u) => ({ key: u, ar: usageLabels[u].ar }));
  const [n, setN] = useState({ id: "", usage: usages[0]?.key ?? "residential", label_ar: "", label_en: "" });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin_types"] });
    qc.invalidateQueries({ queryKey: ["property_types"] });
  }
  async function add() {
    if (!n.id || !n.label_ar) return toast.error("أدخل المعرّف والاسم");
    const { error } = await supabase.from("property_types").insert({
      id: n.id.trim(), usage: n.usage, label_ar: n.label_ar, label_en: n.label_en, sort: types.length + 1,
    });
    if (error) return toast.error("تعذّر الإضافة (المعرّف مكرر؟)");
    void logActivity({ action: "create", entity: "type", entityLabel: `نوع عقار: ${n.label_ar}`, note: `إضافة نوع عقار «${n.label_ar}»` });
    setN({ id: "", usage: usages[0]?.key ?? "residential", label_ar: "", label_en: "" });
    refresh();
    toast.success("تمت الإضافة");
  }
  async function move(id: string, usage: string) {
    const tp = types.find((t) => t.id === id);
    await supabase.from("property_types").update({ usage }).eq("id", id);
    void logActivity({ action: "update", entity: "type", entityLabel: `نوع عقار: ${tp?.label_ar ?? id}`, changes: [{ label: "الاستخدام", from: usageName(tp?.usage ?? ""), to: usageName(usage) }] });
    refresh();
  }
  async function del(id: string) {
    if (!confirm("حذف هذا النوع؟")) return;
    const tp = types.find((t) => t.id === id);
    await supabase.from("property_types").delete().eq("id", id);
    void logActivity({ action: "delete", entity: "type", entityLabel: `نوع عقار: ${tp?.label_ar ?? id}`, note: `حذف نوع عقار «${tp?.label_ar ?? id}»` });
    refresh();
  }

  const usageName = (k: string) => usages.find((u) => u.key === k)?.ar ?? k;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 text-base font-black text-foreground">أنواع العقار (مع إمكانية نقل النوع لاستخدام آخر)</h3>
      <div className="mb-3 grid gap-2 sm:grid-cols-5">
        <input className={inputCls} dir="ltr" placeholder="المعرّف" value={n.id} onChange={(e) => setN({ ...n, id: e.target.value })} />
        <select className={inputCls} value={n.usage} onChange={(e) => setN({ ...n, usage: e.target.value })}>
          {usages.map((u) => <option key={u.key} value={u.key}>{u.ar}</option>)}
        </select>
        <input className={inputCls} placeholder="الاسم (عربي)" value={n.label_ar} onChange={(e) => setN({ ...n, label_ar: e.target.value })} />
        <input className={inputCls} dir="ltr" placeholder="الاسم (إنجليزي)" value={n.label_en} onChange={(e) => setN({ ...n, label_en: e.target.value })} />
        <button onClick={add} className={btnPrimary}>إضافة</button>
      </div>
      <div className="grid gap-2">
        {types.map((tp) => (
          <div key={tp.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
            <span className="text-sm font-bold text-foreground">{tp.label_ar} <span className="text-muted-foreground">/ {tp.label_en}</span></span>
            <div className="flex items-center gap-2">
              <select className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold" value={tp.usage} onChange={(e) => move(tp.id, e.target.value)}>
                {usages.map((u) => <option key={u.key} value={u.key}>{u.ar}</option>)}
              </select>
              <button onClick={() => del(tp.id)} className="text-sm font-bold text-destructive hover:underline">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TaxonomyTab() {
  return (
    <div className="space-y-6">
      <OptionGroup kind="desire" title="الرغبات (للبيع / للإيجار …)" />
      <OptionGroup kind="status" title="الحالات (متاح / مباع …)" />
      <OptionGroup kind="usage" title="الاستخدامات (سكني / تجاري …)" />
      <TypesGroup />
    </div>
  );
}

/* ---------------- Geo (regions / cities / districts) ---------------- */
function GeoTab() {
  const qc = useQueryClient();
  const { data: geo } = useGeo();
  const regions = geo?.regions ?? [];

  const [nr, setNr] = useState({ id: "", ar: "", en: "" });
  const [nc, setNc] = useState({ id: "", region_id: "", ar: "", en: "", lat: "24.7136", lng: "46.6753" });
  const [nd, setNd] = useState({ id: "", city_id: "", ar: "", en: "" });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["geo"] });
  }
  async function addRegion() {
    if (!nr.id || !nr.ar) return toast.error("أدخل المعرّف والاسم");
    const { error } = await supabase.from("regions").insert({ id: nr.id.trim(), label_ar: nr.ar, label_en: nr.en, sort: regions.length + 1 });
    if (error) return toast.error("تعذّر الإضافة (المعرّف مكرر؟)");
    void logActivity({ action: "create", entity: "geo", entityLabel: `منطقة: ${nr.ar}`, note: `إضافة منطقة «${nr.ar}»` });
    setNr({ id: "", ar: "", en: "" });
    refresh();
  }
  async function delRegion(id: string) {
    if (!confirm("حذف المنطقة وكل مدنها وأحيائها؟")) return;
    const r = regions.find((x) => x.id === id);
    await supabase.from("regions").delete().eq("id", id);
    void logActivity({ action: "delete", entity: "geo", entityLabel: `منطقة: ${r?.label.ar ?? id}`, note: `حذف منطقة «${r?.label.ar ?? id}» وكل مدنها وأحيائها` });
    refresh();
  }
  async function addCity() {
    if (!nc.id || !nc.ar || !nc.region_id) return toast.error("أدخل المعرّف والاسم والمنطقة");
    const { error } = await supabase.from("cities").insert({
      id: nc.id.trim(), region_id: nc.region_id, label_ar: nc.ar, label_en: nc.en,
      lat: Number(nc.lat) || 24.7136, lng: Number(nc.lng) || 46.6753,
    });
    if (error) return toast.error("تعذّر الإضافة (المعرّف مكرر؟)");
    void logActivity({ action: "create", entity: "geo", entityLabel: `مدينة: ${nc.ar}`, note: `إضافة مدينة «${nc.ar}»` });
    setNc({ id: "", region_id: "", ar: "", en: "", lat: "24.7136", lng: "46.6753" });
    refresh();
  }
  async function delCity(id: string) {
    if (!confirm("حذف المدينة وكل أحيائها؟")) return;
    const c = allCitiesFlat.find((x) => x.id === id);
    await supabase.from("cities").delete().eq("id", id);
    void logActivity({ action: "delete", entity: "geo", entityLabel: `مدينة: ${c?.label.ar ?? id}`, note: `حذف مدينة «${c?.label.ar ?? id}» وكل أحيائها` });
    refresh();
  }
  async function addDistrict() {
    if (!nd.id || !nd.ar || !nd.city_id) return toast.error("أدخل المعرّف والاسم والمدينة");
    const { error } = await supabase.from("districts").insert({ id: nd.id.trim(), city_id: nd.city_id, label_ar: nd.ar, label_en: nd.en });
    if (error) return toast.error("تعذّر الإضافة (المعرّف مكرر؟)");
    void logActivity({ action: "create", entity: "geo", entityLabel: `حي: ${nd.ar}`, note: `إضافة حي «${nd.ar}»` });
    setNd({ id: "", city_id: "", ar: "", en: "" });
    refresh();
  }
  async function delDistrict(id: string) {
    if (!confirm("حذف هذا الحي؟")) return;
    const d = allCitiesFlat.flatMap((c) => c.districts).find((x) => x.id === id);
    await supabase.from("districts").delete().eq("id", id);
    void logActivity({ action: "delete", entity: "geo", entityLabel: `حي: ${d?.label.ar ?? id}`, note: `حذف حي «${d?.label.ar ?? id}»` });
    refresh();
  }


  const allCitiesFlat = regions.flatMap((r) => r.cities);

  return (
    <div className="space-y-6">
      {/* Add region */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-base font-black text-foreground">إضافة منطقة</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <input className={inputCls} dir="ltr" placeholder="المعرّف" value={nr.id} onChange={(e) => setNr({ ...nr, id: e.target.value })} />
          <input className={inputCls} placeholder="الاسم (عربي)" value={nr.ar} onChange={(e) => setNr({ ...nr, ar: e.target.value })} />
          <input className={inputCls} dir="ltr" placeholder="الاسم (إنجليزي)" value={nr.en} onChange={(e) => setNr({ ...nr, en: e.target.value })} />
          <button onClick={addRegion} className={btnPrimary}>إضافة منطقة</button>
        </div>
      </section>

      {/* Add city */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-base font-black text-foreground">إضافة مدينة داخل منطقة</h3>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <select className={inputCls} value={nc.region_id} onChange={(e) => setNc({ ...nc, region_id: e.target.value })}>
            <option value="">— المنطقة —</option>
            {regions.map((r) => <option key={r.id} value={r.id}>{r.label.ar}</option>)}
          </select>
          <input className={inputCls} dir="ltr" placeholder="المعرّف" value={nc.id} onChange={(e) => setNc({ ...nc, id: e.target.value })} />
          <input className={inputCls} placeholder="الاسم (عربي)" value={nc.ar} onChange={(e) => setNc({ ...nc, ar: e.target.value })} />
          <input className={inputCls} dir="ltr" placeholder="الاسم (إنجليزي)" value={nc.en} onChange={(e) => setNc({ ...nc, en: e.target.value })} />
          <input className={inputCls} dir="ltr" placeholder="خط العرض lat" value={nc.lat} onChange={(e) => setNc({ ...nc, lat: e.target.value })} />
          <input className={inputCls} dir="ltr" placeholder="خط الطول lng" value={nc.lng} onChange={(e) => setNc({ ...nc, lng: e.target.value })} />
        </div>
        <button onClick={addCity} className={`${btnPrimary} mt-2`}>إضافة مدينة</button>
      </section>

      {/* Add district */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-base font-black text-foreground">إضافة حي داخل مدينة</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <select className={inputCls} value={nd.city_id} onChange={(e) => setNd({ ...nd, city_id: e.target.value })}>
            <option value="">— المدينة —</option>
            {allCitiesFlat.map((c) => <option key={c.id} value={c.id}>{c.label.ar}</option>)}
          </select>
          <input className={inputCls} dir="ltr" placeholder="المعرّف" value={nd.id} onChange={(e) => setNd({ ...nd, id: e.target.value })} />
          <input className={inputCls} placeholder="الاسم (عربي)" value={nd.ar} onChange={(e) => setNd({ ...nd, ar: e.target.value })} />
          <input className={inputCls} dir="ltr" placeholder="الاسم (إنجليزي)" value={nd.en} onChange={(e) => setNd({ ...nd, en: e.target.value })} />
        </div>
        <button onClick={addDistrict} className={`${btnPrimary} mt-2`}>إضافة حي</button>
      </section>

      {/* Current geo */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-base font-black text-foreground">المناطق الحالية</h3>
        <div className="space-y-4">
          {regions.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-black text-foreground">{r.label.ar}</span>
                <button onClick={() => delRegion(r.id)} className="text-sm font-bold text-destructive hover:underline">حذف المنطقة</button>
              </div>
              <div className="space-y-2 ps-3">
                {r.cities.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-bold text-foreground">{c.label.ar}</span>
                      <button onClick={() => delCity(c.id)} className="text-xs font-bold text-destructive hover:underline">حذف المدينة</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.districts.map((d) => (
                        <span key={d.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                          {d.label.ar}
                          <button onClick={() => delDistrict(d.id)} className="text-destructive hover:underline">×</button>
                        </span>
                      ))}
                      {c.districts.length === 0 && <span className="text-xs text-muted-foreground">لا أحياء</span>}
                    </div>
                  </div>
                ))}
                {r.cities.length === 0 && <span className="text-xs text-muted-foreground">لا مدن</span>}
              </div>
            </div>
          ))}
          {regions.length === 0 && <p className="text-muted-foreground">لا توجد مناطق بعد.</p>}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Properties ---------------- */
const emptyProp = {
  id: "", ref: "", desire: "sale", usage: "residential", type_id: "villa",
  city_id: "riyadh", district_id: "", area: "", price: "", status: "available",
  image: "", images: [] as string[], bedrooms: "", bathrooms: "", living_rooms: "", age: "", street: "",
  street_west: "", license: "", description_ar: "", description_en: "", sort: 0,
  lat: "", lng: "",
};

const DRAFT_KEY = "thiqah_property_draft";

function loadDraft(): typeof emptyProp | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as typeof emptyProp;
  } catch {
    return null;
  }
}

function isDraftMeaningful(f: typeof emptyProp): boolean {
  return !!(
    f.ref || f.price || f.area || f.images.length || f.description_ar ||
    f.description_en || f.license || f.bedrooms || f.bathrooms
  );
}


function PropertiesTab() {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery({
    queryKey: ["admin_properties"],
    queryFn: async () => (await supabase.from("properties").select("*").order("sort")).data ?? [],
  });
  const { data: types = [] } = useQuery({
    queryKey: ["admin_types"],
    queryFn: async () => (await supabase.from("property_types").select("*").order("sort")).data ?? [],
  });
  const [editing, setEditing] = useState<typeof emptyProp | null>(null);
  const [draft, setDraft] = useState<typeof emptyProp | null>(null);

  useEffect(() => {
    if (!editing) {
      const d = loadDraft();
      setDraft(d && isDraftMeaningful(d) ? d : null);
    }
  }, [editing]);

  function discardDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setDraft(null);
  }

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin_properties"] });
    qc.invalidateQueries({ queryKey: ["properties"] });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function del(p: any) {
    if (!confirm("حذف هذا العرض؟")) return;
    await supabase.from("properties").delete().eq("id", p.id);
    void logActivity({
      action: "delete",
      entity: "property",
      entityLabel: `عرض رقم ${p.ref}`,
      note: `حذف العرض رقم ${p.ref} — ${p.city_id} · ${Number(p.price).toLocaleString("en-US")}`,
    });
    refresh();
    toast.success("تم الحذف");
  }

  // Inline image management from the list (change before entering offer)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function changeMainImage(p: any, file: File) {
    const url = await uploadImage("properties", file);
    if (!url) return;
    const images: string[] = Array.isArray(p.images) ? [...p.images] : [];
    if (images.length) images[0] = url; else images.push(url);
    await supabase.from("properties").update({ image: url, images }).eq("id", p.id);
    refresh();
    toast.success("تم تحديث الصورة");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function clearImage(p: any) {
    if (!confirm("حذف صورة هذا العرض؟")) return;
    await supabase.from("properties").update({ image: null, images: [] }).eq("id", p.id);
    refresh();
  }

  if (editing) {
    return (
      <PropertyForm
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initial={editing as any}
        types={types as { id: string; label_ar: string }[]}
        onDone={() => { setEditing(null); refresh(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {draft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3">
          <div>
            <p className="text-sm font-black text-foreground">لديك مسودة عرض غير مكتملة</p>
            <p className="text-xs text-muted-foreground">
              {draft.ref ? `إعلان رقم ${draft.ref}` : "عرض جديد بدون رقم"} — يمكنك المتابعة من حيث توقفت.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(draft)} className={btnPrimary}>استكمال المسودة</button>
            <button onClick={discardDraft} className="text-sm font-bold text-destructive hover:underline">حذف المسودة</button>
          </div>
        </div>
      )}
      <button onClick={() => setEditing({ ...emptyProp })} className={btnPrimary}>+ إضافة عرض جديد</button>
      <div className="grid gap-2">
        {list.map((p) => {
          const shown = mapProperty(p);
          const hasOwn = !!(p.image || (Array.isArray(p.images) && p.images.length));
          return (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={shown.image} alt="" className="h-14 w-20 rounded-lg object-cover" />
                {!hasOwn && (
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-background/80 px-1 text-[9px] font-bold text-muted-foreground">افتراضية</span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">#{p.ref} — {Number(p.price).toLocaleString("en-US")}</p>
                <p className="text-xs text-muted-foreground">{p.city_id} · {p.type_id} · {p.status === "sold" ? "مباع" : "متاح"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FileButton onPick={(f) => changeMainImage(p, f)} label="تغيير الصورة" className="!px-4 !py-2 text-xs" />
              {hasOwn && <button onClick={() => clearImage(p)} className="text-xs font-bold text-destructive hover:underline">حذف الصورة</button>}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <button onClick={() => setEditing(toForm(p) as any)} className={btnGhost}>تعديل</button>
              <button onClick={() => del(p)} className="text-sm font-bold text-destructive hover:underline">حذف</button>
            </div>
          </div>
          );
        })}
        {list.length === 0 && <p className="text-muted-foreground">لا توجد عروض بعد.</p>}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toForm(p: any): typeof emptyProp {
  const s = (v: unknown) => (v == null ? "" : String(v));
  return {
    id: p.id, ref: s(p.ref), desire: p.desire, usage: p.usage, type_id: p.type_id,
    city_id: p.city_id, district_id: s(p.district_id), area: s(p.area), price: s(p.price),
    status: p.status, image: s(p.image), images: Array.isArray(p.images) ? p.images : [],
    bedrooms: s(p.bedrooms), bathrooms: s(p.bathrooms),
    living_rooms: s(p.living_rooms), age: s(p.age), street: s(p.street), street_west: s(p.street_west),
    license: s(p.license), description_ar: s(p.description_ar), description_en: s(p.description_en),
    sort: p.sort ?? 0, lat: s(p.lat), lng: s(p.lng),
  };
}

function PropertyForm({
  initial, types, onDone, onCancel,
}: {
  initial: typeof emptyProp;
  types: { id: string; label_ar: string }[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setF({ ...f, [k]: v });

  const isNew = !f.id;

  // Auto-save in-progress new offers as a local draft.
  useEffect(() => {
    if (!isNew) return;
    try {
      if (isDraftMeaningful(f)) localStorage.setItem(DRAFT_KEY, JSON.stringify(f));
    } catch { /* ignore */ }
  }, [f, isNew]);

  // Warn before leaving/refreshing the page with unsaved data.
  useEffect(() => {
    if (!isNew) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (isDraftMeaningful(f)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [f, isNew]);

  function clearDraftStorage() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }

  function handleCancel() {
    if (isNew && isDraftMeaningful(f)) {
      const keep = confirm("هل تريد المتابعة لاحقًا وإكمال هذا العرض؟\n\nاضغط «موافق» لحفظه كمسودة، أو «إلغاء» لتجاهل البيانات.");
      if (keep) {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(f)); } catch { /* ignore */ }
        toast.success("تم حفظ المسودة");
      } else {
        clearDraftStorage();
      }
    }
    onCancel();
  }

  const { data: geo } = useGeo();
  const { data: tax } = useTaxonomy();

  const cities = geo?.cities ?? [];
  const city = cities.find((c) => c.id === f.city_id);

  const desires = tax?.desire?.length ? tax.desire.map((o) => ({ key: o.key, ar: o.label.ar })) : [{ key: "sale", ar: "للبيع" }, { key: "rent", ar: "للإيجار" }];
  const statuses = tax?.status?.length ? tax.status.map((o) => ({ key: o.key, ar: o.label.ar })) : [{ key: "available", ar: "متاح" }, { key: "sold", ar: "مباع" }];
  const usages = tax?.usage?.length ? tax.usage.map((o) => ({ key: o.key, ar: o.label.ar })) : usageKeys.map((u) => ({ key: u, ar: usageLabels[u].ar }));

  async function addImage(file: File) {
    const url = await uploadImage("properties", file);
    if (!url) return;
    const images = [...f.images, url];
    setF({ ...f, images, image: f.image || url });
  }
  function removeImage(idx: number) {
    const images = f.images.filter((_, i) => i !== idx);
    setF({ ...f, images, image: images[0] ?? "" });
  }

  const num = (v: string) => (v === "" ? null : Number(v));

  async function save() {
    if (!f.ref) return toast.error("أدخل رقم الإعلان");
    setSaving(true);
    const mainImage = f.image || f.images[0] || null;
    const payload = {
      ref: f.ref, desire: f.desire, usage: f.usage, type_id: f.type_id,
      city_id: f.city_id, district_id: f.district_id || f.city_id,
      area: num(f.area) ?? 0, price: num(f.price) ?? 0, status: f.status,
      image: mainImage, images: f.images, bedrooms: num(f.bedrooms), bathrooms: num(f.bathrooms),
      living_rooms: num(f.living_rooms), age: num(f.age), street: num(f.street),
      street_west: num(f.street_west), license: f.license || null,
      description_ar: f.description_ar || null, description_en: f.description_en || null,
      sort: Number(f.sort) || 0,
      lat: num(f.lat), lng: num(f.lng),
    };
    const res = f.id
      ? await supabase.from("properties").update(payload).eq("id", f.id)
      : await supabase.from("properties").insert(payload);
    setSaving(false);
    if (res.error) return toast.error("تعذّر الحفظ");
    const changes = diffChanges(
      f.id ? (initial as unknown as Record<string, unknown>) : {},
      f as unknown as Record<string, unknown>,
      PROP_FIELD_LABELS,
    );
    void logActivity({
      action: f.id ? "update" : "create",
      entity: "property",
      entityLabel: `عرض رقم ${f.ref}`,
      changes,
    });
    clearDraftStorage();
    toast.success("تم الحفظ");
    onDone();
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-black text-foreground">{f.id ? "تعديل عرض" : "عرض جديد"}</h2>

      <div>
        <label className={labelCls}>صور العرض</label>
        <div className="mb-3 flex flex-wrap gap-2">
          {f.images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="" className="h-24 w-32 rounded-xl object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground shadow"
              >×</button>
              {i === 0 && <span className="absolute bottom-1 right-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">رئيسية</span>}
            </div>
          ))}
        </div>
        <FileButton onPick={addImage} label="إضافة صورة" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className={labelCls}>رقم الإعلان</label><input className={inputCls} dir="ltr" value={f.ref} onChange={(e) => set("ref", e.target.value)} /></div>
        <div><label className={labelCls}>الرغبة</label>
          <select className={inputCls} value={f.desire} onChange={(e) => set("desire", e.target.value)}>
            {desires.map((d) => <option key={d.key} value={d.key}>{d.ar}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>الحالة</label>
          <select className={inputCls} value={f.status} onChange={(e) => set("status", e.target.value)}>
            {statuses.map((s) => <option key={s.key} value={s.key}>{s.ar}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>الاستخدام</label>
          <select className={inputCls} value={f.usage} onChange={(e) => set("usage", e.target.value)}>
            {usages.map((u) => <option key={u.key} value={u.key}>{u.ar}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>نوع العقار</label>
          <select className={inputCls} value={f.type_id} onChange={(e) => set("type_id", e.target.value)}>
            {types.map((t) => <option key={t.id} value={t.id}>{t.label_ar}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>المدينة</label>
          <select className={inputCls} value={f.city_id} onChange={(e) => setF({ ...f, city_id: e.target.value, district_id: "" })}>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.label.ar}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>الحي</label>
          <select className={inputCls} value={f.district_id} onChange={(e) => set("district_id", e.target.value)}>
            <option value="">— اختر —</option>
            {city?.districts.map((d) => <option key={d.id} value={d.id}>{d.label.ar}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>المساحة (م²)</label><input className={inputCls} dir="ltr" value={f.area} onChange={(e) => set("area", e.target.value.replace(/[^0-9.]/g, ""))} /></div>
        <div><label className={labelCls}>السعر</label><input className={inputCls} dir="ltr" value={f.price} onChange={(e) => set("price", e.target.value.replace(/[^0-9.]/g, ""))} /></div>
        <div><label className={labelCls}>غرف النوم</label><input className={inputCls} dir="ltr" value={f.bedrooms} onChange={(e) => set("bedrooms", e.target.value.replace(/[^0-9]/g, ""))} /></div>
        <div><label className={labelCls}>دورات المياه</label><input className={inputCls} dir="ltr" value={f.bathrooms} onChange={(e) => set("bathrooms", e.target.value.replace(/[^0-9]/g, ""))} /></div>
        <div><label className={labelCls}>الصالات</label><input className={inputCls} dir="ltr" value={f.living_rooms} onChange={(e) => set("living_rooms", e.target.value.replace(/[^0-9]/g, ""))} /></div>
        <div><label className={labelCls}>عمر العقار (سنة)</label><input className={inputCls} dir="ltr" value={f.age} onChange={(e) => set("age", e.target.value.replace(/[^0-9]/g, ""))} /></div>
        <div><label className={labelCls}>عرض الشارع الشرقي</label><input className={inputCls} dir="ltr" value={f.street} onChange={(e) => set("street", e.target.value.replace(/[^0-9]/g, ""))} /></div>
        <div><label className={labelCls}>عرض الشارع الغربي</label><input className={inputCls} dir="ltr" value={f.street_west} onChange={(e) => set("street_west", e.target.value.replace(/[^0-9]/g, ""))} /></div>
        <div><label className={labelCls}>رقم الرخصة</label><input className={inputCls} dir="ltr" value={f.license} onChange={(e) => set("license", e.target.value)} /></div>
        <div><label className={labelCls}>الترتيب</label><input className={inputCls} dir="ltr" value={String(f.sort)} onChange={(e) => set("sort", e.target.value.replace(/[^0-9]/g, ""))} /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={labelCls}>الوصف (عربي)</label><textarea className={`${inputCls} min-h-[90px]`} value={f.description_ar} onChange={(e) => set("description_ar", e.target.value)} /></div>
        <div><label className={labelCls}>الوصف (إنجليزي)</label><textarea className={`${inputCls} min-h-[90px]`} value={f.description_en} onChange={(e) => set("description_en", e.target.value)} /></div>
      </div>

      <div>
        <label className={labelCls}>موقع العرض على الخريطة (اضغط على الخريطة لتحديد الموقع الدقيق)</label>
        <LocationPicker
          lat={f.lat ? Number(f.lat) : (city ? city.lat : undefined)}
          lng={f.lng ? Number(f.lng) : (city ? city.lng : undefined)}
          fallback={city ? [city.lat, city.lng] : [24.7136, 46.6753]}
          onChange={(la, ln) => setF({ ...f, lat: String(la), lng: String(ln) })}
        />
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <input className={inputCls} dir="ltr" placeholder="خط العرض lat" value={f.lat} onChange={(e) => set("lat", e.target.value.replace(/[^0-9.\-]/g, ""))} />
          <input className={inputCls} dir="ltr" placeholder="خط الطول lng" value={f.lng} onChange={(e) => set("lng", e.target.value.replace(/[^0-9.\-]/g, ""))} />
          {(f.lat || f.lng) && (
            <button onClick={() => setF({ ...f, lat: "", lng: "" })} className={btnGhost}>مسح الموقع</button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className={btnPrimary}>{saving ? "..." : "حفظ"}</button>
        <button onClick={handleCancel} className={btnGhost}>إلغاء</button>
      </div>
    </div>
  );
}

/* ---------------- Contact helpers ---------------- */
function waLink(phone: string | null) {
  const digits = (phone || "").replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

function ContactButtons({ phone }: { phone: string | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={waLink(phone)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-card transition-transform hover:scale-[1.02]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.25.7-1.44 1.33-1.99 1.41-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.62-2.98-1.29-4.92-4.28-5.07-4.48-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37l.57.01c.18.01.43-.07.67.51.25.6.85 2.06.92 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.39-.45.53-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.07 1.31 2.37 1.46.3.15.47.12.65-.07.18-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.71.81 2.01.96.3.15.5.22.57.35.07.13.07.73-.18 1.43Z"/></svg>
        واتساب
      </a>
      <a
        href={`tel:${(phone || "").replace(/[^\d+]/g, "")}`}
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
      >
        اتصال
      </a>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-background px-3 py-2">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground" dir="auto">{value}</span>
    </div>
  );
}

/* ---------------- Requests ---------------- */
function RequestsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);
  const { data: rows = [] } = useQuery({
    queryKey: ["admin_requests"],
    queryFn: async () => (await supabase.from("property_requests").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  async function del(id: string) {
    if (!confirm("حذف هذا الطلب؟")) return;
    const req = rows.find((x) => x.id === id);
    await supabase.from("property_requests").delete().eq("id", id);
    void logActivity({ action: "delete", entity: "request", entityLabel: `طلب من ${req?.name ?? "—"}`, note: `حذف طلب العميل «${req?.name ?? "—"}» (${req?.phone ?? "—"})` });
    qc.invalidateQueries({ queryKey: ["admin_requests"] });
  }

  return (
    <div className="grid gap-3">
      {rows.length === 0 && <p className="text-muted-foreground">لا توجد طلبات بعد.</p>}
      {rows.map((r) => {
        const isOpen = open === r.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = (r.details ?? {}) as any;
        return (
          <div key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 p-4">
              <button onClick={() => setOpen(isOpen ? null : r.id)} className="flex-1 text-start">
                <p className="font-black text-foreground">{r.name}</p>
                <p className="text-sm text-muted-foreground" dir="ltr">{r.phone}</p>
              </button>
              <button onClick={() => setOpen(isOpen ? null : r.id)} className="rounded-full border border-border px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-secondary">
                {isOpen ? "إخفاء التفاصيل" : "عرض التفاصيل"}
              </button>
            </div>
            {isOpen && (
              <div className="space-y-3 border-t border-border bg-secondary/30 p-4">
                <ContactButtons phone={r.phone} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailRow label="الاسم" value={r.name} />
                  <DetailRow label="الهاتف" value={<span dir="ltr">{r.phone}</span>} />
                  {r.budget && <DetailRow label="الميزانية" value={Number(r.budget).toLocaleString("en-US")} />}
                  {d.usage && <DetailRow label="الاستخدام" value={d.usage} />}
                  {d.typeId && <DetailRow label="نوع العقار" value={d.typeId} />}
                  {d.desire && <DetailRow label="الرغبة" value={d.desire} />}
                  {d.regionId && <DetailRow label="المنطقة" value={d.regionId} />}
                  {d.cityId && <DetailRow label="المدينة" value={d.cityId} />}
                  <DetailRow label="التاريخ" value={new Date(r.created_at).toLocaleString("ar-SA")} />
                </div>
                {r.message && (
                  <div className="rounded-lg bg-background px-3 py-2">
                    <p className="mb-1 text-xs font-bold text-muted-foreground">الرسالة</p>
                    <p className="text-sm font-semibold text-foreground">{r.message}</p>
                  </div>
                )}
                <button onClick={() => del(r.id)} className="text-sm font-bold text-destructive hover:underline">حذف الطلب</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Interests ---------------- */
function InterestsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);
  const { data: rows = [] } = useQuery({
    queryKey: ["admin_interests"],
    queryFn: async () => (await supabase.from("property_interests").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: props = [] } = useQuery({
    queryKey: ["admin_interest_props"],
    queryFn: async () => (await supabase.from("properties").select("id, ref")).data ?? [],
  });
  const refToId = new Map<string, string>(props.map((p) => [String(p.ref), p.id as string]));
  async function del(id: string) {
    if (!confirm("حذف هذا الاهتمام؟")) return;
    const it = rows.find((x) => x.id === id);
    await supabase.from("property_interests").delete().eq("id", id);
    void logActivity({ action: "delete", entity: "interest", entityLabel: `اهتمام ${it?.name || "—"}`, note: `حذف اهتمام «${it?.name || "—"}»${it?.property_ref ? ` بالعرض #${it.property_ref}` : ""}` });
    qc.invalidateQueries({ queryKey: ["admin_interests"] });
  }

  return (
    <div className="grid gap-3">
      {rows.length === 0 && <p className="text-muted-foreground">لا توجد اهتمامات بعد.</p>}
      {rows.map((r) => {
        const isOpen = open === r.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const source = (r as any).source ?? "form";
        const isWhats = source === "whatsapp";
        const propId = r.property_ref ? refToId.get(String(r.property_ref)) : undefined;
        const displayName = r.name || (isWhats ? "تواصل عبر واتساب" : "—");
        return (
          <div key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 p-4">
              <button onClick={() => setOpen(isOpen ? null : r.id)} className="flex-1 text-start">
                <p className="flex items-center gap-2 font-black text-foreground">
                  {displayName}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isWhats ? "bg-emerald-600/15 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                    {isWhats ? "واتساب" : "نموذج اهتمام"}
                  </span>
                </p>
                {r.phone && <p className="text-sm text-muted-foreground" dir="ltr">{r.phone}</p>}
              </button>
              <button onClick={() => setOpen(isOpen ? null : r.id)} className="rounded-full border border-border px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-secondary">
                {isOpen ? "إخفاء التفاصيل" : "عرض التفاصيل"}
              </button>
            </div>
            {isOpen && (
              <div className="space-y-3 border-t border-border bg-secondary/30 p-4">
                {r.phone && <ContactButtons phone={r.phone} />}
                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailRow label="الاسم" value={displayName} />
                  {r.phone && <DetailRow label="الهاتف" value={<span dir="ltr">{r.phone}</span>} />}
                  <DetailRow label="نوع التواصل" value={isWhats ? "زر واتساب" : "نموذج تسجيل اهتمام"} />
                  {r.property_ref && (
                    <DetailRow
                      label="العرض"
                      value={
                        propId ? (
                          <Link to="/properties/$id" params={{ id: propId }} className="font-bold text-primary hover:underline">
                            #{r.property_ref} — فتح العرض
                          </Link>
                        ) : (
                          `#${r.property_ref}`
                        )
                      }
                    />
                  )}
                  <DetailRow label="التاريخ" value={new Date(r.created_at).toLocaleString("ar-SA")} />
                </div>
                <button onClick={() => del(r.id)} className="text-sm font-bold text-destructive hover:underline">حذف الاهتمام</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

}

/* ---------------- Staff (sub-admins) ---------------- */
function StaffTab() {
  const qc = useQueryClient();
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["admin_staff"],
    queryFn: () => listStaff(),
  });

  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [perms, setPerms] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function togglePerm(p: string) {
    setPerms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  }

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin_staff"] });
  }

  async function add() {
    if (!form.email.trim() || !form.name.trim() || form.password.length < 6) {
      return toast.error("أكمل البيانات (كلمة المرور 6 أحرف على الأقل)");
    }
    setBusy(true);
    try {
      await createStaff({ data: { ...form, permissions: perms } });
      toast.success("تمت إضافة الموظف");
      setForm({ email: "", name: "", password: "" });
      setPerms([]);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذّر الإضافة");
    } finally {
      setBusy(false);
    }
  }

  async function savePerms(userId: string, next: string[]) {
    try {
      await updateStaffPermissions({ data: { userId, permissions: next } });
      toast.success("تم تحديث الصلاحيات");
      refresh();
    } catch {
      toast.error("تعذّر التحديث");
    }
  }

  async function remove(userId: string) {
    if (!confirm("حذف هذا الموظف نهائيًا؟")) return;
    try {
      await deleteStaff({ data: { userId } });
      toast.success("تم الحذف");
      refresh();
    } catch {
      toast.error("تعذّر الحذف");
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-black text-foreground">إضافة موظف فرعي</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>اسم الموظف</label>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>البريد الإلكتروني</label>
            <input className={inputCls} dir="ltr" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>كلمة المرور</label>
            <input className={inputCls} dir="ltr" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelCls}>الصلاحيات المسموح بها</label>
          <div className="flex flex-wrap gap-2">
            {ALL_PERMISSIONS.map((p) => {
              const active = perms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePerm(p)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                    active
                      ? "gradient-primary border-transparent text-primary-foreground shadow-card"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {PERMISSION_LABELS[p]}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={add} disabled={busy} className={btnPrimary}>{busy ? "..." : "إضافة الموظف"}</button>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-black text-foreground">الموظفون الحاليون</h2>
        {isLoading && <p className="text-muted-foreground">جارٍ التحميل…</p>}
        {!isLoading && staff.length === 0 && <p className="text-muted-foreground">لا يوجد موظفون بعد.</p>}
        {staff.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{s.name || "—"}</p>
                <p className="text-sm text-muted-foreground" dir="ltr">{s.email}</p>
              </div>
              <button onClick={() => remove(s.id)} className="rounded-full bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground transition-transform hover:scale-[1.02]">
                حذف
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_PERMISSIONS.map((p) => {
                const active = s.permissions.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      savePerms(
                        s.id,
                        active ? s.permissions.filter((x) => x !== p) : [...s.permissions, p],
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                      active
                        ? "gradient-primary border-transparent text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {PERMISSION_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ---------------- Activity log ---------------- */
function ActivityTab() {
  const [open, setOpen] = useState<string | null>(null);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin_activity"],
    queryFn: async () =>
      (await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300)
      ).data ?? [],
  });
  const { data: staff = [] } = useQuery({
    queryKey: ["admin_staff"],
    queryFn: () => listStaff(),
  });
  const nameByEmail = new Map(staff.map((s) => [s.email.toLowerCase(), s.name]));

  const actionLabel: Record<string, string> = {
    create: "إضافة",
    update: "تعديل",
    delete: "حذف",
  };


  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black text-foreground">سجل نشاط الموظفين</h2>
      <p className="text-sm text-muted-foreground">اضغط على أي عملية لعرض تفاصيل التعديل الكامل (القيم السابقة والجديدة).</p>
      {isLoading && <p className="text-muted-foreground">جارٍ التحميل…</p>}
      {!isLoading && rows.length === 0 && <p className="text-muted-foreground">لا يوجد نشاط بعد.</p>}
      <div className="grid gap-2">
        {rows.map((r) => {
          const details = parseDetails(r.details);
          const hasDetails = !!details && (details.changes.length > 0 || !!details.note);
          const isOpen = open === r.id;
          return (
            <div key={r.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                onClick={() => hasDetails && setOpen(isOpen ? null : (r.id as string))}
                className={`flex w-full flex-wrap items-center justify-between gap-2 p-3 text-start ${hasDetails ? "cursor-pointer hover:bg-secondary/40" : "cursor-default"}`}
              >
                <div className="min-w-0">
                  <p className="font-bold text-foreground">
                    <span className="text-primary">{actionLabel[r.action] ?? r.action}</span>
                    {r.entity_label ? ` — ${r.entity_label}` : ""}
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    {(r.actor_email && nameByEmail.get(r.actor_email.toLowerCase())) || "المسؤول الرئيسي"}
                  </p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{r.actor_email ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    {new Date(r.created_at as string).toLocaleString("ar-SA")}
                  </span>

                  {hasDetails && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-bold text-primary">
                      {isOpen ? "إخفاء" : "تفاصيل"}
                    </span>
                  )}
                </div>
              </button>
              {isOpen && details && (
                <div className="space-y-2 border-t border-border bg-secondary/30 p-3">
                  {details.note && (
                    <p className="text-sm font-semibold text-foreground">{details.note}</p>
                  )}
                  {details.changes.length > 0 && (
                    <div className="grid gap-1.5">
                      {details.changes.map((c, i) => (
                        <div key={i} className="rounded-lg bg-background px-3 py-2">
                          <p className="mb-1 text-xs font-bold text-muted-foreground">{c.label}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                            <span className="text-destructive line-through" dir="auto">{c.from}</span>
                            <span className="text-muted-foreground">←</span>
                            <span className="text-emerald-600" dir="auto">{c.to}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


