import type {
  DuringActivityPlan,
  FoodExample,
  FuelPreference,
  PlannerInput,
  PreActivityPlan,
  RecoveryPlan,
  TimelineEvent,
} from "../models/types";
import type { CarbohydrateTarget } from "../models/types";
import type { HydrationTarget } from "../models/types";
import { roundTo } from "./validate";

const PRE_META = {
  ruleId: "pre-activity-cho-1-4gkg",
  ruleVersion: "1.0.0",
  reviewedAt: "2026-08-15",
  evidenceSources: ["thomas-2016-acsm", "burke-2011-ioc-cho"],
  limitations: [
    "1–4 g/kg es un rango amplio; no se convierte en menú clínico.",
    "No se asumen alergias ni se construye una dieta diaria.",
  ],
};

const DURING_META = {
  ruleId: "during-timeline-30min",
  ruleVersion: "1.0.0",
  reviewedAt: "2026-08-15",
  evidenceSources: ["thomas-2016-acsm", "kerksick-2017-issn-timing", "jeukendrup-2011"],
  limitations: ["El timeline es una cadencia práctica, no un protocolo de laboratorio."],
};

const RECOVERY_META = {
  ruleId: "recovery-no-magic-window",
  ruleVersion: "1.0.0",
  reviewedAt: "2026-08-15",
  evidenceSources: ["thomas-2016-acsm", "kerksick-2017-issn-timing", "jager-2017-issn-protein"],
  limitations: [
    "La reposición agresiva de glucógeno importa sobre todo si hay otra sesión en <4–8 h.",
    "No existe una única “ventana anabólica” de minutos que condicione todo el resultado.",
  ],
};

function examplesFor(preference: FuelPreference, sport?: PlannerInput["sport"]): FoodExample[] {
  if (sport === "hiking") {
    return [
      { name: "Bocadillo + fruta", reason: "En senderismo suele haber más tiempo y ganas de comida real que de geles." },
      { name: "Frutos secos o dátiles", reason: "Fácil de llevar; no sustituye agua ni una comida si la jornada es larga." },
    ];
  }
  if (sport === "triathlon") {
    return [
      { name: "Desayuno familiar 2–3 h antes", reason: "La natación no es un buen momento para comer; llega con glucógeno ya cubierto." },
      { name: "Bebida con carbohidratos lista para el segmento de bici", reason: "Jeukendrup (2011) sitúa la bici como la ventana práctica de ingesta en triatlón." },
    ];
  }
  if (preference === "sports-products") {
    return [
      { name: "Tostada o barrita + bebida con carbohidratos", reason: "Fácil de dosificar y habitual antes de competir." },
      { name: "Yogur + plátano", reason: "Si prefieres algo más suave de estómago que un desayuno copioso." },
    ];
  }
  if (preference === "real-food") {
    return [
      { name: "Avena con plátano", reason: "Carbohidratos familiares, fáciles de ajustar en cantidad." },
      { name: "Pan + miel o mermelada", reason: "Opción simple y económica 1–3 h antes." },
      { name: "Arroz o patata + yogur", reason: "Útil si la sesión es larga y hay tiempo de digestión." },
    ];
  }
  return [
    { name: "Avena o pan + fruta", reason: "Base de comida real." },
    { name: "Bebida con carbohidratos si el tiempo es corto", reason: "Complemento práctico cerca de la salida." },
  ];
}

export function calculatePreActivity(input: PlannerInput): PreActivityPlan {
  const longSession = input.durationMinutes >= 90;
  const minG = longSession ? 1 : 1;
  const maxG = longSession ? 2.5 : 2;
  return {
    timingLabel: "1–4 h antes, con alimentos que ya toleras",
    carbohydrateGPerKgMin: minG,
    carbohydrateGPerKgMax: maxG,
    exampleMealGramsMin: roundTo(minG * input.bodyMassKg, 5),
    exampleMealGramsMax: roundTo(maxG * input.bodyMassKg, 5),
    hydrationNote:
      "El objetivo es empezar euhidratado (orina clara/pálida, comidas y bebidas habituales). ACSM sugiere hidratar con varias horas de margen si hace falta, no beber un volumen enorme justo al salir.",
    foodExamples: examplesFor(input.fuelPreference, input.sport),
    assumptions: [
      "Se usa el rango ACSM/IOC de 1–4 g/kg en las 1–4 h previas, recortado a un intervalo práctico recreativo.",
      "No se construye una dieta clínica ni se asumen alergias.",
    ],
    why: "Las position stands proponen una comida rica en carbohidratos y familiar, no un menú terapéutico.",
    meta: PRE_META,
  };
}

function eventItems(preference: FuelPreference, cho: number, fluid: number): string[] {
  const items: string[] = [];
  if (cho > 0) {
    if (preference === "real-food") items.push("Fruta, dátiles, pan o arroz según tolerancia");
    else if (preference === "sports-products") items.push("Gel, barrita o bebida con carbohidratos");
    else items.push("Comida real o producto deportivo, según lo que toleres");
  }
  if (fluid > 0) items.push("Beber a sorbos; no apurar de golpe");
  return items;
}

