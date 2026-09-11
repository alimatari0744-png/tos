import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BRAND_REPLACEMENTS: [RegExp, string][] = [
  [/ثقة\s*الإعمار للخدمات العقارية/g, "مكتب طوس العقارية"],
  [/ثقة\s*الإعمار/g, "مكتب طوس العقارية"],
  [/ثقة\s*و\s*إعمار/g, "مكتب طوس العقارية"],
  [/ثقة\s*و\s*اعمار/g, "مكتب طوس العقارية"],
  [/نبني الثقة، ونُعمّر المستقبل/g, "وجهتك الموثوقة للعقارات"],
  [/Thiqah\s+Al-Emaar Real Estate/gi, "Tawoos Real Estate Office"],
  [/Thiqah\s+Al-Emaar/gi, "Tawoos Real Estate Office"],
  [/Thiqah\s+Wa\s+Emaar/gi, "Tawoos Real Estate Office"],
  [/Building Trust, Developing the Future/gi, "Your trusted destination for real estate"],
];

export function correctBrandName<T>(value: T): T {
  if (typeof value === "string") {
    return BRAND_REPLACEMENTS.reduce((text, [from, to]) => text.replace(from, to), value as string) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => correctBrandName(item)) as T;
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = correctBrandName(item);
    }
    return next as T;
  }
  return value;
}
