/** Prefix public assets for GitHub Pages (`/tos/`) and local (`/`). */
export function publicUrl(path: string): string {
  if (!path) return path;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (base === "/") return normalized;
  return `${base.replace(/\/$/, "")}${normalized}`;
}
