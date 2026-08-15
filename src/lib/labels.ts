import type { ActivityGoal, FuelPreference, Intensity, SportId } from "@/features/nutrition-engine";

export const SPORT_LABELS: Record<SportId, string> = {
  cycling: "Ciclismo",
  running: "Running",
  trail: "Trail",
  hiking: "Senderismo",
  triathlon: "Triatlón",
  football: "Fútbol",
  swimming: "Natación",
  mtb: "MTB",
  gravel: "Gravel",
  tennis: "Tenis",
  padel: "Pádel",
  crossfit: "CrossFit",
  skiing: "Esquí",
};

export const SPORT_READY: SportId[] = ["cycling", "running", "trail", "hiking", "triathlon", "football"];

export const INTENSITY_LABELS: Record<Intensity, string> = {
  easy: "Suave",
  moderate: "Moderada",
  hard: "Alta",
};

export const GOAL_LABELS: Record<ActivityGoal, string> = {
  complete: "Terminar con buen cuerpo",
  train: "Entrenar bien",
  perform: "Rendir / competir",
};

export const PREFERENCE_LABELS: Record<FuelPreference, string> = {
  "real-food": "Prefiero comida real",
  "sports-products": "Productos deportivos",
  mixed: "Mezcla",
};

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
