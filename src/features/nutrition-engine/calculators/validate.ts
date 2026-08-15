import { ALL_SPORTS, MVP_SPORTS, type PlannerInput, type ValidationIssue } from "../models/types";
import { INPUT_LIMITS } from "../rules/limits";

function outOfRange(
  field: string,
  value: number | undefined,
  min: number,
  max: number,
  label: string,
): ValidationIssue | null {
  if (value === undefined || Number.isNaN(value)) {
    return { field, code: "required", message: `Indica ${label}.` };
  }
  if (value < min || value > max) {
    return {
      field,
      code: "range",
      message: `${label} debe estar entre ${min} y ${max}.`,
    };
  }
  return null;
}

export function validatePlannerInput(input: Partial<PlannerInput>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!input.sport || !ALL_SPORTS.includes(input.sport)) {
    issues.push({ field: "sport", code: "required", message: "Elige un deporte." });
  } else if (!MVP_SPORTS.includes(input.sport as (typeof MVP_SPORTS)[number]) && input.sport) {
    if (!["hiking", "triathlon", "football"].includes(input.sport)) {
      issues.push({
        field: "sport",
        code: "not-ready",
        message: "Este deporte está preparado en la arquitectura, pero aún no tiene reglas de cálculo propias.",
      });
    }
  }

  const duration = outOfRange(
    "durationMinutes",
    input.durationMinutes,
    INPUT_LIMITS.durationMinutes.min,
    INPUT_LIMITS.durationMinutes.max,
    "la duración (minutos)",
  );
  if (duration) issues.push(duration);

  const mass = outOfRange(
    "bodyMassKg",
    input.bodyMassKg,
    INPUT_LIMITS.bodyMassKg.min,
    INPUT_LIMITS.bodyMassKg.max,
    "el peso (kg)",
  );
  if (mass) issues.push(mass);

  const temp = outOfRange(
    "temperatureC",
    input.temperatureC,
    INPUT_LIMITS.temperatureC.min,
    INPUT_LIMITS.temperatureC.max,
    "la temperatura (°C)",
  );
  if (temp) issues.push(temp);

  if (input.distanceKm !== undefined) {
    const distance = outOfRange(
      "distanceKm",
      input.distanceKm,
      INPUT_LIMITS.distanceKm.min,
      INPUT_LIMITS.distanceKm.max,
      "la distancia (km)",
    );
    if (distance) issues.push(distance);
  }

  if (input.elevationGainM !== undefined) {
    const elevation = outOfRange(
      "elevationGainM",
      input.elevationGainM,
      INPUT_LIMITS.elevationGainM.min,
      INPUT_LIMITS.elevationGainM.max,
      "el desnivel (m)",
    );
    if (elevation) issues.push(elevation);
  }

  if (input.sweatRateLPerHour !== undefined) {
    const sweat = outOfRange(
      "sweatRateLPerHour",
      input.sweatRateLPerHour,
      INPUT_LIMITS.sweatRateLPerHour.min,
      INPUT_LIMITS.sweatRateLPerHour.max,
      "la tasa de sudoración (L/h)",
    );
    if (sweat) issues.push(sweat);
  }

  if (input.intensity && !["easy", "moderate", "hard"].includes(input.intensity)) {
    issues.push({ field: "intensity", code: "invalid", message: "Intensidad no válida." });
  }

  return issues;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}
