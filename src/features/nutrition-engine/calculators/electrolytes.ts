import type { ElectrolyteEstimate, HydrationTarget, PlannerInput } from "../models/types";
import { OUTPUT_CAPS } from "../rules/limits";
import { clamp, roundTo } from "./validate";

const META = {
  ruleId: "sodium-contextual-not-megadose",
  ruleVersion: "1.0.0",
  reviewedAt: "2026-08-15",
  evidenceSources: ["sawka-2007-acsm-fluid", "acsm-1996-fluid", "thomas-2016-acsm"],
  limitations: [
    "La concentración de sodio en sudor varía típicamente ~20–80 mmol/L entre personas.",
    "No hay una megadosis universal ni un valor único en mg/h que sirva para todos.",
    "Sin test de sodio en sudor, solo se puede ofrecer un rango contextual.",
  ],
};

export function calculateElectrolytes(input: PlannerInput, hydration: HydrationTarget): ElectrolyteEstimate {
  const shortAndCool = input.durationMinutes < 60 && input.temperatureC < 25;

  if (shortAndCool) {
    return {
      applicable: false,
      sodiumMgPerHourMin: 0,
      sodiumMgPerHourMax: 0,
      contextualNote:
        "En sesiones cortas y no calurosas, la dieta habitual suele cubrir el sodio. No se propone un suplemento específico.",
      assumptions: ["Duración <60 min y temperatura <25 °C."],
      warnings: [],
      why: "Las position stands de fluidos sitúan el interés del sodio en bebida sobre todo en ejercicio más largo o con altas pérdidas.",
      meta: META,
    };
  }

  const lowConc = 300;
  const highConc = 700;
  const min = roundTo(
    clamp((hydration.mlPerHourMin / 1000) * lowConc, OUTPUT_CAPS.sodiumMgPerHour.min, OUTPUT_CAPS.sodiumMgPerHour.max),
    50,
  );
  const max = roundTo(
    clamp((hydration.mlPerHourMax / 1000) * highConc, OUTPUT_CAPS.sodiumMgPerHour.min, OUTPUT_CAPS.sodiumMgPerHour.max),
    50,
  );

  const warnings = [
    "Esto no es una prescripción de pastillas de sal ni una megadosis.",
    "Si eres “salty sweater”, tienes calambres recurrentes o entrenas muchas horas con calor, un profesional puede individualizar mejor que este rango.",
  ];

  return {
    applicable: true,
    sodiumMgPerHourMin: min,
    sodiumMgPerHourMax: Math.max(min, max),
    contextualNote:
      "El rango se obtiene multiplicando el fluido estimado por concentraciones habituales de bebidas deportivas (~300–700 mg/L), coherentes con el ancla histórica ACSM de 0,5–0,7 g/L. No equivale a tu pérdida real de sodio.",
    assumptions: [
      "No se midió sodio en sudor.",
      "Se usan concentraciones de bebida descritas en literatura, no pérdidas individuales.",
    ],
    warnings,
    why: "ACSM recomienda individualizar electrolitos. Sin dato individual, solo es honesto mostrar un intervalo contextual ligado al fluido, con techo conservador.",
    meta: META,
  };
}
