import type { PlannerInput } from "@/features/nutrition-engine";

export type PlanOrigin = "manual" | "pedalmap";

export interface PedalMapContext {
  source: "pedalmap";
  sport: string;
  distanceKm?: number;
  elevationGainM?: number;
  durationMinutes: number;
  temperatureC?: number;
  intensity?: string;
  goal?: string;
  bodyMassKg?: number;
  sweatRateLPerHour?: number;
  departureTime?: string;
}

export interface RouteSummary {
  distanceKm?: number;
  elevationGainM?: number;
  durationMinutes?: number;
  temperatureC?: number;
}

const SPORT_ALIASES: Record<string, string> = {
  ciclismo: "cycling",
  bicicleta: "cycling",
  bici: "cycling",
  running: "running",
  correr: "running",
  trail: "trail",
  senderismo: "hiking",
  hiking: "hiking",
  triatlon: "triathlon",
  triathlon: "triathlon",
  futbol: "football",
  fútbol: "football",
  football: "football",
};

const INTENSITY_ALIASES: Record<string, string> = {
  suave: "easy",
  easy: "easy",
  moderada: "moderate",
  moderate: "moderate",
  alta: "hard",
  hard: "hard",
};

const GOAL_ALIASES: Record<string, string> = {
  terminar: "complete",
  complete: "complete",
  entrenar: "train",
  train: "train",
  rendir: "perform",
  competir: "perform",
  perform: "perform",
};

export function parsePedalMapContext(params: URLSearchParams): PedalMapContext | null {
  if (params.get("source") !== "pedalmap") return null;

  const sportRaw = params.get("sport");
  if (!sportRaw) return null;
  const sport = SPORT_ALIASES[sportRaw.toLowerCase()] || sportRaw;

  const durationRaw = params.get("durationMinutes");
  const durationMinutes = durationRaw ? Number(durationRaw) : NaN;

  const context: PedalMapContext = {
    source: "pedalmap",
    sport,
    durationMinutes,
  };

  const distanceRaw = params.get("distanceKm");
  if (distanceRaw) {
    const value = Number(distanceRaw);
    if (Number.isFinite(value) && value >= 0 && value <= 400) {
      context.distanceKm = value;
    }
  }

  const elevationRaw = params.get("elevationGainM");
  if (elevationRaw) {
    const value = Number(elevationRaw);
    if (Number.isFinite(value) && value >= 0 && value <= 8000) {
      context.elevationGainM = value;
    }
  }

  const tempRaw = params.get("temperatureC");
  if (tempRaw) {
    const value = Number(tempRaw);
    if (Number.isFinite(value) && value >= -5 && value <= 45) {
      context.temperatureC = value;
    }
  }

  const intensityRaw = params.get("intensity");
  if (intensityRaw) {
    const normalized = INTENSITY_ALIASES[intensityRaw.toLowerCase()] || intensityRaw.toLowerCase();
    if (normalized === "easy" || normalized === "moderate" || normalized === "hard") {
      context.intensity = normalized;
    }
  }

  const goalRaw = params.get("goal");
  if (goalRaw) {
    const normalized = GOAL_ALIASES[goalRaw.toLowerCase()] || goalRaw.toLowerCase();
    if (normalized === "complete" || normalized === "train" || normalized === "perform") {
      context.goal = normalized;
    }
  }

  const massRaw = params.get("bodyMassKg");
  if (massRaw) {
    const value = Number(massRaw);
    if (Number.isFinite(value) && value >= 40 && value <= 150) {
      context.bodyMassKg = value;
    }
  }

  const sweatRaw = params.get("sweatRateLPerHour");
  if (sweatRaw) {
    const value = Number(sweatRaw);
    if (Number.isFinite(value) && value >= 0.2 && value <= 3.5) {
      context.sweatRateLPerHour = value;
    }
  }

  const departureRaw = params.get("departureTime");
  if (departureRaw) {
    const date = new Date(departureRaw);
    if (!Number.isNaN(date.getTime())) {
      context.departureTime = date.toISOString();
    }
  }

  return context;
}

export function extractRouteSummary(context: PedalMapContext | null): RouteSummary | null {
  if (!context) return null;
  return {
    distanceKm: context.distanceKm,
    elevationGainM: context.elevationGainM,
    durationMinutes: Number.isFinite(context.durationMinutes) ? context.durationMinutes : undefined,
    temperatureC: context.temperatureC,
  };
}

export function applyPedalMapContext(
  context: PedalMapContext | null,
  fallback: Partial<PlannerInput>
): Partial<PlannerInput> {
  if (!context) return fallback;

  const result: Partial<PlannerInput> = { ...fallback };

  if (context.sport) result.sport = context.sport as PlannerInput["sport"];
  if (Number.isFinite(context.durationMinutes) && context.durationMinutes > 0) {
    result.durationMinutes = Math.min(720, Math.max(15, Math.round(context.durationMinutes)));
  }
  if (context.distanceKm !== undefined) result.distanceKm = context.distanceKm;
  if (context.elevationGainM !== undefined) result.elevationGainM = context.elevationGainM;
  if (context.temperatureC !== undefined) result.temperatureC = context.temperatureC;
  if (context.intensity) result.intensity = context.intensity as PlannerInput["intensity"];
  if (context.goal) result.goal = context.goal as PlannerInput["goal"];
  if (context.bodyMassKg !== undefined) result.bodyMassKg = context.bodyMassKg;
  if (context.sweatRateLPerHour !== undefined) result.sweatRateLPerHour = context.sweatRateLPerHour;

  return result;
}
