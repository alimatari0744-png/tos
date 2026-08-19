import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BRAND_REPLACEMENTS: [RegExp, string][] = [
  [/ثقة\s*و\s*إعمار/g, "ثقة الإعمار"],
  [/ثقة\s*و\s*اعمار/g, "ثقة الإعمار"],
  [/Thiqah\s+Wa\s+Emaar/gi, "Thiqah Al-Emaar"],
];

export function correctBrandName<T>(value: T): T {
  if (typeof value === "string") {
    return BRAND_REPLACEMENTS.reduce((text, [from, to]) => text.replace(from, to), value) as T;
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
