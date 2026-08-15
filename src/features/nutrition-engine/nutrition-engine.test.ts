import { describe, expect, it } from "vitest";
import { buildNutritionPlan } from "./calculators/build-plan";
import { calculateCarbohydrate } from "./calculators/carbohydrate";
import { calculateHydration } from "./calculators/hydration";
import { calculateSweatRate, validateSweatRateInput } from "./calculators/sweat-rate";
import { validatePlannerInput } from "./calculators/validate";
import { OUTPUT_CAPS } from "./rules/limits";
import type { PlannerInput } from "./models/types";

const base = (overrides: Partial<PlannerInput> = {}): PlannerInput => ({
  sport: "cycling",
  durationMinutes: 180,
  intensity: "moderate",
  bodyMassKg: 75,
  temperatureC: 25,
  goal: "train",
  fuelPreference: "mixed",
  ...overrides,
});

describe("validatePlannerInput", () => {
  it("rejects missing and extreme values", () => {
    expect(validatePlannerInput({}).length).toBeGreaterThan(0);
    expect(validatePlannerInput(base({ bodyMassKg: -10 }))[0]?.code).toBe("range");
    expect(validatePlannerInput(base({ durationMinutes: 0 })).some((i) => i.field === "durationMinutes")).toBe(true);
    expect(validatePlannerInput(base({ temperatureC: 80 })).some((i) => i.field === "temperatureC")).toBe(true);
    expect(validatePlannerInput(base({ bodyMassKg: 10 })).some((i) => i.field === "bodyMassKg")).toBe(true);
  });

  it("accepts the success-criterion input", () => {
    expect(validatePlannerInput(base())).toEqual([]);
  });
});

describe("carbohydrate engine", () => {
  it("does not use a universal number and stays inside evidence caps", () => {
    const short = calculateCarbohydrate(base({ durationMinutes: 30 }));
    const mid = calculateCarbohydrate(base({ durationMinutes: 90 }));
    const long = calculateCarbohydrate(base({ durationMinutes: 210, intensity: "hard", goal: "perform" }));
    expect(short.gramsPerHourTypical).toBe(0);
    expect(mid.gramsPerHourMin).toBeGreaterThanOrEqual(30);
    expect(mid.gramsPerHourMax).toBeLessThanOrEqual(60);
    expect(long.gramsPerHourMax).toBeLessThanOrEqual(OUTPUT_CAPS.carbohydrateGPerHour.max);
    expect(long.multipleTransportableRecommended).toBe(true);
  });

  it("lowers the typical point for easy / complete and running vs cycling", () => {
    const hardBike = calculateCarbohydrate(base({ intensity: "hard", goal: "perform" }));
    const easyRun = calculateCarbohydrate(base({ sport: "running", intensity: "easy", goal: "complete" }));
    expect(easyRun.gramsPerHourTypical).toBeLessThan(hardBike.gramsPerHourTypical);
  });

  it("never returns negative or absurd carbohydrate rates", () => {
    const cases: PlannerInput[] = [
      base({ durationMinutes: 15, intensity: "easy" }),
      base({ durationMinutes: 720, intensity: "hard", goal: "perform", digestiveTolerance: "trained" }),
      base({ sport: "hiking", durationMinutes: 240, intensity: "easy" }),
    ];
    for (const input of cases) {
      const result = calculateCarbohydrate(input);
      expect(result.gramsPerHourMin).toBeGreaterThanOrEqual(0);
      expect(result.gramsPerHourMax).toBeLessThanOrEqual(90);
      expect(result.gramsPerHourTypical).toBeGreaterThanOrEqual(result.gramsPerHourMin);
      expect(result.gramsPerHourTypical).toBeLessThanOrEqual(result.gramsPerHourMax);
    }
  });
});

describe("hydration and electrolytes", () => {
  it("returns a range, not a single exact prescription", () => {
    const hydro = calculateHydration(base());
    expect(hydro.mlPerHourMax).toBeGreaterThan(hydro.mlPerHourMin);
    expect(hydro.mlPerHourTypical).toBeGreaterThanOrEqual(hydro.mlPerHourMin);
    expect(hydro.mlPerHourMax).toBeLessThanOrEqual(OUTPUT_CAPS.hydrationMlPerHour.max);
    expect(hydro.usedMeasuredSweatRate).toBe(false);
  });

  it("uses measured sweat rate when provided and does not exceed it as max", () => {
    const hydro = calculateHydration(base({ sweatRateLPerHour: 1.0 }));
    expect(hydro.usedMeasuredSweatRate).toBe(true);
    expect(hydro.mlPerHourMax).toBeLessThanOrEqual(1000);
  });

  it("increases the range in heat vs cold", () => {
    const cold = calculateHydration(base({ temperatureC: 8 }));
    const hot = calculateHydration(base({ temperatureC: 34, intensity: "hard" }));
    expect(hot.mlPerHourTypical).toBeGreaterThan(cold.mlPerHourTypical);
  });
});

