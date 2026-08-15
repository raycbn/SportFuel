import type { SweatRateInput, SweatRateResult, ValidationIssue } from "../models/types";
import { INPUT_LIMITS } from "../rules/limits";

export function validateSweatRateInput(input: Partial<SweatRateInput>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fields: Array<[keyof SweatRateInput, number | undefined, number, number, string]> = [
    ["weightBeforeKg", input.weightBeforeKg, INPUT_LIMITS.weightBeforeKg.min, INPUT_LIMITS.weightBeforeKg.max, "peso antes"],
    ["weightAfterKg", input.weightAfterKg, INPUT_LIMITS.weightAfterKg.min, INPUT_LIMITS.weightAfterKg.max, "peso después"],
    ["fluidIngestedMl", input.fluidIngestedMl, INPUT_LIMITS.fluidIngestedMl.min, INPUT_LIMITS.fluidIngestedMl.max, "líquido ingerido (ml)"],
    ["durationMinutes", input.durationMinutes, INPUT_LIMITS.durationMinutes.min, INPUT_LIMITS.durationMinutes.max, "duración"],
  ];
  for (const [field, value, min, max, label] of fields) {
    if (value === undefined || Number.isNaN(value)) {
      issues.push({ field, code: "required", message: `Indica ${label}.` });
    } else if (value < min || value > max) {
      issues.push({ field, code: "range", message: `${label} debe estar entre ${min} y ${max}.` });
    }
  }
  if (
    input.urineDuringMl !== undefined &&
    (input.urineDuringMl < INPUT_LIMITS.urineDuringMl.min || input.urineDuringMl > INPUT_LIMITS.urineDuringMl.max)
  ) {
    issues.push({ field: "urineDuringMl", code: "range", message: "Orina durante la actividad: 0–2000 ml." });
  }
  return issues;
}

export function calculateSweatRate(input: SweatRateInput): SweatRateResult {
  const urineL = (input.urineDuringMl ?? 0) / 1000;
  const fluidL = input.fluidIngestedMl / 1000;
  const sweatLossL = input.weightBeforeKg - input.weightAfterKg + fluidL - urineL;
  const hours = input.durationMinutes / 60;
  const sweatRateLPerHour = hours > 0 ? sweatLossL / hours : 0;
  const warnings: string[] = [];

  if (sweatLossL < 0) {
    warnings.push("El resultado es negativo: revisa pesos, líquido ingerido y orina. No uses este valor para beber más.");
  }
  if (sweatRateLPerHour > 2.5) {
    warnings.push("Una tasa >2,5 L/h es inusualmente alta. Repite la medida en condiciones similares antes de usarla.");
  }
  if (Math.abs(input.weightBeforeKg - input.weightAfterKg) > 5) {
    warnings.push("Un cambio de peso >5 kg en una sesión es extremo o un error de báscula.");
  }

  return {
    sweatLossL: Math.round(sweatLossL * 100) / 100,
    sweatRateLPerHour: Math.round(sweatRateLPerHour * 100) / 100,
    formula: "Pérdida de sudor (L) = (peso antes − peso después) + líquido ingerido (L) − orina (L). Tasa (L/h) = pérdida / horas.",
    limitations: [
      "No es una medición clínica.",
      "No cuenta agua respiratoria ni el cambio de masa por oxidación de sustratos.",
      "Ropa mojada, báscula distinta o comida durante el test distorsionan el resultado.",
      "La tasa cambia con temperatura, intensidad, aclimatación y momento del día.",
    ],
    warnings,
    clinicalDisclaimer:
      "Esta estimación es educativa. No diagnostica deshidratación ni sustituye evaluación profesional.",
  };
}
