export type SharedCheckoutInterval = "month" | "year";

export class SharedBillingError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(message: string, options: { code?: unknown; status?: number } = {}) {
    super(message);
    this.name = "SharedBillingError";
    this.code = typeof options.code === "string" ? options.code : undefined;
    this.status = options.status;
  }
}

function apiBase(): string {
  return import.meta.env.VITE_PEDALMAP_API_URL?.replace(/\/+$/, "") || "";
}

function isHostedStripeUrl(value: unknown, host: "checkout.stripe.com" | "billing.stripe.com"): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.origin === `https://${host}` && !url.username && !url.password;
  } catch {
    return false;
  }
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const value: unknown = await response.json().catch(() => ({}));
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getApiError(body: Record<string, unknown>, response: Response, fallback: string): SharedBillingError {
  const code = typeof body.code === "string" ? body.code : undefined;
  const apiMessage = typeof body.error === "string" ? body.error : fallback;
  if (code === "already_subscribed") {
    return new SharedBillingError(
      "Esta cuenta ya tiene una suscripcion activa o en prueba. No se creara otra suscripcion.",
      { code, status: response.status },
    );
  }
  return new SharedBillingError(apiMessage, { code, status: response.status });
}

/** Starts the single PedalMap subscription, which grants Premium in both PedalMap and Fuel. */
export async function startSharedPremiumCheckout(
  firebaseIdToken: string,
  interval: SharedCheckoutInterval,
): Promise<{ url: string; interval: SharedCheckoutInterval }> {
  const base = apiBase();
  if (!base) throw new SharedBillingError("La facturacion compartida no esta configurada.");
  if (!firebaseIdToken.trim()) {
    throw new SharedBillingError("Inicia sesion con tu cuenta compartida de PedalMap.", { code: "auth_required" });
  }

  const response = await fetch(`${base}/stripe/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product: "solo", interval }),
  });
  const body = await readJson(response);
  if (!response.ok) throw getApiError(body, response, "No se pudo iniciar el checkout compartido.");
  if (!isHostedStripeUrl(body.url, "checkout.stripe.com")) {
    throw new SharedBillingError("La URL de Checkout recibida no es valida.", { code: "checkout_url_invalid" });
  }
  return { url: body.url, interval };
}

/** Opens the existing PedalMap billing portal; Fuel never manages a separate subscription. */
export async function openSharedPremiumPortal(firebaseIdToken: string): Promise<{ url: string }> {
  const base = apiBase();
  if (!base) throw new SharedBillingError("La facturacion compartida no esta configurada.");
  if (!firebaseIdToken.trim()) {
    throw new SharedBillingError("Inicia sesion con tu cuenta compartida de PedalMap.", { code: "auth_required" });
  }

  const response = await fetch(`${base}/stripe/portal`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const body = await readJson(response);
  if (!response.ok) throw getApiError(body, response, "No se pudo abrir el portal de facturacion.");
  if (!isHostedStripeUrl(body.url, "billing.stripe.com")) {
    throw new SharedBillingError("La URL del portal de facturacion no es valida.", { code: "portal_url_invalid" });
  }
  return { url: body.url };
}
