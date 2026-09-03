import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { buildNutritionPlan } from "@/features/nutrition-engine";
import { PlanResult } from "@/components/PlanResult";
import { FuelAuthProvider } from "@/contexts/AuthContext";

const mockUnsub = () => {};

vi.mock("firebase/auth", () => {
  const mockAuth = {
    onAuthStateChanged: vi.fn(),
    signInWithCustomToken: vi.fn(),
    signOut: vi.fn(),
    getIdToken: vi.fn(),
  };
  return {
    getAuth: vi.fn(() => mockAuth),
    onAuthStateChanged: mockAuth.onAuthStateChanged,
    signInWithCustomToken: mockAuth.signInWithCustomToken,
    signOut: mockAuth.signOut,
    getIdToken: mockAuth.getIdToken,
  };
});

function renderWithProviders(ui: React.ReactElement, options?: { initialEntries?: string[] }) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={options?.initialEntries}>
        <FuelAuthProvider>{ui}</FuelAuthProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("caffeine strategy premium", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("caffeinePreferred=false produces no strategy", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: false,
    });
    expect(plan.caffeineStrategy).toBeUndefined();
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.queryByText(/Estrategia de cafeína/i)).not.toBeInTheDocument();
  });

  it("premium user receives caffeine strategy", async () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
      caffeineHabit: "moderate",
      caffeineSensitivity: "normal",
    });
    expect(plan.caffeineStrategy?.active).toBe(true);
    expect(plan.caffeineStrategy?.dose.mgTotalMax).toBeGreaterThan(0);
    expect(plan.caffeineStrategy?.timing).toBeTruthy();
    expect(plan.caffeineStrategy?.sourceGuidance.length).toBeGreaterThan(0);
  });

  it("free user sees CTA instead of premium strategy", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "domain");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "project");
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://example.com");

    const { getAuth, onAuthStateChanged, getIdToken } = await import("firebase/auth");
    (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, cb: (u: { uid: string } | null) => void) => {
      setTimeout(() => cb({ uid: "uid-1" } as unknown as null), 0);
      return mockUnsub;
    });
    (getIdToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("id-token");
    (getAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ getIdToken });

    const originalFetch = (globalThis as Record<string, unknown>).fetch;
    (globalThis as Record<string, unknown>).fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            uid: "uid-1",
            plan: "free",
            allowlisted: false,
            grupetaSeat: false,
            emailVerified: true,
            gpxExport: true,
            freeGpxRemaining: null,
            maxRoutesSaved: null,
            routesSaved: 0,
            canSaveRoute: true,
          }),
      } as unknown as Response),
    );

    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
    });

    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);

    await waitFor(() => expect(screen.getAllByText(/Estrategia de cafeína/i).length).toBeGreaterThanOrEqual(1));
    expect(screen.getByText(/estrategia de cafeína avanzada/i)).toBeInTheDocument();
    expect(screen.queryByText(/Objetivo orientativo/i)).not.toBeInTheDocument();

    (globalThis as Record<string, unknown>).fetch = originalFetch;
  });

  it("guest user sees CTA instead of premium strategy", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "domain");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "project");
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://example.com");

    const { getAuth, onAuthStateChanged, getIdToken } = await import("firebase/auth");
    (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, cb: (u: { uid: string } | null) => void) => {
      setTimeout(() => cb(null), 0);
      return mockUnsub;
    });
    (getIdToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (getAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ getIdToken });

    const originalFetch = (globalThis as Record<string, unknown>).fetch;
    (globalThis as Record<string, unknown>).fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            uid: null,
            plan: "guest",
            allowlisted: false,
            grupetaSeat: false,
            emailVerified: false,
            gpxExport: false,
            freeGpxRemaining: null,
            maxRoutesSaved: null,
            routesSaved: 0,
            canSaveRoute: false,
          }),
      } as unknown as Response),
    );

    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
    });

    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);

    await waitFor(() => expect(screen.getAllByText(/Estrategia de cafeína/i).length).toBeGreaterThanOrEqual(1));
    expect(screen.getByText(/estrategia de cafeína avanzada/i)).toBeInTheDocument();
    expect(screen.queryByText(/Objetivo orientativo/i)).not.toBeInTheDocument();

    (globalThis as Record<string, unknown>).fetch = originalFetch;
  });

  it("short effort does not recommend caffeine aggressively", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 30,
      intensity: "hard",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "perform",
      fuelPreference: "mixed",
      caffeinePreferred: true,
      caffeineHabit: "none",
      caffeineSensitivity: "normal",
    });
    expect(plan.caffeineStrategy?.active).toBe(true);
    expect(plan.caffeineStrategy?.summary).toContain("limitado");
  });

  it("sensitive user gets conservative dose", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 80,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
      caffeineHabit: "none",
      caffeineSensitivity: "sensitive",
    });
    expect(plan.caffeineStrategy?.dose.mgTotalMax).toBeLessThanOrEqual(100);
    expect(plan.caffeineStrategy?.dose.mgPerKgMax).toBeLessThanOrEqual(3);
  });

  it("normal sensitivity uses standard range", () => {
    const plan = buildNutritionPlan({
      sport: "running",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 70,
      temperatureC: 20,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
      caffeineHabit: "low",
      caffeineSensitivity: "normal",
    });
    expect(plan.caffeineStrategy?.dose.mgPerKgMax).toBeGreaterThanOrEqual(3);
    expect(plan.caffeineStrategy?.dose.mgPerKgMax).toBeLessThanOrEqual(6);
  });

  it("resistant user does not exceed conservative cap", () => {
    const plan = buildNutritionPlan({
      sport: "trail",
      durationMinutes: 180,
      intensity: "hard",
      bodyMassKg: 75,
      temperatureC: 15,
      goal: "complete",
      fuelPreference: "real-food",
      caffeinePreferred: true,
      caffeineHabit: "high",
      caffeineSensitivity: "resistant",
    });
    expect(plan.caffeineStrategy?.dose.mgTotalMax).toBeLessThanOrEqual(200);
    expect(plan.caffeineStrategy?.dose.capped).toBe(true);
  });

  it("caps at 200 mg per single intake for normal sensitivity", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 180,
      intensity: "hard",
      bodyMassKg: 120,
      temperatureC: 25,
      goal: "perform",
      fuelPreference: "mixed",
      caffeinePreferred: true,
      caffeineHabit: "high",
      caffeineSensitivity: "normal",
    });
    expect(plan.caffeineStrategy?.dose.mgTotalMax).toBeLessThanOrEqual(200);
    expect(plan.caffeineStrategy?.dose.capped).toBe(true);
  });

  it("does not modify carbohydrate targets", () => {
    const planWithCaffeine = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
    });
    const planWithoutCaffeine = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: false,
    });
    expect(planWithCaffeine.carbohydrate.gramsPerHourMax).toBe(planWithoutCaffeine.carbohydrate.gramsPerHourMax);
    expect(planWithCaffeine.hydration.mlPerHourMax).toBe(planWithoutCaffeine.hydration.mlPerHourMax);
    expect(planWithCaffeine.electrolytes.sodiumMgPerHourMax).toBe(planWithoutCaffeine.electrolytes.sodiumMgPerHourMax);
  });

  it("all 6 sports work with caffeine strategy", () => {
    const sports = ["cycling", "running", "trail", "hiking", "triathlon", "football"] as const;
    for (const sport of sports) {
      const plan = buildNutritionPlan({
        sport,
        durationMinutes: 90,
        intensity: "moderate",
        bodyMassKg: 75,
        temperatureC: 25,
        goal: "train",
        fuelPreference: "mixed",
        caffeinePreferred: true,
      });
      expect(plan.caffeineStrategy?.active).toBe(true);
    }
  });

  it("compatible with competition=true", () => {
    const plan = buildNutritionPlan({
      sport: "trail",
      durationMinutes: 180,
      intensity: "hard",
      bodyMassKg: 75,
      temperatureC: 20,
      goal: "complete",
      fuelPreference: "real-food",
      competition: true,
      caffeinePreferred: true,
    });
    expect(plan.competitionStrategy).toBeDefined();
    expect(plan.caffeineStrategy?.active).toBe(true);
  });

  it("compatible with digestiveTolerance=low", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
      digestiveTolerance: "low",
    });
    expect(plan.digestiveAdaptation).toBeDefined();
    expect(plan.caffeineStrategy?.active).toBe(true);
    expect(plan.caffeineStrategy?.summary).toBeTruthy();
  });

  it("plans without caffeineStrategy remain compatible", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    expect(plan.caffeineStrategy).toBeUndefined();
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.queryByText(/Estrategia de cafeína/i)).not.toBeInTheDocument();
  });

  it("shows sleep warning", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
    });
    expect(plan.caffeineStrategy?.sleepWarning).toContain("sueño");
  });

  it("shows stacking warning", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
    });
    expect(plan.caffeineStrategy?.stackingWarning).toContain("suma");
  });

  it("shows disclaimer", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      caffeinePreferred: true,
    });
    expect(plan.caffeineStrategy?.disclaimer).toContain("profesional sanitario");
  });
});
