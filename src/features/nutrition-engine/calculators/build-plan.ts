import { CLINICAL_BLOCK_MESSAGE, DISCLAIMER, ENGINE_VERSION } from "../rules/limits";
import type { NutritionPlan, PlannerInput } from "../models/types";
import { calculateCarbohydrate } from "./carbohydrate";
import { calculateCompetition } from "./competition";
import { calculateElectrolytes } from "./electrolytes";
import { calculateHydration } from "./hydration";
import { buildShoppingList, estimateOutingCost, matchPantry } from "./pantry-shopping-cost";
import { calculateDuring, calculatePreActivity, calculateRecovery } from "./pre-during-recovery";
import { validatePlannerInput } from "./validate";

function publicSlug(input: PlannerInput): string {
  const sport = input.sport;
  const hours = Math.round((input.durationMinutes / 60) * 10) / 10;
  const token = Math.random().toString(36).slice(2, 8);
  return `${sport}-${hours}h-${token}`;
}

export function buildNutritionPlan(input: PlannerInput): NutritionPlan {
  const issues = validatePlannerInput(input);
  if (issues.length > 0) {
    throw new Error(issues.map((issue) => issue.message).join(" "));
  }

  const blocked = Boolean(input.clinicalFlags && input.clinicalFlags.length > 0);
  const carbohydrate = calculateCarbohydrate(input);
  const hydration = calculateHydration(input);
  const electrolytes = calculateElectrolytes(input, hydration);
  const preActivity = calculatePreActivity(input);
  const during = calculateDuring(input, carbohydrate, hydration);
  const recovery = calculateRecovery(input);
  const pantry = matchPantry(input, carbohydrate, hydration);
  const shoppingList = buildShoppingList(input, carbohydrate, hydration);
  const cost = estimateOutingCost(input, carbohydrate);
  const competitionStrategy = input.competition ? calculateCompetition(input, carbohydrate, hydration) : undefined;

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    shareSlug: publicSlug(input),
    sport: input.sport,
    durationMinutes: input.durationMinutes,
    intensity: input.intensity,
    temperatureC: input.temperatureC,
    goal: input.goal,
    fuelPreference: input.fuelPreference,
    calculatorReady: !blocked,
    blockedReason: blocked ? CLINICAL_BLOCK_MESSAGE : undefined,
    summary: {
      carbohydratePerHourLabel: `${carbohydrate.gramsPerHourMin}–${carbohydrate.gramsPerHourMax} g/h`,
      hydrationPerHourLabel: `${hydration.mlPerHourMin}–${hydration.mlPerHourMax} ml/h`,
      electrolyteLabel: electrolytes.applicable
        ? `${electrolytes.sodiumMgPerHourMin}–${electrolytes.sodiumMgPerHourMax} mg/h de sodio (orientativo)`
        : "Sodio: la dieta habitual suele bastar en esta sesión",
    },
    carbohydrate,
    hydration,
    electrolytes,
    preActivity,
    during,
    recovery,
    pantry,
    shoppingList,
    cost,
    disclaimer: DISCLAIMER,
    engineVersion: ENGINE_VERSION,
    competitionStrategy,
  };
}

export function encodePublicPlan(plan: NutritionPlan): string {
  const publicPayload = {
    s: plan.sport,
    d: plan.durationMinutes,
    i: plan.intensity,
    t: plan.temperatureC,
    g: plan.goal,
    p: plan.fuelPreference,
    cho: plan.summary.carbohydratePerHourLabel,
    h: plan.summary.hydrationPerHourLabel,
    e: plan.summary.electrolyteLabel,
    strat: plan.during.strategySummary,
    v: plan.engineVersion,
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(publicPayload))));
}

export function decodePublicPlan(payload: string): {
  sport: NutritionPlan["sport"];
  durationMinutes: number;
  intensity: NutritionPlan["intensity"];
  temperatureC: number;
  goal: NutritionPlan["goal"];
  fuelPreference: NutritionPlan["fuelPreference"];
  carbohydratePerHourLabel: string;
  hydrationPerHourLabel: string;
  electrolyteLabel: string;
  strategySummary: string;
} | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(escape(atob(payload)))) as Record<string, string | number>;
    if (typeof parsed.s !== "string" || typeof parsed.d !== "number") return null;
    return {
      sport: parsed.s as NutritionPlan["sport"],
      durationMinutes: parsed.d,
      intensity: parsed.i as NutritionPlan["intensity"],
      temperatureC: Number(parsed.t),
      goal: parsed.g as NutritionPlan["goal"],
      fuelPreference: parsed.p as NutritionPlan["fuelPreference"],
      carbohydratePerHourLabel: String(parsed.cho),
      hydrationPerHourLabel: String(parsed.h),
      electrolyteLabel: String(parsed.e),
      strategySummary: String(parsed.strat),
    };
  } catch {
    return null;
  }
}
