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

describe("digestive adaptation premium", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("undefined tolerance produces standard plan without adaptation", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    expect(plan.digestiveAdaptation).toBeUndefined();
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.queryByText(/Adaptación digestiva/i)).not.toBeInTheDocument();
  });

  it("low tolerance produces adaptation for premium user", async () => {
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
            plan: "premium",
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
      digestiveTolerance: "low",
    });

    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);

    await waitFor(() => expect(screen.getByText(/Adaptación digestiva/i)).toBeInTheDocument());
    expect(screen.getByText(/Plan conservador/i)).toBeInTheDocument();
    expect(screen.getByText(/Timing/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Alimentos/i).length).toBeGreaterThanOrEqual(1);

    (globalThis as Record<string, unknown>).fetch = originalFetch;
  });

  it("free user sees CTA instead of premium adaptation", async () => {
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
      digestiveTolerance: "low",
    });

    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);

    await waitFor(() => expect(screen.getAllByText(/Adaptación digestiva/i).length).toBeGreaterThanOrEqual(1));
    expect(screen.getByText(/adaptación avanzada.*Premium/i)).toBeInTheDocument();
    expect(screen.queryByText(/Plan conservador/i)).not.toBeInTheDocument();

    (globalThis as Record<string, unknown>).fetch = originalFetch;
  });

  it("trained tolerance produces trained adaptation", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 180,
      intensity: "hard",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "perform",
      fuelPreference: "mixed",
      digestiveTolerance: "trained",
    });
    expect(plan.digestiveAdaptation?.tolerance).toBe("trained");
    expect(plan.digestiveAdaptation?.summary).toContain("densidad");
  });

  it("normal tolerance produces standard adaptation", () => {
    const plan = buildNutritionPlan({
      sport: "running",
      durationMinutes: 60,
      intensity: "moderate",
      bodyMassKg: 70,
      temperatureC: 20,
      goal: "train",
      fuelPreference: "mixed",
      digestiveTolerance: "normal",
    });
    expect(plan.digestiveAdaptation?.tolerance).toBe("normal");
    expect(plan.digestiveAdaptation?.summary).toContain("estándar");
  });

  it("all 6 sports work with digestive adaptation", () => {
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
        digestiveTolerance: "low",
      });
      expect(plan.digestiveAdaptation?.tolerance).toBe("low");
    }
  });

  it("does not double-adjust carbohydrates", () => {
    const planLow = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      digestiveTolerance: "low",
    });
    const planNormal = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      digestiveTolerance: "normal",
    });
    const planTrained = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      digestiveTolerance: "trained",
    });

    const lowMax = planLow.carbohydrate.gramsPerHourMax;
    const normalMax = planNormal.carbohydrate.gramsPerHourMax;
    const trainedMax = planTrained.carbohydrate.gramsPerHourMax;

    expect(lowMax).toBeLessThan(normalMax);
    expect(trainedMax).toBeGreaterThanOrEqual(normalMax);
  });

  it("plans without digestiveTolerance remain compatible", () => {
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
    expect(plan.digestiveAdaptation).toBeUndefined();
    expect(plan.competitionStrategy).toBeDefined();
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.getByText(/Día de competición/i)).toBeInTheDocument();
    expect(screen.queryByText(/Adaptación digestiva/i)).not.toBeInTheDocument();
  });

  it("competition=true does not conflict with digestive adaptation", () => {
    const plan = buildNutritionPlan({
      sport: "trail",
      durationMinutes: 180,
      intensity: "hard",
      bodyMassKg: 75,
      temperatureC: 20,
      goal: "complete",
      fuelPreference: "real-food",
      competition: true,
      digestiveTolerance: "low",
    });
    expect(plan.competitionStrategy).toBeDefined();
    expect(plan.digestiveAdaptation).toBeDefined();
    expect(plan.digestiveAdaptation?.tolerance).toBe("low");
  });

  it("guest user does not receive premium adaptation", async () => {
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
      digestiveTolerance: "low",
    });

    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);

    await waitFor(() => expect(screen.getAllByText(/Adaptación digestiva/i).length).toBeGreaterThanOrEqual(1));
    expect(screen.getByText(/adaptación avanzada.*Premium/i)).toBeInTheDocument();
    expect(screen.queryByText(/Plan conservador/i)).not.toBeInTheDocument();

    (globalThis as Record<string, unknown>).fetch = originalFetch;
  });
});
