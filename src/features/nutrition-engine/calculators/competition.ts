import type { CarbohydrateTarget, HydrationTarget, PlannerInput } from "../models/types";

export interface CompetitionEvent {
  minute: number;
  label: string;
  carbohydrateGrams?: number;
  fluidMl?: number;
  sodiumMg?: number;
  items: string[];
  note?: string;
}

export interface CompetitionStrategy {
  summary: string;
  preStart: CompetitionEvent[];
  during: CompetitionEvent[];
  finish: CompetitionEvent[];
  recovery: CompetitionEvent[];
  emergency: string[];
  meta: typeof META;
}

const META = {
  ruleId: "competition-structured-timeline",
  ruleVersion: "1.0.0",
  reviewedAt: "2026-09-03",
  evidenceSources: ["thomas-2016-acsm", "burke-2011-ioc-cho", "jeukendrup-2011"],
  limitations: [
    "Es una estructura práctica, no una prescripción clínica.",
    "Las cantidades son orientativas y dependen de tolerancia individual.",
  ],
};

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function preStartEvents(input: PlannerInput, carbohydrate: CarbohydrateTarget, hydration: HydrationTarget): CompetitionEvent[] {
  const events: CompetitionEvent[] = [];
  const mealGrams = roundToStep(carbohydrate.gramsPerHourTypical * 1.2, 5);
  const mealFluid = roundToStep(hydration.mlPerHourTypical * 0.8, 50);

  events.push({
    minute: Math.max(0, input.durationMinutes - 120),
    label: "Comida principal",
    carbohydrateGrams: mealGrams,
    fluidMl: mealFluid,
    items: ["Alimentos familiares ricos en carbohidratos.", "Evita probar alimentos nuevos."],
    note: "2–3 h antes, según tolerancia.",
  });

  if (input.durationMinutes >= 60) {
    const snackGrams = roundToStep(carbohydrate.gramsPerHourTypical * 0.4, 5);
    events.push({
      minute: Math.max(0, input.durationMinutes - 45),
      label: "Snack de precaución",
      carbohydrateGrams: snackGrams,
      items: ["Algo ligero si aún quedan >60 min.", "Fruta, pan o gel según lo que toleres."],
    });
  }

  events.push({
    minute: Math.max(0, input.durationMinutes - 15),
    label: "Preparación final",
    fluidMl: roundToStep(hydration.mlPerHourTypical * 0.25, 50),
    items: ["Bidón/ botella preparados.", "Último repaso de avituallamientos."],
  });

  return events;
}

function duringEvents(input: PlannerInput, carbohydrate: CarbohydrateTarget, hydration: HydrationTarget): CompetitionEvent[] {
  const step = input.sport === "hiking" || input.durationMinutes >= 240 ? 40 : 30;
  const events: CompetitionEvent[] = [];
  const choPerEvent = roundToStep((carbohydrate.gramsPerHourTypical * step) / 60, 5);
  const fluidPerEvent = roundToStep((hydration.mlPerHourTypical * step) / 60, 25);
  const sodiumPerEvent = roundToStep((hydration.mlPerHourTypical * step) / 1000 * 350, 50);

  events.push({
    minute: 0,
    label: "Salida",
    items: ["Empieza hidratado.", "Primer bidón listo."],
  });

  for (let minute = step; minute < input.durationMinutes - 15; minute += step) {
    if (events.length >= 10) break;
    const items: string[] = [];
    if (choPerEvent > 0) items.push(`${choPerEvent} g de carbohidratos.`);
    if (fluidPerEvent > 0) items.push(`${fluidPerEvent} ml de líquido.`);
    if (sodiumPerEvent > 0 && input.temperatureC >= 22) items.push(`~${sodiumPerEvent} mg de sodio.`);
    events.push({
      minute,
      label: `Punto de control`,
      carbohydrateGrams: choPerEvent,
      fluidMl: fluidPerEvent,
      sodiumMg: sodiumPerEvent > 0 ? sodiumPerEvent : undefined,
      items,
    });
  }

  return events;
}

function finishEvents(input: PlannerInput): CompetitionEvent[] {
  return [
    {
      minute: input.durationMinutes,
      label: "Meta inmediata",
      items: ["Bebe según sed.", "Si hay calor, repone sodio con comida/bebida habitual."],
    },
    {
      minute: Math.min(input.durationMinutes + 15, input.durationMinutes + 30),
      label: "Primera toma post-meta",
      carbohydrateGrams: roundToStep(1.2 * 75, 5),
      items: ["Carbohidratos + proteína si la hay disponible.", "No esperes a llegar a casa si la sesión ha sido larga."],
    },
  ];
}

function recoveryEvents(carbohydrate: CarbohydrateTarget, hydration: HydrationTarget): CompetitionEvent[] {
  const recoveryCarbs = roundToStep(carbohydrate.gramsPerHourTypical * 1.0, 5);
  const recoveryFluid = roundToStep(hydration.mlPerHourTypical * 0.6, 50);

  return [
    {
      minute: 0,
      label: "Ventana práctica de recuperación",
      carbohydrateGrams: recoveryCarbs,
      fluidMl: recoveryFluid,
      items: [
        "Comida/carbohidratos en las siguientes horas.",
        "Proteína dentro de la comida habitual.",
        "Agua y electrolitos según sed.",
      ],
    },
    {
      minute: 120,
      label: "Comida principal post-esfuerzo",
      carbohydrateGrams: roundToStep(recoveryCarbs * 1.5, 5),
      fluidMl: roundToStep(recoveryFluid * 1.2, 50),
      items: ["Comida completa rica en carbohidratos.", "Proteína y vegetales."],
    },
  ];
}

function emergencyStrategy(input: PlannerInput): string[] {
  const items: string[] = [];
  if (input.durationMinutes >= 120) {
    items.push("Si te retrasas, prioriza líquido + carbohidratos antes que la timing perfecta.");
  }
  items.push("Lleva siempre un bidón extra de reserva.");
  items.push("Si el estómago falla, reduce la cantidad y aumenta la frecuencia.");
  items.push("No fuerces una ingesta que no toleras: la consistencia del día importa más que una toma puntual.");
  if (input.temperatureC >= 28) {
    items.push("En calor, prioriza hidratación y sodio antes que carbohidratos extra.");
  }
  return items;
}

export function calculateCompetition(input: PlannerInput, carbohydrate: CarbohydrateTarget, hydration: HydrationTarget): CompetitionStrategy {
  const preStart = preStartEvents(input, carbohydrate, hydration);
  const during = duringEvents(input, carbohydrate, hydration);
  const finish = finishEvents(input);
  const recovery = recoveryEvents(carbohydrate, hydration);
  const emergency = emergencyStrategy(input);

  const summary =
    input.durationMinutes < 60
      ? "Sesión corta: prioriza empezar hidratado y tener un snack de reserva."
      : input.durationMinutes < 180
        ? "Sesión media: timing regular de tomas, bidón preparado y snack de precaución."
        : "Sesión larga: timing estricto, reservas extra y tolerancia digestiva probada previamente.";

  return {
    summary,
    preStart,
    during,
    finish,
    recovery,
    emergency,
    meta: META,
  };
}
