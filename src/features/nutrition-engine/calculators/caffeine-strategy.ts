import type { ActivityGoal, Intensity, NutritionRuleMeta, SportId } from "../models/types";

export interface CaffeineStrategy {
  active: boolean;
  summary: string;
  timing: string;
  dose: {
    mgPerKgMin: number;
    mgPerKgMax: number;
    mgTotalMin: number;
    mgTotalMax: number;
    capped: boolean;
    capReason?: string;
  };
  sourceGuidance: string[];
  habitNote: string;
  sleepWarning: string;
  stackingWarning: string;
  disclaimer: string;
  meta: NutritionRuleMeta;
}

const META: NutritionRuleMeta = {
  ruleId: "caffeine-conservative-endurance",
  ruleVersion: "1.0.0",
  reviewedAt: "2026-09-03",
  evidenceSources: [
    "issn-2021-caffeine-exercise",
    "efsa-2015-caffeine-safety",
    "issn-2023-coffee-sports",
  ],
  limitations: [
    "La respuesta a la cafeína es muy individual y depende de la genética, el hábito y la sensibilidad.",
    "Fuel no conoce el consumo diario total de cafeína del usuario; las cantidades mostradas son orientativas para esta sesión.",
    "No se contemplan interacciones con medicación específica.",
    "No se recomienda para esfuerzos muy cortos o muy prolongados sin supervisión.",
  ],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function calculateCaffeineStrategy(input: {
  bodyMassKg: number;
  durationMinutes: number;
  intensity: Intensity;
  sport: SportId;
  goal: ActivityGoal;
  caffeinePreferred?: boolean;
  caffeineHabit?: "none" | "low" | "moderate" | "high";
  caffeineSensitivity?: "normal" | "sensitive" | "resistant";
}): CaffeineStrategy {
  if (!input.caffeinePreferred) {
    return {
      active: false,
      summary: "",
      timing: "",
      dose: { mgPerKgMin: 0, mgPerKgMax: 0, mgTotalMin: 0, mgTotalMax: 0, capped: false },
      sourceGuidance: [],
      habitNote: "",
      sleepWarning: "",
      stackingWarning: "",
      disclaimer: "",
      meta: META,
    };
  }

  const weight = input.bodyMassKg;
  const duration = input.durationMinutes;

  const isShortEffort = duration < 45;
  const isLongEffort = duration >= 150;

  const sensitivity = input.caffeineSensitivity ?? "normal";
  const habit = input.caffeineHabit ?? "none";

  let mgPerKgMin = 3;
  let mgPerKgMax = 6;
  let singleCap = 200;
  let capped = false;
  let capReason: string | undefined;

  if (sensitivity === "sensitive") {
    mgPerKgMin = 1.5;
    mgPerKgMax = 3;
    singleCap = 100;
  } else if (sensitivity === "resistant") {
    mgPerKgMin = 3;
    mgPerKgMax = 6;
    singleCap = 200;
  }

  const rawMin = mgPerKgMin * weight;
  const rawMax = mgPerKgMax * weight;
  let totalMin = roundTo(rawMin, 10);
  let totalMax = roundTo(rawMax, 10);

  if (totalMax > singleCap) {
    totalMax = singleCap;
    capped = true;
    capReason = `Se limita a ${singleCap} mg como medida prudencial, aunque el cálculo por peso sugiriera una cantidad mayor.`;
  }

  totalMin = clamp(totalMin, 30, totalMax);
  totalMax = clamp(totalMax, totalMin, singleCap);

  let timing = "45–60 min antes de la salida para cápsulas, geles o bebidas.";
  if (isShortEffort) {
    timing = "Para esfuerzos menores de ~45 min, el beneficio de la cafeína es limitado. Si decides usarla, 30–45 min antes puede ser suficiente.";
  }

  let summary = "";
  if (isShortEffort) {
    summary = "Esfuerzo corto: la cafeína puede tener un efecto limitado en el rendimiento.";
  } else if (isLongEffort) {
    summary = `Plan con cafeína orientado a esfuerzo prolongado: ${totalMin}–${totalMax} mg en una toma previa. En esfuerzos muy largos, una segunda toma pequeña a partir de la segunda hora puede considerarse, siempre que la dosis total no supere los 400 mg.`;
  } else {
    summary = `Estrategia de cafeína moderada: ${totalMin}–${totalMax} mg como objetivo orientativo para esta sesión.`;
  }

  const sourceGuidance = [
    "Café solo o americano: fuente habitual, absorción moderada.",
    "Gel con cafeína: absorción más rápida; puede acortar ligeramente el timing.",
    "Bebida deportiva con cafeína: combina cafeína y carbohidratos; verifica la concentración.",
    "Goma/cápsula de cafeína: formato controlado; timing más predecible.",
  ];

  let habitNote = "";
  if (habit === "none") {
    habitNote = "Si no estás habituado, empieza por la parte baja del rango para evaluar tu respuesta.";
  } else if (habit === "low" || habit === "moderate" || habit === "high") {
    habitNote = "Si estás acostumbrado a consumir cafeína, prueba la estrategia durante entrenamientos antes de usarla en competición.";
  }

  const sleepWarning = "La cafeína puede afectar al sueño. Ten en cuenta la hora prevista de descanso.";
  const stackingWarning = "La cafeína de café, geles, bebidas y suplementos se suma. Comprueba la etiqueta de tus productos para evitar acumular cantidades no previstas.";

  const disclaimer =
    "Las recomendaciones son orientativas y no sustituyen el consejo de un profesional sanitario. Si estás embarazada, tienes condiciones cardiorrespiratorias, tomas medicación o sufres ansiedad, consulta antes de consumir cafeína.";

  return {
    active: true,
    summary,
    timing,
    dose: {
      mgPerKgMin: roundTo(mgPerKgMin, 0.1),
      mgPerKgMax: roundTo(mgPerKgMax, 0.1),
      mgTotalMin: totalMin,
      mgTotalMax: totalMax,
      capped,
      capReason,
    },
    sourceGuidance,
    habitNote,
    sleepWarning,
    stackingWarning,
    disclaimer,
    meta: META,
  };
}
