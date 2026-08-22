const fallback = "https://fuel.pedalmap.es";

export function siteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  return fromEnv || fallback;
}
