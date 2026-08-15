import type { HydrationTarget, Intensity, PlannerInput } from "../models/types";
import { OUTPUT_CAPS } from "../rules/limits";
import { clamp, roundTo } from "./validate";

const META = {
  ruleId: "hydration-range-not-exact-dose",
  ruleVersion: "1.0.0",
  reviewedAt: "2026-08-15",
  evidenceSources: ["sawka-2007-acsm-fluid", "thomas-2016-acsm", "jeukendrup-2011"],
  limitations: [
    "La tasa de sudoración individual puede variar más de 2–3 veces entre personas y sesiones.",
    "El peso es un predictor débil; no se usa una fórmula ml/kg rígida como prescripción.",
    "Beber por encima de la pérdida de sudor aumenta el riesgo de hiponatremia.",
  ],
};

function temperatureBand(tempC: number): { min: number; typical: number; max: number; label: string } {
  if (tempC < 10) return { min: 300, typical: 400, max: 600, label: "fresca" };
  if (tempC < 18) return { min: 350, typical: 500, max: 700, label: "suave" };
  if (tempC < 25) return { min: 400, typical: 600, max: 850, label: "templada" };
  if (tempC < 30) return { min: 500, typical: 750, max: 1000, label: "cálida" };
  return { min: 600, typical: 900, max: 1200, label: "calurosa" };
}

function intensityFactor(intensity: Intensity): number {
  if (intensity === "easy") return 0.85;
  if (intensity === "hard") return 1.12;
  return 1;
}

export function calculateHydration(input: PlannerInput): HydrationTarget {
  const hours = input.durationMinutes / 60;
  const warnings: string[] = [
    "No interpretes el resultado como “necesitas exactamente X ml”. Es un rango de partida.",
    "El objetivo práctico de ACSM es evitar una pérdida de masa corporal >2 % y también evitar beber en exceso.",
  ];

  if (input.sweatRateLPerHour) {
    const sweatMl = input.sweatRateLPerHour * 1000;
    const min = roundTo(clamp(sweatMl * 0.6, OUTPUT_CAPS.hydrationMlPerHour.min, OUTPUT_CAPS.hydrationMlPerHour.max), 50);
    const max = roundTo(clamp(sweatMl * 1.0, OUTPUT_CAPS.hydrationMlPerHour.min, OUTPUT_CAPS.hydrationMlPerHour.max), 50);
    const typical = roundTo(clamp(sweatMl * 0.8, min, max), 50);
    if (sweatMl > 1500) {
      warnings.push("Tasas >1,5 L/h son altas: prioriza tolerancia digestiva y no fuerces reposición completa si no la toleras.");
    }
    return {
      mlPerHourMin: min,
      mlPerHourMax: Math.max(min, max),
      mlPerHourTypical: typical,
      totalMlMin: roundTo(min * hours, 50),
      totalMlMax: roundTo(max * hours, 50),
      usedMeasuredSweatRate: true,
      assumptions: [
        "Se usó la tasa de sudoración indicada, no una media poblacional.",
        "Se propone reponer aproximadamente 60–100 % de esa tasa, no más que la pérdida estimada.",
      ],
      warnings,
      why: "Cuando hay una estimación de sudoración, ACSM recomienda individualizar la bebida a partir de esa medida, no de una cifra universal.",
      meta: META,
    };
  }

  const band = temperatureBand(input.temperatureC);
  const factor = intensityFactor(input.intensity);
  let massFactor = 1;
  if (input.bodyMassKg < 60) massFactor = 0.9;
  if (input.bodyMassKg > 85) massFactor = 1.08;

  let min = band.min * factor * massFactor;
  let typical = band.typical * factor * massFactor;
  let max = band.max * factor * massFactor;

  if (input.sport === "running" || input.sport === "trail") {
    max *= 0.95;
    typical *= 0.95;
  }

  min = roundTo(clamp(min, OUTPUT_CAPS.hydrationMlPerHour.min, OUTPUT_CAPS.hydrationMlPerHour.max), 50);
  max = roundTo(clamp(max, OUTPUT_CAPS.hydrationMlPerHour.min, OUTPUT_CAPS.hydrationMlPerHour.max), 50);
  typical = roundTo(clamp(typical, min, max), 50);

  if (input.temperatureC >= 30) {
    warnings.push("Con calor, la sudoración sube de forma muy individual. Usa la calculadora de tasa de sudoración para afinar.");
  }
  if (input.durationMinutes > 180 && input.temperatureC < 12) {
    warnings.push("En frío prolongado, beber “por si acaso” por encima de la sed puede ser contraproducente.");
  }

  return {
    mlPerHourMin: min,
    mlPerHourMax: Math.max(min, max),
    mlPerHourTypical: typical,
    totalMlMin: roundTo(min * hours, 50),
    totalMlMax: roundTo(max * hours, 50),
    usedMeasuredSweatRate: false,
    assumptions: [
      `Temperatura ${input.temperatureC} °C clasificada como ${band.label}.`,
      "Sin tasa de sudoración medida: el rango parte de tasas de bebida/sudor habituales en literatura (aprox. 0,3–1,2 L/h en muchos contextos recreativos), no de una prescripción clínica.",
      "El ajuste por peso es menor y heurístico: la masa no determina el sudor de forma fiable.",
    ],
    warnings,
    why: "ACSM 2007 enfatiza programas individualizados porque el sudor varía mucho. Este motor ofrece un rango de partida y pide no tratarlo como dosis exacta.",
    meta: META,
  };
}
