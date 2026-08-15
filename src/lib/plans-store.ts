import type { NutritionPlan, SportId } from "@/features/nutrition-engine";

const KEY = "sportfuel.saved-plans.v1";

export interface SavedPlanRecord {
  id: string;
  ownerEmail: string;
  createdAt: string;
  favorite: boolean;
  sport: SportId;
  durationMinutes: number;
  shareSlug: string;
  publicPayload: string;
  title: string;
}

function readAll(): SavedPlanRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as SavedPlanRecord[];
  } catch {
    return [];
  }
}

function writeAll(records: SavedPlanRecord[]): void {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function listPlans(email: string): SavedPlanRecord[] {
  return readAll()
    .filter((record) => record.ownerEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function savePlan(email: string, plan: NutritionPlan, publicPayload: string): SavedPlanRecord {
  const record: SavedPlanRecord = {
    id: plan.id,
    ownerEmail: email,
    createdAt: plan.createdAt,
    favorite: false,
    sport: plan.sport,
    durationMinutes: plan.durationMinutes,
    shareSlug: plan.shareSlug,
    publicPayload,
    title: `${plan.sport} · ${Math.round(plan.durationMinutes / 60)} h`,
  };
  writeAll([record, ...readAll().filter((item) => item.id !== plan.id)]);
  return record;
}

export function toggleFavorite(id: string): void {
  writeAll(readAll().map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item)));
}

export function deletePlan(id: string, email: string): void {
  writeAll(readAll().filter((item) => !(item.id === id && item.ownerEmail === email)));
}
