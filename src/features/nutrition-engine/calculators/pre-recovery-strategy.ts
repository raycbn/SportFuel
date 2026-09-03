import type { PlannerInput, PreRecoveryStrategy } from "../models/types";
import type { HydrationTarget, PreActivityPlan, RecoveryPlan } from "../models/types";

export function calculatePreRecoveryStrategy(
  input: PlannerInput,
  preActivity: PreActivityPlan,
  recovery: RecoveryPlan,
  hydration: HydrationTarget,
): PreRecoveryStrategy {
  const duration = input.durationMinutes;
  const isShort = duration < 45;
  const isMedium = duration >= 45 && duration < 120;
  const isLong = duration >= 120;
  const isVeryLong = duration >= 180;
  const isHighIntensity = input.intensity === "hard";
  const isCompetition = Boolean(input.competition);
  const hasSweatRate = typeof input.sweatRateLPerHour === "number" && input.sweatRateLPerHour > 0;
  const tolerance = input.digestiveTolerance ?? "normal";

  const preSummary = buildPreSummary(input, isShort, isMedium, isLong, isVeryLong, isHighIntensity, isCompetition);
  const preTiming = buildPreTiming(input, isShort, isMedium, isLong, isVeryLong, isCompetition);
  const preNutrition = buildPreNutrition(input, preActivity, tolerance, isCompetition);
  const preHydration = buildPreHydration(input, preActivity, hasSweatRate);

  const recoverySummary = buildRecoverySummary(input, isShort, isMedium, isLong, isVeryLong, isHighIntensity, isCompetition);
  const recoveryImmediate = buildRecoveryImmediate(input, isShort, isMedium, isLong, isVeryLong, isHighIntensity, isCompetition);
  const recoveryHydration = buildRecoveryHydration(input, hydration, hasSweatRate);
  const recoveryNutrition = buildRecoveryNutrition(input, recovery, tolerance, isCompetition);

  return {
    preActivity: {
      summary: preSummary,
      timingGuidance: preTiming,
      nutritionGuidance: preNutrition,
      hydrationGuidance: preHydration,
    },
    recovery: {
      summary: recoverySummary,
      immediateGuidance: recoveryImmediate,
      hydrationGuidance: recoveryHydration,
      nutritionGuidance: recoveryNutrition,
    },
  };
}

function buildPreSummary(
  _input: PlannerInput,
  isShort: boolean,
  _isMedium: boolean,
  isLong: boolean,
  isVeryLong: boolean,
  isHighIntensity: boolean,
  isCompetition: boolean,
): string {
  if (isCompetition) {
    return "Rutina pre-competición: comida probada, timing fijo y sin experimentos nuevos el día de la salida.";
  }
  if (isShort) {
    return "Esfuerzo corto: prioriza llegar con el estómago cómodo y sin volumen innecesario. Una comida ligera 1–2 h antes suele bastar.";
  }
  if (isLong || isVeryLong) {
    return "Esfuerzo prolongado: la comida previa es parte del plan. Aporta carbohidratos suficientes y deja margen de digestión antes de la salida.";
  }
  if (isHighIntensity) {
    return "Intensidad alta: evita comidas copiosas justo antes. Prefiere porciones moderadas y alimentos de digestión conocida.";
  }
  return "Plan estándar: comida familiar rica en carbohidratos 1–3 h antes, sin excesos y sin probar nada nuevo el día de la salida.";
}

