const HANDOFF_HASH_KEY = "pm_ct";

export function consumeHandoffFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash.includes("=") ? hash : "");
  let token = params.get(HANDOFF_HASH_KEY);
  if (!token && hash.startsWith(`${HANDOFF_HASH_KEY}=`)) {
    token = decodeURIComponent(hash.slice(HANDOFF_HASH_KEY.length + 1));
  }
  if (!token) return null;
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState({}, "", url.toString());
  return token;
}
