import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
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

describe("competition mode premium", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("competition=false keeps normal behavior", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      competition: false,
    });
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.queryByText(/Día de competición/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Carbohidratos objetivo/i)).toBeInTheDocument();
  });

  it("premium user gets competition strategy", async () => {
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
      competition: true,
    });

    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);

    await waitFor(() => expect(screen.getByText(/Día de competición/i)).toBeInTheDocument());
    expect(screen.getByText(/Pre-salida/i)).toBeInTheDocument();
    expect(screen.getByText(/Durante/i)).toBeInTheDocument();
    expect(screen.getByText(/Meta y primeros minutos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Recuperación/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Estrategia de emergencia/i)).toBeInTheDocument();

    (globalThis as Record<string, unknown>).fetch = originalFetch;
  });

  it("short duration generates minimal competition timeline", () => {
    const plan = buildNutritionPlan({
      sport: "running",
      durationMinutes: 30,
      intensity: "hard",
      bodyMassKg: 70,
      temperatureC: 20,
      goal: "perform",
      fuelPreference: "mixed",
      competition: true,
    });
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.getByText(/Día de competición/i)).toBeInTheDocument();
    const preStartEvents = screen.getAllByText(/Comida principal|Preparación final/);
    expect(preStartEvents.length).toBeGreaterThan(0);
  });

  it("long duration generates extended competition timeline", () => {
    const plan = buildNutritionPlan({
      sport: "trail",
      durationMinutes: 300,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 18,
      goal: "complete",
      fuelPreference: "real-food",
      competition: true,
    });
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.getByText(/Día de competición/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Punto de control/i).length).toBeGreaterThan(1);
  });

  it("all 6 sports generate competition strategy", () => {
    const sports = ["cycling", "running", "trail", "hiking", "triathlon", "football"] as const;
    for (const sport of sports) {
      cleanup();
      const plan = buildNutritionPlan({
        sport,
        durationMinutes: 90,
        intensity: "moderate",
        bodyMassKg: 75,
        temperatureC: 25,
        goal: "train",
        fuelPreference: "mixed",
        competition: true,
      });
      renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
      expect(screen.getByText(/Día de competición/i)).toBeInTheDocument();
    }
  });

  it("competition strategy reuses motor quantities", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 120,
      intensity: "hard",
      bodyMassKg: 80,
      temperatureC: 28,
      goal: "perform",
      fuelPreference: "sports-products",
      competition: true,
    });
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.getByText(/Día de competición/i)).toBeInTheDocument();
    expect(screen.getByText(/Pre-salida/i)).toBeInTheDocument();
    expect(screen.getAllByText(/g CHO/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ml/i).length).toBeGreaterThan(0);
  });

  it("normal timeline still renders without regression", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      competition: false,
    });
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.getByText(/Carbohidratos objetivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Hidratación orientativa/i)).toBeInTheDocument();
    expect(screen.queryByText(/Día de competición/i)).not.toBeInTheDocument();
  });
});