function buildPreTiming(
  _input: PlannerInput,
  isShort: boolean,
  isMedium: boolean,
  isLong: boolean,
  isVeryLong: boolean,
  isCompetition: boolean,
): string[] {
  const guidance: string[] = [];

  if (isCompetition) {
    guidance.push("Mantén el mismo horario de comida que en tus entrenamientos.");
    guidance.push("Si la salida es por la mañana, desayuna 2–3 h antes; si es por la tarde, come 3–4 h antes.");
    guidance.push("Deja 45–60 min de margen sin alimentos sólidos antes de la salida.");
    return guidance;
  }

  if (isShort) {
    guidance.push("1–2 h antes: snack o comida ligera.");
    guidance.push("No hace falta cargar mucho para esfuerzos menores de ~45 min.");
    return guidance;
  }

  if (isMedium) {
    guidance.push("1,5–3 h antes: comida principal con carbohidratos.");
    guidance.push("Si sales muy temprano, prioriza un desayuno más sustancioso la noche anterior.");
    return guidance;
  }

  if (isLong || isVeryLong) {
    guidance.push("2–4 h antes: comida principal generosa en carbohidratos.");
    guidance.push("En esfuerzos >3 h, considera un snack adicional 30–60 min antes si aún tienes hambre.");
    guidance.push("Si la salida es muy temprana, aumenta la cena del día anterior.");
    return guidance;
  }

  guidance.push("1–3 h antes: comida principal.");
  guidance.push("Ajusta la cantidad según tu hambre y el tiempo de digestión.");
  return guidance;
}

function buildPreNutrition(
  input: PlannerInput,
  preActivity: PreActivityPlan,
  tolerance: string,
  isCompetition: boolean,
): string[] {
  const guidance: string[] = [];

  if (isCompetition) {
    guidance.push("Usa alimentos que hayas probado en entrenamiento.");
    guidance.push("Evita probar geles, barritas o bebidas nuevas el día de la competición.");
    return guidance;
  }

  if (tolerance === "low") {
    guidance.push("Prefiere alimentos familiares y de digestión segura.");
    guidance.push("Evita comidas muy grasas, muy fibrosas o muy nuevas antes de la salida.");
    guidance.push("Fruta madura, pan, arroz o productos deportivos de composición sencilla suelen tolerarse mejor.");
  } else if (tolerance === "trained") {
    guidance.push("Puedes permitirte comidas algo más densas si las has probado antes.");
    guidance.push("Mantén siempre una opción de reserva más ligera por si aparecen molestias.");
  } else {
    guidance.push("Combina comida real y productos deportivos según tu preferencia.");
    guidance.push("No introduzcas alimentos nuevos el día de la salida.");
  }

  if (input.durationMinutes >= 120) {
    guidance.push(`Objetivo práctico: ${preActivity.exampleMealGramsMin}–${preActivity.exampleMealGramsMax} g de carbohidratos en la comida previa.`);
  }

  if (input.caffeinePreferred && input.durationMinutes >= 45) {
    guidance.push("Si tomas cafeína, hazlo con margen suficiente respecto a la comida principal para evaluar tu respuesta.");
  }

  return guidance;
}

function buildPreHydration(
  input: PlannerInput,
  _preActivity: PreActivityPlan,
  hasSweatRate: boolean,
): string[] {
  const guidance: string[] = [];

  guidance.push("Empieza euhidratado: orina clara/pálida es una señal práctica.");
  guidance.push("Bebe con regularidad las horas previas; no esperes a beber mucho justo al salir.");

  if (hasSweatRate) {
    guidance.push(`Tu tasa de sudoración medida ayuda a planificar la reposición post-esfuerzo, no a forzar la ingesta pre-salida.`);
  }

  if (input.temperatureC >= 28) {
    guidance.push("En calor, prioriza bebidas frías y pequeñas cantidades con antelación.");
  }

  return guidance;
}

function buildRecoverySummary(
  _input: PlannerInput,
  isShort: boolean,
  _isMedium: boolean,
  isLong: boolean,
  isVeryLong: boolean,
  isHighIntensity: boolean,
  isCompetition: boolean,
): string {
  if (isCompetition) {
    return "Recuperación post-competición: prioriza rehidratación y comida habitual en las siguientes horas. No hace falta un protocolo agresivo si no hay otra sesión pronto.";
  }
  if (isShort) {
    return "Esfuerzo corto: con agua, comida normal y descanso basta. No necesitas una ventana especial de recuperación.";
  }
  if (isVeryLong || isLong) {
    return "Esfuerzo prolongado: la recuperación empieza al terminar. Hidratación, comida rica en carbohidratos y, si corresponde, proteína en las siguientes horas.";
  }
  if (isHighIntensity) {
    return "Intensidad alta: hidratación y comida normal en las 2–4 h siguientes suelen ser suficientes.";
  }
  return "Recuperación estándar: agua, comida normal y descanso. Si hay otra sesión exigente pronto, repón carbohidratos con más atención.";
}

