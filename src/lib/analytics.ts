export type AnalyticsEvent =
  | "calculator_started"
  | "calculator_completed"
  | "plan_created"
  | "plan_saved"
  | "plan_shared"
  | "sweat_test_completed"
  | "shopping_list_created"
  | "premium_clicked"
  | "affiliate_clicked"
  | "signup_started"
  | "signup_completed";

const KEY = "sportfuel.analytics.v1";

export function track(event: AnalyticsEvent, payload: Record<string, string | number | boolean> = {}): void {
  const entry = { event, payload, at: new Date().toISOString() };
  try {
    const current = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown[];
    current.push(entry);
    localStorage.setItem(KEY, JSON.stringify(current.slice(-200)));
  } catch {
    /* private mode */
  }
  if (import.meta.env.DEV) {
    console.info("[analytics]", entry);
  }
}

export function readAnalytics(): Array<{ event: string; at: string }> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Array<{ event: string; at: string }>;
  } catch {
    return [];
  }
}