export function calculateDuring(
  input: PlannerInput,
  carbohydrate: CarbohydrateTarget,
  hydration: HydrationTarget,
): DuringActivityPlan {
  const startNote =
    input.sport === "triathlon"
      ? "En el agua casi no se come. Prepara bidones y raciones para la bici."
      : input.sport === "hiking"
        ? "Lleva comida real accesible. No hace falta un gel en el minuto 0."
        : "No hace falta “cargar” un gel en el minuto 0 si acabas de comer.";

  const events: TimelineEvent[] = [
    {
      minute: 0,
      label: input.sport === "triathlon" ? "Salida / natación" : "Salida",
      items:
        input.sport === "triathlon"
          ? ["Empieza hidratado. Reserva la ingesta principal para el segmento de bici."]
          : ["Empieza hidratado y con el primer bidón/alimento a mano."],
      note: startNote,
    },
  ];

  if (carbohydrate.gramsPerHourTypical === 0 && input.durationMinutes < 45) {
    events.push({
      minute: input.durationMinutes,
      label: "Meta",
      items: ["Agua según sed. La ingesta de carbohidratos durante no es el foco de esta sesión."],
    });
    return {
      events,
      strategySummary: "Sesión corta: prioriza haber comido antes y beber según sed.",
      why: "Las guías no marcan un protocolo de carbohidratos durante esfuerzos <45 min.",
      meta: DURING_META,
    };
  }

  const step = input.sport === "hiking" || input.durationMinutes >= 240 ? 40 : 30;
  const choPerEvent = roundTo((carbohydrate.gramsPerHourTypical * step) / 60, 5);
  const fluidPerEvent = roundTo((hydration.mlPerHourTypical * step) / 60, 25);
  const lastIntake = Math.max(step, input.durationMinutes - 15);

  for (let minute = step; minute < lastIntake; minute += step) {
    if (events.length >= 9) break;
    events.push({
      minute,
      label: formatMinute(minute),
      carbohydrateGrams: choPerEvent,
      fluidMl: fluidPerEvent,
      items: eventItems(input.fuelPreference, choPerEvent, fluidPerEvent),
    });
  }

  events.push({
    minute: input.durationMinutes,
    label: "Meta",
    items: ["Pasa a la estrategia de recuperación: fluido, comida habitual y, si toca, proteína."],
  });

  const sportSummary =
    input.sport === "triathlon"
      ? " No inventamos un split T1/T2: el g/h es del tiempo total. Come sobre todo en bici; en carrera a pie baja la tolerancia."
      : input.sport === "hiking"
        ? " En senderismo prioriza comida real y un ritmo de ingesta más holgado que en competición."
        : "";

  return {
    events,
    strategySummary: (carbohydrate.multipleTransportableRecommended
      ? "Reparte carbohidratos e hidratación a lo largo de la sesión. Si te acercas a >60 g/h, combina fuentes (p. ej. bebida + fruta o gel con distinta composición)."
      : "Reparte raciones pequeñas y regulares. Evita acumular todo al final.") + sportSummary,
    why: "Una cadencia cada 30–40 min traduce el objetivo g/h y ml/h a acciones concretas, sin saturar de eventos.",
    meta: DURING_META,
  };
}

export function calculateRecovery(input: PlannerInput): RecoveryPlan {
  const anotherSessionSoon = input.goal === "perform" && input.durationMinutes >= 90;
  const proteinG = input.durationMinutes >= 60 ? "un bolo práctico de ~20–40 g de proteína en la comida posterior" : "proteína dentro de una comida normal si te apetece";
  return {
    carbohydrateNote: anotherSessionSoon
      ? "Si hay otra sesión exigente en las siguientes 4–8 h, las guías hablan de ~1,0–1,2 g/kg/h de carbohidratos en las primeras horas. Si no, una comida normal rica en carbohidratos basta."
      : "Con tiempo hasta la siguiente sesión, no hace falta un protocolo agresivo: una comida normal con arroz, pan, patata o fruta cubre la reposición.",
    proteinNote: `ISSN describe ${proteinG}. No hay que perseguir una ventana de minutos; importa más el total del día.`,
    hydrationNote:
      "Si necesitas rehidratarar rápido, ACSM menciona reponer más del déficit (en torno a 125–150 % de la pérdida de peso) con algo de sodio. Si no hay prisa, agua y comida salada habituales suelen bastar.",
    mealExamples:
      input.fuelPreference === "sports-products"
        ? ["Batido o yogur + fruta", "Bocadillo y bebida", "Comida habitual en las 2–4 h siguientes"]
        : ["Arroz o patata + yogur o huevo", "Bocadillo y fruta", "Lentejas o plato habitual de casa"],
    avoidAbsoluteWindowClaim: true,
    why: "La evidencia de timing es más relevante cuando hay otra sesión pronto o la ingesta diaria es insuficiente. No se afirma una única ventana anabólica.",
    meta: RECOVERY_META,
  };
}

function formatMinute(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