function buildRecoveryImmediate(
  _input: PlannerInput,
  isShort: boolean,
  isMedium: boolean,
  isLong: boolean,
  isVeryLong: boolean,
  isHighIntensity: boolean,
  isCompetition: boolean,
): string[] {
  const guidance: string[] = [];

  if (isCompetition) {
    guidance.push("Al llegar: fluido y snack salado si hay disponible.");
    guidance.push("Si la competición fue larga (>2 h), prioriza carbohidratos y proteína en la primera comida.");
    return guidance;
  }

  if (isShort) {
    guidance.push("Agua según sed. No hace falta protocolo especial.");
    return guidance;
  }

  if (isLong || isVeryLong) {
    guidance.push("0–30 min: agua o bebida con electrolitos según sed.");
    guidance.push("Si no hay prisa, una comida normal en las 2–4 h siguientes suele bastar.");
    guidance.push("Si hay otra sesión exigente pronto (<4–8 h), repón carbohidratos con más atención.");
  } else if (isMedium) {
    guidance.push("0–30 min: agua o bebida con electrolitos.");
    guidance.push("Come en las 2–4 h siguientes; no hace falta ventana especial.");
  } else {
    guidance.push("Agua según sed y comida normal en las horas siguientes.");
  }

  if (isHighIntensity) {
    guidance.push("Después de intensidades altas, hidratación y comida salada ayudan a recuperar mejor.");
  }

  return guidance;
}

function buildRecoveryHydration(
  input: PlannerInput,
  _hydration: HydrationTarget,
  hasSweatRate: boolean,
): string[] {
  const guidance: string[] = [];

  if (hasSweatRate) {
    guidance.push(
      `Repone gradualmente el déficit de la sesión. Si mediste sudoración, úsala como referencia para la cantidad aproximada a recuperar.`,
    );
  } else {
    guidance.push("Bebe según sed en las horas siguientes. El motor ya indica el rango orientativo de hidratación durante la sesión.");
  }

  if (input.temperatureC >= 28) {
    guidance.push("En calor, pequeñas tomas frías y regulares funcionan mejor que un gran volumen de una vez.");
  }

  guidance.push("Si necesitas rehidratar rápido, ACSM menciona reponer más del déficit (en torno a 125–150 %) con algo de sodio.");
  guidance.push("Si no hay prisa, agua y comida salada habituales suelen bastar.");

  return guidance;
}

function buildRecoveryNutrition(
  input: PlannerInput,
  recovery: RecoveryPlan,
  tolerance: string,
  isCompetition: boolean,
): string[] {
  const guidance: string[] = [];

  if (isCompetition) {
    guidance.push("En competición, la primera comida post-esfuerzo es clave: elige alimentos que ya conozcas.");
    guidance.push("Si el esfuerzo fue muy largo, prioriza carbohidratos y proteína en la comida posterior.");
    return guidance;
  }

  guidance.push(recovery.carbohydrateNote);

  if (input.durationMinutes >= 60) {
    guidance.push(recovery.proteinNote);
  }

  if (tolerance === "low") {
    guidance.push("En recuperación, evita alimentos muy ricos en fibra o muy grasos si no los toleras bien.");
    guidance.push("Prefiere opciones suaves de estómago: yogur, pan, arroz, fruta madura.");
  } else if (tolerance === "trained") {
    guidance.push("Puedes incluir comidas más densas en la recuperación si las toleras habitualmente.");
  }

  guidance.push("Ejemplos prácticos: " + recovery.mealExamples.slice(0, 2).join("; ") + ".");

  return guidance;
}
