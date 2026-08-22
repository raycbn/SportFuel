export const ENGINE_VERSION = "1.0.0";

export const INPUT_LIMITS = {
  durationMinutes: { min: 15, max: 720 },
  bodyMassKg: { min: 40, max: 150 },
  temperatureC: { min: -5, max: 45 },
  distanceKm: { min: 1, max: 400 },
  elevationGainM: { min: 0, max: 8000 },
  sweatRateLPerHour: { min: 0.2, max: 3.5 },
  weightBeforeKg: { min: 40, max: 150 },
  weightAfterKg: { min: 38, max: 152 },
  fluidIngestedMl: { min: 0, max: 8000 },
  urineDuringMl: { min: 0, max: 2000 },
} as const;

export const OUTPUT_CAPS = {
  carbohydrateGPerHour: { min: 0, max: 90 },
  hydrationMlPerHour: { min: 200, max: 1500 },
  sodiumMgPerHour: { min: 0, max: 1000 },
} as const;

export const DISCLAIMER =
  "Las cantidades mostradas son estimaciones orientativas basadas en parámetros de actividad y referencias de nutrición deportiva. Las necesidades individuales pueden variar. Si tienes una condición médica, tomas medicación, estás embarazada o tienes necesidades nutricionales especiales, consulta con un profesional sanitario.";

export const CLINICAL_BLOCK_MESSAGE =
  "Has indicado una condición clínica relevante. PedalMap Fuel no personaliza planes en estos casos porque podría ser inadecuado o inseguro. Consulta con un profesional sanitario antes de cambiar tu alimentación, hidratación o uso de suplementos.";
