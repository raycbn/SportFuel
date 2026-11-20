import { afterEach, describe, expect, it, vi } from "vitest";

describe("Firebase client configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses PedalMap's shared Firebase project in production", async () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_FIREBASE_API_KEY", "stale-key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "stale.example.com");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "stale-project");

    const { readFirebaseConfig } = await import("./firebase");
    const config = readFirebaseConfig();

    expect(config?.projectId).toBe("pedalmap-79b3a");
    expect(config?.authDomain).toBe("pedalmap-79b3a.firebaseapp.com");
    expect(config?.apiKey).toBeTruthy();
    expect(config?.apiKey).not.toBe("stale-key");
  });

  it("uses environment Firebase settings during development", async () => {
    vi.stubEnv("PROD", false);
    vi.stubEnv("VITE_FIREBASE_API_KEY", "dev-key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "dev.example.com");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "dev-project");

    const { readFirebaseConfig } = await import("./firebase");
    expect(readFirebaseConfig()).toEqual({
      apiKey: "dev-key",
      authDomain: "dev.example.com",
      projectId: "dev-project",
    });
  });

  it("returns null in development when Firebase settings are incomplete", async () => {
    vi.stubEnv("PROD", false);
    vi.stubEnv("VITE_FIREBASE_API_KEY", "dev-key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "dev-project");

    const { readFirebaseConfig } = await import("./firebase");
    expect(readFirebaseConfig()).toBeNull();
  });
});
