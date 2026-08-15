const fallback = "https://tranquil-basbousa-7fec55.netlify.app";

export function siteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  return fromEnv || fallback;
}
