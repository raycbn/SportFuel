import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildNutritionPlan } from "@/features/nutrition-engine";
import { PlanResult } from "@/components/PlanResult";
import { PlannerPage } from "@/pages/PlannerPage";
import { FuelAuthContext, FuelAuthProvider } from "@/contexts/AuthContext";

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

describe("success criterion UI", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("shows ranges, timeline and shopping list for the guest cycling plan", async () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 180,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.getAllByText(/Tu plan/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Carbohidratos objetivo/i)).toBeInTheDocument();
    expect(screen.getByText(/g\/h$/)).toBeInTheDocument();
    expect(screen.getByText(/ml\/h$/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver plan completo/i })).toBeInTheDocument();
    expect(screen.getByText(/Reparte carbohidratos e hidratación/i)).toBeInTheDocument();
  });

  it("uses Fuel saved plans instead of PedalMap route usage for the Free quota", () => {
    const email = "quota@example.com";
    const plansKey = "sportfuel.saved-plans.v1";
    localStorage.setItem(
      plansKey,
      JSON.stringify(Array.from({ length: 3 }, (_, index) => ({ id: `saved-${index}`, ownerEmail: email }))),
    );
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 180,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    const auth = {
      user: { email } as never,
      localUser: null,
      provider: "pedalmap" as const,
      loading: false,
      firebaseReady: true,
      plan: "free" as const,
      entitlementLoading: false,
      entitlementError: false,
      canSaveRoute: false,
      maxRoutesSaved: 5,
      routesSaved: 0,
      loginLocal: vi.fn(),
      registerLocal: vi.fn(),
      logout: vi.fn(async () => undefined),
      handoffLogin: vi.fn(async () => undefined),
    };

    try {
      render(
        <HelmetProvider>
          <MemoryRouter>
            <FuelAuthContext.Provider value={auth as never}>
              <PlanResult plan={plan} onNeedAuth={() => undefined} />
            </FuelAuthContext.Provider>
          </MemoryRouter>
        </HelmetProvider>,
      );
      expect(screen.getByRole("button", { name: /Límite de planes alcanzado/i })).toBeInTheDocument();
      expect(screen.getByText(/límite de 3 planes guardados en modo Free/i)).toBeInTheDocument();
    } finally {
      localStorage.removeItem(plansKey);
    }
  });

  it("keeps the detailed competition timeline Premium-only even for a shared plan", () => {
    const plansKey = "sportfuel.saved-plans.v1";
    localStorage.setItem(plansKey, "[]");
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 180,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
      competition: true,
    });
    const auth = {
      user: { email: "free@example.com" } as never,
      localUser: null,
      provider: "pedalmap" as const,
      loading: false,
      firebaseReady: true,
      plan: "free" as const,
      entitlementLoading: false,
      entitlementError: false,
      canSaveRoute: false,
      maxRoutesSaved: 5,
      routesSaved: 0,
      loginLocal: vi.fn(),
      registerLocal: vi.fn(),
      logout: vi.fn(async () => undefined),
      handoffLogin: vi.fn(async () => undefined),
    };

    try {
      render(
        <HelmetProvider>
          <MemoryRouter>
            <FuelAuthContext.Provider value={auth as never}>
              <PlanResult plan={plan} onNeedAuth={() => undefined} />
            </FuelAuthContext.Provider>
          </MemoryRouter>
        </HelmetProvider>,
      );
      expect(plan.competitionStrategy).toBeDefined();
      expect(screen.getByText(/timeline estructurado de competición.*Premium/i)).toBeInTheDocument();
      expect(screen.queryByText(plan.competitionStrategy!.summary)).not.toBeInTheDocument();
    } finally {
      localStorage.removeItem(plansKey);
    }
  });

  it("shows football strategy without opening the full plan", async () => {
    const plan = buildNutritionPlan({
      sport: "football",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    renderWithProviders(<PlanResult plan={plan} onNeedAuth={() => undefined} />);
    expect(screen.getByText(/partido intermitente/i)).toBeInTheDocument();
    expect(screen.getByText(/bandas de resistencia continua/i)).toBeInTheDocument();
  });
});

