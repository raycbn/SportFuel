import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { describe, expect, it } from "vitest";
import { buildNutritionPlan } from "@/features/nutrition-engine";
import { PlanResult } from "@/components/PlanResult";

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
