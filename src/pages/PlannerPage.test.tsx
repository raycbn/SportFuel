import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { describe, expect, it } from "vitest";
import { buildNutritionPlan } from "@/features/nutrition-engine";
import { PlanResult } from "@/components/PlanResult";
import { PlannerPage } from "@/pages/PlannerPage";

describe("success criterion UI", () => {
  it("shows ranges, timeline and shopping list for the guest cycling plan", () => {
    const plan = buildNutritionPlan({
      sport: "cycling",
      durationMinutes: 180,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    render(
      <HelmetProvider>
        <MemoryRouter>
          <PlanResult plan={plan} onNeedAuth={() => undefined} />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/Tu plan/i)).toBeInTheDocument();
    expect(screen.getByText(/Carbohidratos objetivo/i)).toBeInTheDocument();
    expect(screen.getByText(/g\/h$/)).toBeInTheDocument();
    expect(screen.getByText(/ml\/h$/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver plan completo/i })).toBeInTheDocument();
    expect(screen.getByText(/Reparte carbohidratos e hidratación/i)).toBeInTheDocument();
  });

  it("shows football strategy without opening the full plan", () => {
    const plan = buildNutritionPlan({
      sport: "football",
      durationMinutes: 90,
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: "mixed",
    });
    render(
      <HelmetProvider>
        <MemoryRouter>
          <PlanResult plan={plan} onNeedAuth={() => undefined} />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/partido intermitente/i)).toBeInTheDocument();
    expect(screen.getByText(/bandas de resistencia continua/i)).toBeInTheDocument();
  });
});

describe("PlannerPage PedalMap integration", () => {
  it("prefills inputs from PedalMap URL (caso A)", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/planner?source=pedalmap&sport=cycling&distanceKm=21.68&durationMinutes=53&elevationGainM=958&temperatureC=26"]}>
          <PlannerPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(53);
    expect(screen.getByLabelText(/Distancia \(km, opcional\)/i)).toHaveValue(21.68);
    expect(screen.getByLabelText(/Desnivel \(m, opcional\)/i)).toHaveValue(958);
    expect(screen.getByText(/Tu salida de PedalMap/i)).toBeInTheDocument();
  });

  it("prefills partial PedalMap URL and keeps defaults for missing fields (caso B)", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/planner?source=pedalmap&sport=cycling&distanceKm=21.68&durationMinutes=53"]}>
          <PlannerPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(53);
    expect(screen.getByLabelText(/Distancia \(km, opcional\)/i)).toHaveValue(21.68);
    expect(screen.getByLabelText(/Desnivel \(m, opcional\)/i)).toHaveValue(0);
  });

  it("does not overwrite manual edits after initial prefill (caso C)", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/planner?source=pedalmap&sport=cycling&durationMinutes=53"]}>
          <PlannerPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    const durationInput = screen.getByLabelText(/Duración \(min\)/i);
    expect(durationInput).toHaveValue(53);

    fireEvent.change(durationInput, { target: { value: "60" } });
    expect(durationInput).toHaveValue(60);
  });

  it("works normally without PedalMap params (caso D)", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/planner"]}>
          <PlannerPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(180);
    expect(screen.getByLabelText(/Distancia \(km, opcional\)/i)).toHaveValue(0);
    expect(screen.getByLabelText(/Desnivel \(m, opcional\)/i)).toHaveValue(0);
    expect(screen.queryByText(/Tu salida de PedalMap/i)).not.toBeInTheDocument();
  });

  it("rehydrates correctly on reload with PedalMap URL (caso E)", () => {
    const { unmount } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/planner?source=pedalmap&sport=cycling&durationMinutes=53&temperatureC=26"]}>
          <PlannerPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(53);

    unmount();

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/planner?source=pedalmap&sport=cycling&durationMinutes=53&temperatureC=26"]}>
          <PlannerPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(53);
  });

  it("prefills temperature from PedalMap and shows it in step 2", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/planner?source=pedalmap&sport=cycling&temperatureC=26"]}>
          <PlannerPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(screen.getByLabelText(/Temperatura \(°C\)/i)).toHaveValue(26);
  });
});
