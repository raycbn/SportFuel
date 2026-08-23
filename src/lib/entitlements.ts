function apiBase(): string {
  return import.meta.env.VITE_PEDALMAP_API_URL?.replace(/\/$/, "") || "";
}

export type FuelPlan = "free" | "premium";

export interface Entitlements {
  ok: boolean;
  uid: string;
  email?: string | null;
  plan: FuelPlan;
  allowlisted: boolean;
  grupetaSeat: boolean;
  emailVerified: boolean;
  gpxExport: boolean;
  freeGpxRemaining: number | null;
  maxRoutesSaved: number | null;
  routesSaved: number;
  canSaveRoute: boolean;
}

export async function fetchEntitlements(idToken: string): Promise<Entitlements> {
  const base = apiBase();
  if (!base) {
    return {
      ok: true,
      uid: "",
      plan: "free",
      allowlisted: false,
      grupetaSeat: false,
      emailVerified: false,
      gpxExport: true,
      freeGpxRemaining: null,
      maxRoutesSaved: null,
      routesSaved: 0,
      canSaveRoute: true,
    };
  }
  const res = await fetch(`${base}/me/entitlements`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Entitlements failed: ${res.status}`);
  }
  const body = (await res.json()) as Omit<Entitlements, "plan"> & { plan: string };
  return {
    ...body,
    plan: body.plan === "premium" ? "premium" : "free",
  };
}
