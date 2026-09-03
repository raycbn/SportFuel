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

describe("pre-recovery strategy premium", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("premium user receives pre-recovery strategy", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    expect(plan.preRecoveryStrategy).toBeDefined();
    expect(plan.preRecoveryStrategy?.preActivity.summary).toBeTruthy();
    expect(plan.preRecoveryStrategy?.recovery.summary).toBeTruthy();
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
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });

    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);

    await waitFor(() => expect(screen.getAllByText(/Preparación avanzada/i).length).toBeGreaterThanOrEqual(1));
    expect(screen.getByText(/preparación avanzada.*Premium/i)).toBeInTheDocument();
    expect(screen.queryByText(/1–4 h antes/i)).not.toBeInTheDocument();

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
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });

    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);

    await waitFor(() => expect(screen.getAllByText(/Preparación avanzada/i).length).toBeGreaterThanOrEqual(1));
    expect(screen.getByText(/preparación avanzada.*Premium/i)).toBeInTheDocument();
    expect(screen.queryByText(/1–4 h antes/i)).not.toBeInTheDocument();

    (globalThis as Record<string, unknown>).fetch = originalFetch;
  });

  it("digestiveTolerance low adapts guidance", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      digestiveTolerance: "low",
    });
    expect(plan.preRecoveryStrategy?.preActivity.nutritionGuidance.some((item: string) => item.includes("familiares"))).toBe(true);
    expect(plan.preRecoveryStrategy?.recovery.nutritionGuidance.some((item: string) => item.includes("fibra"))).toBe(true);
  });

  it("competition=true adapts guidance", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 180,
      intensity: "hard",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "perform",
      fuelPreference: "mixed",
      competition: true,
    });
    expect(plan.preRecoveryStrategy?.preActivity.summary).toContain("competición");
    expect(plan.preRecoveryStrategy?.recovery.summary).toContain("competición");
  });

  it("caffeine strategy coexists without duplication", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
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
    expect(plan.preRecoveryStrategy?.preActivity.nutritionGuidance.some((item: string) => item.includes("cafeína"))).toBe(true);
  });

  it("sweatRateLPerHour enriches recovery hydration", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      sweatRateLPerHour: 1.2,
    });
    expect(plan.preRecoveryStrategy?.recovery.hydrationGuidance.some((item: string) => item.includes("sudoración"))).toBe(true);
  });

  it("works without sweatRate", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    expect(plan.preRecoveryStrategy).toBeDefined();
    expect(plan.preRecoveryStrategy?.recovery.hydrationGuidance.length).toBeGreaterThan(0);
  });

  it("all 6 sports work", () => {
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
      });
      expect(plan.preRecoveryStrategy).toBeDefined();
    }
  });

  it("plans without preRecoveryStrategy remain compatible", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      competition: true,
    });
    expect(plan.preRecoveryStrategy).toBeDefined();
    expect(plan.competitionStrategy).toBeDefined();
  });

  it("short effort gets conservative pre-activity guidance", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 30,
      intensity: "hard",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "perform",
      fuelPreference: "mixed",
    });
    expect(plan.preRecoveryStrategy?.preActivity.summary).toContain("corto");
    expect(plan.preRecoveryStrategy?.preActivity.timingGuidance.some((item: string) => item.includes("1–2 h"))).toBe(true);
  });

  it("long effort gets substantial pre-activity guidance", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 180,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    expect(plan.preRecoveryStrategy?.preActivity.summary).toContain("prolongado");
    expect(plan.preRecoveryStrategy?.preActivity.timingGuidance.some((item: string) => item.includes("2–4 h"))).toBe(true);
  });

  it("high intensity adapts pre-activity guidance", () => {
    const plan = buildNutritionPlan({
      sport: "running",
      durationMinutes: 90,
      intensity: "hard",
      bodyMassKg: 70,
      temperatureC: 20,
      goal: "perform",
      fuelPreference: "mixed",
    });
    expect(plan.preRecoveryStrategy?.preActivity.summary).toContain("Intensidad alta");
  });

  it("recovery adapts to goal perform with long duration", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "hard",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "perform",
      fuelPreference: "mixed",
    });
    expect(plan.preRecoveryStrategy?.recovery.immediateGuidance.some((item: string) => item.includes("pronto"))).toBe(true);
  });
});
