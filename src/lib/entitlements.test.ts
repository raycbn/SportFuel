import { describe, expect, it, vi } from "vitest";

describe("entitlements", () => {
  it("returns free fallback when API_BASE is empty", async () => {
    const { fetchEntitlements } = await import("@/lib/entitlements");
    const result = await fetchEntitlements("fake-id-token");
    expect(result.plan).toBe("free");
    expect(result.ok).toBe(true);
    expect(result.uid).toBe("");
  });

  it("fetches entitlements from worker", async () => {
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://example.com");
    const { fetchEntitlements } = await import("@/lib/entitlements");

    const fakeJson = {
      ok: true,
      uid: "uid-123",
      email: "user@example.com",
      plan: "premium",
      allowlisted: false,
      grupetaSeat: false,
      emailVerified: true,
      gpxExport: true,
      freeGpxRemaining: null,
      maxRoutesSaved: null,
      routesSaved: 0,
      canSaveRoute: true,
    };
    const originalFetch = (globalThis as Record<string, unknown>).fetch;
    (globalThis as Record<string, unknown>).fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeJson),
      } as unknown as Response),
    );

    const result = await fetchEntitlements("valid-token");
    expect(result.plan).toBe("premium");
    expect(result.uid).toBe("uid-123");
    expect(result.email).toBe("user@example.com");

    (globalThis as Record<string, unknown>).fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("normalizes unknown plan to free", async () => {
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://example.com");
    const { fetchEntitlements } = await import("@/lib/entitlements");

    const originalFetch = (globalThis as Record<string, unknown>).fetch;
    (globalThis as Record<string, unknown>).fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ok: true, plan: "unknown" }),
      } as unknown as Response),
    );

    const result = await fetchEntitlements("token");
    expect(result.plan).toBe("free");

    (globalThis as Record<string, unknown>).fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("throws on non-ok response", async () => {
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://example.com");
    const { fetchEntitlements } = await import("@/lib/entitlements");

    const originalFetch = (globalThis as Record<string, unknown>).fetch;
    (globalThis as Record<string, unknown>).fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
      } as unknown as Response),
    );

    await expect(fetchEntitlements("bad-token")).rejects.toThrow("401");

    (globalThis as Record<string, unknown>).fetch = originalFetch;
    vi.unstubAllEnvs();
  });
});
