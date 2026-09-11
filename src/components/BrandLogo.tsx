import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";

const LOGO_SRC = "/brand/logo.png?v=8";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt=""
      width={80}
      height={80}
      className={`object-contain ${className}`}
      aria-hidden="true"
    />
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
  const name = lang === "ar" ? "مكتب طوس العقارية" : "Tawoos Real Estate Office";
  const size =
    variant === "wide"
      ? "h-24 w-24 sm:h-28 sm:w-28"
      : "h-14 w-14";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center ${className}`}
      aria-label={name}
    >
      <img
        src={LOGO_SRC}
        alt={name}
        width={96}
        height={96}
        className={`${size} shrink-0 object-contain`}
      />
      {variant === "mark" ? <span className="sr-only">{name}</span> : null}
    </Link>
  );
}
