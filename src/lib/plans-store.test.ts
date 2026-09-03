import { describe, expect, it, beforeEach } from "vitest";
import { countPlans, deletePlan, getEffectiveMaxSavedRoutes, listPlans, savePlan, toggleFavorite } from "@/lib/plans-store";

const KEY = "sportfuel.saved-plans.v1";

function clearStore() {
  localStorage.removeItem(KEY);
}

function makePlan(id: string, ownerEmail: string) {
  return {
    id,
    ownerEmail,
    createdAt: new Date().toISOString(),
    favorite: false,
    sport: "cycling",
    durationMinutes: 60,
    shareSlug: `slug-${id}`,
    publicPayload: "",
    title: "cycling · 1 h",
  } as unknown as import("@/features/nutrition-engine").NutritionPlan;
}

describe("plans-store limits", () => {
  beforeEach(() => {
    clearStore();
  });

  it("countPlans returns 0 for empty store", () => {
    expect(countPlans("user@example.com")).toBe(0);
  });

  it("getEffectiveMaxSavedRoutes returns 3 for free without backend value", () => {
    expect(getEffectiveMaxSavedRoutes(null, "free")).toBe(3);
  });

  it("getEffectiveMaxSavedRoutes respects backend value for free", () => {
    expect(getEffectiveMaxSavedRoutes(5, "free")).toBe(5);
  });

  it("getEffectiveMaxSavedRoutes returns infinity for premium", () => {
    expect(getEffectiveMaxSavedRoutes(null, "premium")).toBe(Number.POSITIVE_INFINITY);
  });

  it("getEffectiveMaxSavedRoutes returns infinity for premium even with backend value", () => {
    expect(getEffectiveMaxSavedRoutes(3, "premium")).toBe(Number.POSITIVE_INFINITY);
  });

  it("free user can save up to limit", () => {
    for (let i = 0; i < 3; i++) {
      savePlan("user@example.com", makePlan(`id-${i}`, "user@example.com"), "");
    }
    expect(countPlans("user@example.com")).toBe(3);
  });

  it("free user can still save when below limit", () => {
    savePlan("user@example.com", makePlan("id-1", "user@example.com"), "");
    expect(countPlans("user@example.com")).toBe(1);
  });

  it("preserves existing plans above legacy limit on migration", () => {
    for (let i = 0; i < 5; i++) {
      savePlan("user@example.com", makePlan(`id-${i}`, "user@example.com"), "");
    }
    expect(countPlans("user@example.com")).toBe(5);
    expect(listPlans("user@example.com").length).toBe(5);
  });

  it("toggles favorite without affecting count", () => {
    savePlan("user@example.com", makePlan("id-1", "user@example.com"), "");
    expect(countPlans("user@example.com")).toBe(1);
    toggleFavorite("id-1");
    expect(countPlans("user@example.com")).toBe(1);
  });

  it("deletes plan without affecting others", () => {
    savePlan("user@example.com", makePlan("id-1", "user@example.com"), "");
    savePlan("user@example.com", makePlan("id-2", "user@example.com"), "");
    deletePlan("id-1", "user@example.com");
    expect(countPlans("user@example.com")).toBe(1);
    const remaining = listPlans("user@example.com");
    expect(remaining[0]?.id).toBe("id-2");
  });
});
