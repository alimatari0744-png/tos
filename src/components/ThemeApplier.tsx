import { useEffect } from "react";
import { useSettings } from "@/lib/site-data";

/**
 * Applies the admin-configured primary color to the document at runtime
 * by overriding the CSS custom properties used across the design system.
 */
export function ThemeApplier() {
  const { data: settings } = useSettings();
  const color = settings?.primary_color?.trim();

  useEffect(() => {
    const root = document.documentElement;
    if (color) {
      root.style.setProperty("--primary", color);
      root.style.setProperty("--ring", color);
      root.style.setProperty(
        "--primary-glow",
        `color-mix(in oklab, ${color} 78%, white)`,
      );
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--primary-glow");
    }
  }, [color]);

  return null;
}
