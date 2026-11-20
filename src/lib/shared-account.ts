export type SharedPlanInterval = "month" | "year";

/** Internal Fuel login route that authenticates against the same Firebase project as PedalMap. */
export function buildSharedAccountSignInPath(interval: SharedPlanInterval = "year"): string {
  const next = `/premium?interval=${interval}`;
  const params = new URLSearchParams({ shared: "1", next });
  return `/login?${params.toString()}`;
}