describe("PlannerPage PedalMap integration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("prefills inputs from PedalMap URL (caso A)", () => {
    renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&distanceKm=21.68&durationMinutes=53&elevationGainM=958&temperatureC=26"],
      }
    );

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(53);
    expect(screen.getByLabelText(/Distancia \(km, opcional\)/i)).toHaveValue(21.68);
    expect(screen.getByLabelText(/Desnivel \(m, opcional\)/i)).toHaveValue(958);
    expect(screen.getByText(/Tu salida de PedalMap/i)).toBeInTheDocument();
  });

  it("prefills partial PedalMap URL and keeps defaults for missing fields (caso B)", () => {
    renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&distanceKm=21.68&durationMinutes=53"],
      }
    );

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(53);
    expect(screen.getByLabelText(/Distancia \(km, opcional\)/i)).toHaveValue(21.68);
    expect(screen.getByLabelText(/Desnivel \(m, opcional\)/i)).toHaveValue(0);
  });

  it("does not overwrite manual edits after initial prefill (caso C)", () => {
    renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&durationMinutes=53"],
      }
    );

    const durationInput = screen.getByLabelText(/Duración \(min\)/i);
    expect(durationInput).toHaveValue(53);

    fireEvent.change(durationInput, { target: { value: "60" } });
    expect(durationInput).toHaveValue(60);
  });

  it("works normally without PedalMap params (caso D)", () => {
    renderWithProviders(<PlannerPage />, { initialEntries: ["/planner"] });

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(180);
    expect(screen.getByLabelText(/Distancia \(km, opcional\)/i)).toHaveValue(0);
    expect(screen.getByLabelText(/Desnivel \(m, opcional\)/i)).toHaveValue(0);
    expect(screen.queryByText(/Tu salida de PedalMap/i)).not.toBeInTheDocument();
  });

  it("rehydrates correctly on reload with PedalMap URL (caso E)", () => {
    const { unmount } = renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&durationMinutes=53&temperatureC=26"],
      }
    );

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(53);

    unmount();

    renderWithProviders(<PlannerPage />, {
      initialEntries: ["/planner?source=pedalmap&sport=cycling&durationMinutes=53&temperatureC=26"],
    });

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(53);
  });

  it("prefills temperature from PedalMap and shows it in step 2", () => {
    renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&temperatureC=26"],
      }
    );

    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(screen.getByLabelText(/Temperatura \(°C\)/i)).toHaveValue(26);
  });

  it("accepts decimal distance from PedalMap and preserves manual decimal edit", () => {
    renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&distanceKm=21.68&durationMinutes=53&elevationGainM=95&temperatureC=26"],
      }
    );

    const distanceInput = screen.getByLabelText(/Distancia \(km, opcional\)/i);
    expect(distanceInput).toHaveValue(21.68);
    expect(distanceInput).toHaveAttribute("step", "0.1");

    fireEvent.change(distanceInput, { target: { value: "30.5" } });
    expect(distanceInput).toHaveValue(30.5);
  });

  it("works with rounded decimal distance from PedalMap (21.6 km)", () => {
    renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&distanceKm=21.6&durationMinutes=53&elevationGainM=95&temperatureC=26"],
      }
    );

    expect(screen.getByLabelText(/Distancia \(km, opcional\)/i)).toHaveValue(21.6);
    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(53);
    expect(screen.getByLabelText(/Desnivel \(m, opcional\)/i)).toHaveValue(95);
    expect(screen.getByText(/Tu salida de PedalMap/i)).toBeInTheDocument();
  });

  it("formats duration with decimal minutes as 'X h Y min' in route summary", () => {
    renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&distanceKm=30.8&durationMinutes=78.96666666666667&elevationGainM=311&temperatureC=26"],
      }
    );

    expect(screen.getByText("1 h 19 min")).toBeInTheDocument();
    expect(screen.queryByText(/78\.96/)).not.toBeInTheDocument();
  });

  it("formats duration under 60 minutes as 'XX min' in route summary", () => {
    renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&distanceKm=21.68&durationMinutes=45&elevationGainM=958&temperatureC=26"],
      }
    );

    expect(screen.getByText("45 min")).toBeInTheDocument();
  });

  it("formats duration of 120 minutes as '2 h' in route summary", () => {
    renderWithProviders(
      <PlannerPage />,
      {
        initialEntries: ["/planner?source=pedalmap&sport=cycling&distanceKm=40&durationMinutes=120&elevationGainM=311&temperatureC=26"],
      }
    );

    expect(screen.getByText("2 h")).toBeInTheDocument();
  });
});
