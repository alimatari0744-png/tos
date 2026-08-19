import { useId } from "react";
import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  const gid = useId().replace(/:/g, "");
  const gold = `thiqahGold-${gid}`;
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gold} x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E1C27A" />
          <stop offset="1" stopColor="#B8893A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#1B2A4A" />
      <rect x="4" y="4" width="56" height="56" rx="13" fill="none" stroke={`url(#${gold})`} strokeWidth="1.6" />
      <path
        d="M16 46V30c0-8.5 7.2-15.4 16-15.4S48 21.5 48 30v16"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M22 46V32.5c0-5.6 4.5-10.1 10-10.1s10 4.5 10 10.1V46"
        fill="none"
        stroke="#F7F1E6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d={`M32 14.2l1.7 1.7-1.7 1.7-1.7-1.7z`} fill={`url(#${gold})`} />
      <path d="M20 46h24" stroke={`url(#${gold})`} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function BrandLogo({
  variant = "auto",
  to = "/",
  className = "",
  onClick,
}: {
  variant?: "mark" | "wide" | "auto";
  to?: string;
  className?: string;
  onClick?: () => void;
}) {
  const { lang } = useLanguage();
  const name = lang === "ar" ? "ثقة الإعمار" : "Thiqah Al-Emaar";
  const tag = lang === "ar" ? "للخدمات العقارية" : "Real Estate Services";

  const mark = <LogoMark className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />;
  const wordmark = (
    <span className="min-w-0 leading-tight">
      <span className="block text-base font-black tracking-tight text-foreground sm:text-lg">{name}</span>
      <span className="block text-[11px] font-semibold text-muted-foreground sm:text-xs">{tag}</span>
    </span>
  );

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2.5 ${className}`}
      aria-label="ثقة الإعمار للخدمات العقارية"
    >
      {mark}
      {variant === "mark" ? <span className="sr-only">{name}</span> : null}
      {variant === "wide" ? wordmark : null}
      {variant === "auto" ? <span className="hidden sm:block">{wordmark}</span> : null}
    </Link>
  );
}
