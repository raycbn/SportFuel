import { afterEach, describe, expect, it, vi } from "vitest";

import { openSharedPremiumPortal, startSharedPremiumCheckout } from "@/lib/billing";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("shared PedalMap/Fuel billing", () => {
  it("starts the existing solo subscription with the shared Firebase identity", async () => {
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://pedalmap-api.example.test/");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ url: "https://checkout.stripe.com/c/pay_cs_example" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(startSharedPremiumCheckout("shared-firebase-token", "year")).resolves.toEqual({
      url: "https://checkout.stripe.com/c/pay_cs_example",
      interval: "year",
    });
    expect(fetchMock).toHaveBeenCalledWith("https://pedalmap-api.example.test/stripe/checkout", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer shared-firebase-token" }),
      body: JSON.stringify({ product: "solo", interval: "year" }),
    }));
  });

  it("does not create another subscription when the shared account is already subscribed", async () => {
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://pedalmap-api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "already_subscribed", error: "already subscribed" }), { status: 409 })));

    await expect(startSharedPremiumCheckout("shared-firebase-token", "month")).rejects.toMatchObject({
      name: "SharedBillingError",
      code: "already_subscribed",
      status: 409,
      message: "Esta cuenta ya tiene una suscripcion activa o en prueba. No se creara otra suscripcion.",
    });
  });

  it("requires a shared Firebase identity before checkout", async () => {
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://pedalmap-api.example.test");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(startSharedPremiumCheckout("", "month")).rejects.toMatchObject({ code: "auth_required" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects non-Stripe checkout URLs", async () => {
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://pedalmap-api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ url: "https://attacker.example/pay" }), { status: 200 })));

    await expect(startSharedPremiumCheckout("shared-firebase-token", "month")).rejects.toMatchObject({ code: "checkout_url_invalid" });
  });

  it("opens only the existing PedalMap billing portal on the official Stripe host", async () => {
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://pedalmap-api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ url: "https://billing.stripe.com/p/session_example" }), { status: 200 })));

    await expect(openSharedPremiumPortal("shared-firebase-token")).resolves.toEqual({
      url: "https://billing.stripe.com/p/session_example",
    });
  });

  it("rejects a non-Stripe billing portal URL", async () => {
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://pedalmap-api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ url: "https://attacker.example/billing" }), { status: 200 })));

    await expect(openSharedPremiumPortal("shared-firebase-token")).rejects.toMatchObject({ code: "portal_url_invalid" });
  });
});
