import type { ActivityGoal, CarbohydrateTarget, Intensity, PlannerInput, SportId } from "../models/types";
import { OUTPUT_CAPS } from "../rules/limits";
import { clamp, roundTo } from "./validate";

const META = {
  ruleId: "cho-endurance-duration-intensity",
  ruleVersion: "1.0.0",
  reviewedAt: "2026-08-15",
  evidenceSources: [
    "thomas-2016-acsm",
    "burke-2011-ioc-cho",
    "kerksick-2017-issn-timing",
    "jeukendrup-2011",
    "sen-2025-consensus",
    "podlogar-2022",
  ],
  limitations: [
    "Los rangos de consenso se basan sobre todo en duración e intensidad, no en una cifra universal.",
    "Intakes de 90–120 g/h aparecen en literatura reciente solo con carbohidratos de múltiple transporte y entrenamiento intestinal.",
    "La intensidad absoluta baja puede justificar el extremo inferior del rango.",
  ],
};

interface DurationBand {
  min: number;
  typical: number;
  max: number;
  mouthRinseOptional: boolean;
  multipleTransportable: boolean;
  gutTraining?: string;
  why: string;
}

function durationBand(minutes: number): DurationBand {
  if (minutes < 45) {
    return {
      min: 0,
      typical: 0,
      max: 0,
      mouthRinseOptional: false,
      multipleTransportable: false,
      why: "Por debajo de ~45 min, las reservas endógenas suelen bastar y las guías no proponen ingesta exógena sistemática.",
    };
  }
  if (minutes < 75) {
    return {
      min: 0,
      typical: 15,
      max: 30,
      mouthRinseOptional: true,
      multipleTransportable: false,
      why: "Entre 45 y 75 min, ACSM/ISSN contemplan cantidades pequeñas o enjuague bucal con carbohidratos, sobre todo si la intensidad es alta.",
    };
  }
  if (minutes < 150) {
    return {
      min: 30,
      typical: 45,
      max: 60,
      mouthRinseOptional: false,
      multipleTransportable: false,
      why: "Para ejercicio de 1–2,5 h, el consenso ACSM/IOC/ISSN sitúa el objetivo habitual en 30–60 g/h. No se aplica como cifra única: el rango se estrecha con intensidad y objetivo.",
    };
  }
  if (minutes <= 180) {
    return {
      min: 45,
      typical: 60,
      max: 75,
      mouthRinseOptional: false,
      multipleTransportable: true,
      gutTraining:
        "A partir de ~2,5 h, intakes altos se toleran mejor si se ha entrenado el intestino y se combinan glucosa y fructosa.",
      why: "Hasta 3 h (180 min) se usa un rango de transición 2,5–3 h: no se salta automáticamente a 90 g/h.",
    };
  }
  return {
    min: 60,
    typical: 75,
    max: 90,
    mouthRinseOptional: false,
    multipleTransportable: true,
    gutTraining:
      "Para >2,5–3 h, ACSM/IOC citan hasta 90 g/h con múltiples transportadores. 90–120 g/h existe en estudios recientes, pero no es el valor por defecto recreativo.",
    why: "En esfuerzos prolongados (>2,5–3 h) el consenso sitúa el techo habitual en 60–90 g/h, no en una dosis fija.",
  };
}

function intensityShift(intensity: Intensity): number {
  if (intensity === "easy") return -10;
  if (intensity === "hard") return 8;
  return 0;
}

function goalShift(goal: ActivityGoal): number {
  if (goal === "complete") return -6;
  if (goal === "perform") return 6;
  return 0;
}

function sportPracticalFactor(sport: SportId): { delta: number; note?: string } {
  if (sport === "running" || sport === "trail") {
    return {
      delta: -5,
      note: "En carrera a pie la tolerancia gastrointestinal suele ser más limitada que en ciclismo; se prioriza el extremo práctico del rango, no una fisiología distinta.",
    };
  }
  if (sport === "hiking") {
    return {
      delta: -12,
      note: "El senderismo suele tener intensidad absoluta menor y más oportunidades de comida real; se usa la parte baja del rango de duración.",
    };
  }
  if (sport === "football") {
    return {
      delta: -8,
      note: "El fútbol es intermitente; las guías de resistencia continua se aplican con cautela y por tiempo efectivo de alta demanda.",
    };
  }
  return { delta: 0 };
}

export function calculateCarbohydrate(input: PlannerInput): CarbohydrateTarget {
  const band = durationBand(input.durationMinutes);
  const sport = sportPracticalFactor(input.sport);
  const shift = intensityShift(input.intensity) + goalShift(input.goal) + sport.delta;

  let min = clamp(band.min + Math.min(shift, 0), 0, OUTPUT_CAPS.carbohydrateGPerHour.max);
  let max = clamp(band.max + Math.max(shift, 0), 0, OUTPUT_CAPS.carbohydrateGPerHour.max);
  let typical = clamp(band.typical + shift, min, max);

  if (input.digestiveTolerance === "low") {
    max = clamp(max - 10, 0, max);
    typical = clamp(typical - 8, min, max);
  }
  if (input.digestiveTolerance === "trained" && input.durationMinutes >= 150) {
    max = clamp(max + 5, 0, OUTPUT_CAPS.carbohydrateGPerHour.max);
  }

  if (min > max) min = max;
  typical = clamp(typical, min, max);

  min = roundTo(min, 5);
  max = roundTo(max, 5);
  typical = roundTo(typical, 5);
  if (min > max) min = max;

  const hours = input.durationMinutes / 60;
  const assumptions = [
    `Duración ${input.durationMinutes} min → banda de consenso asociada.`,
    `Intensidad ${input.intensity} y objetivo ${input.goal} desplazan el punto típico dentro de la banda, no inventan un nuevo techo.`,
  ];
  if (sport.note) assumptions.push(sport.note);
  if (input.durationMinutes >= 150) {
    assumptions.push("Por encima de ~60 g/h se recomienda combinar fuentes (p. ej. glucosa + fructosa), no solo un único azúcar.");
  }

  const warnings: string[] = [];
  if (max >= 75) {
    warnings.push("Intakes altos aumentan el riesgo de molestias digestivas si no se han probado en entrenamiento.");
  }
  if (input.durationMinutes < 45 && input.goal === "perform") {
    warnings.push("En esfuerzos cortos, un enjuague bucal con carbohidratos es una opción descrita en la literatura; no es obligatorio.");
  }

  return {
    gramsPerHourMin: min,
    gramsPerHourMax: max,
    gramsPerHourTypical: typical,
    totalGramsMin: roundTo(min * hours, 5),
    totalGramsMax: roundTo(max * hours, 5),
    multipleTransportableRecommended: band.multipleTransportable || typical > 60,
    mouthRinseOptional: band.mouthRinseOptional,
    gutTrainingNote: band.gutTraining,
    assumptions,
    warnings,
    why: band.why,
    meta: META,
  };
}