describe("success criterion plan", () => {
  it("builds a complete guest plan for cycling 3h moderate 75kg 25C", () => {
    const plan = buildNutritionPlan(base());
    expect(plan.calculatorReady).toBe(true);
    expect(plan.carbohydrate.gramsPerHourMin).toBeGreaterThanOrEqual(40);
    expect(plan.carbohydrate.gramsPerHourMax).toBeLessThanOrEqual(80);
    expect(plan.hydration.mlPerHourMin).toBeGreaterThan(0);
    expect(plan.during.events.length).toBeGreaterThan(2);
    expect(plan.shoppingList.length).toBeGreaterThan(0);
    expect(plan.preActivity.foodExamples.length).toBeGreaterThan(0);
    expect(plan.recovery.avoidAbsoluteWindowClaim).toBe(true);
    expect(plan.disclaimer).toMatch(/estimaciones orientativas/);
    expect(plan.summary.carbohydratePerHourLabel).toMatch(/g\/h/);
    expect(plan.cost.economyEur).toBeGreaterThan(0);
    expect(plan.cost.sportEur).toBeGreaterThan(plan.cost.economyEur);
  });

  it("blocks clinical personalization instead of inventing a risky plan", () => {
    const plan = buildNutritionPlan(base({ clinicalFlags: ["diabetes"] }));
    expect(plan.calculatorReady).toBe(false);
    expect(plan.blockedReason).toMatch(/profesional sanitario/);
  });

  it("uses hiking and triathlon notes without inventing segment splits", () => {
    const hike = buildNutritionPlan(base({ sport: "hiking", durationMinutes: 240, intensity: "easy", fuelPreference: "real-food" }));
    const tri = buildNutritionPlan(base({ sport: "triathlon", durationMinutes: 150, goal: "perform" }));
    expect(hike.carbohydrate.gramsPerHourTypical).toBeLessThan(
      buildNutritionPlan(base({ durationMinutes: 240, intensity: "easy" })).carbohydrate.gramsPerHourTypical + 0.01,
    );
    expect(hike.during.strategySummary).toMatch(/comida real/i);
    expect(tri.during.strategySummary).toMatch(/bici/i);
    expect(tri.preActivity.foodExamples.some((item) => item.name.toLowerCase().includes("bici") || item.reason.toLowerCase().includes("bici"))).toBe(true);
  });

  it("uses measured sweat rate inside the hydration range", () => {
    const plan = buildNutritionPlan(base({ sweatRateLPerHour: 1.0 }));
    expect(plan.hydration.usedMeasuredSweatRate).toBe(true);
    expect(plan.hydration.mlPerHourMax).toBeLessThanOrEqual(1000);
  });

  it("adapts pantry matching to available foods", () => {
    const plan = buildNutritionPlan(base({ availableFoodIds: ["banana", "water", "dates"], fuelPreference: "real-food" }));
    expect(plan.pantry.used.length).toBeGreaterThan(0);
    expect(plan.pantry.used.every((item) => ["banana", "water", "dates"].includes(item.productId))).toBe(true);
  });
});

describe("sweat rate", () => {
  it("applies the standard field formula", () => {
    const result = calculateSweatRate({
      weightBeforeKg: 75,
      weightAfterKg: 73.5,
      fluidIngestedMl: 1000,
      durationMinutes: 120,
      urineDuringMl: 0,
    });
    expect(result.sweatLossL).toBeCloseTo(2.5, 2);
    expect(result.sweatRateLPerHour).toBeCloseTo(1.25, 2);
    expect(result.clinicalDisclaimer).toMatch(/No diagnostica/);
  });

  it("rejects absurd sweat-test inputs", () => {
    expect(validateSweatRateInput({ weightBeforeKg: 10, weightAfterKg: 70, fluidIngestedMl: 0, durationMinutes: 60 }).length).toBeGreaterThan(0);
  });
});
