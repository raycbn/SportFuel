import { CATALOG, getProduct } from "../data/catalog";
import type {
  CarbohydrateTarget,
  CatalogProduct,
  FuelPreference,
  HydrationTarget,
  OutingCost,
  PantryMatch,
  PlannerInput,
  ShoppingItem,
} from "../models/types";

function preferredProducts(preference: FuelPreference): CatalogProduct[] {
  return CATALOG.filter((item) => {
    if (item.category === "bottles") return false;
    if (preference === "real-food") return item.preference === "real-food" || item.id === "water";
    if (preference === "sports-products") return item.preference !== "real-food" || item.id === "water";
    return true;
  });
}

export function matchPantry(
  input: PlannerInput,
  carbohydrate: CarbohydrateTarget,
  hydration: HydrationTarget,
): { used: PantryMatch[]; missing: string[]; coveragePercent: number } {
  const hours = input.durationMinutes / 60;
  const targetCho = carbohydrate.gramsPerHourTypical * hours;
  const targetFluid = hydration.mlPerHourTypical * hours;
  const selected = (input.availableFoodIds ?? []).map(getProduct).filter((item): item is CatalogProduct => Boolean(item));

  if (selected.length === 0) {
    return { used: [], missing: ["Aún no has indicado qué tienes en casa."], coveragePercent: 0 };
  }

  const used: PantryMatch[] = [];
  let cho = 0;
  let fluid = 0;
  let sodium = 0;

  const sorted = [...selected].sort((a, b) => {
    const score = (item: CatalogProduct) => {
      if (input.fuelPreference === "real-food" && item.preference === "real-food") return 2;
      if (input.fuelPreference === "sports-products" && item.preference === "sports-products") return 2;
      return 1;
    };
    return score(b) - score(a);
  });

  for (const item of sorted) {
    if (cho >= targetCho && fluid >= targetFluid) break;
    const needCho = Math.max(0, targetCho - cho);
    const needFluid = Math.max(0, targetFluid - fluid);
    const byCho = item.carbohydrateG > 0 ? Math.ceil(needCho / item.carbohydrateG) : 0;
    const byFluid = item.fluidMl > 0 ? Math.ceil(needFluid / item.fluidMl) : 0;
    let servings = Math.max(byCho, byFluid, item.carbohydrateG === 0 && item.fluidMl === 0 ? 0 : 1);
    servings = Math.min(servings, 8);
    if (servings <= 0) continue;
    if (item.carbohydrateG > 0 && cho >= targetCho * 1.15 && item.fluidMl === 0) continue;
    used.push({
      productId: item.id,
      name: item.name,
      servings,
      carbohydrateG: servings * item.carbohydrateG,
      fluidMl: servings * item.fluidMl,
      sodiumMg: servings * item.sodiumMg,
      category: item.category,
    });
    cho += servings * item.carbohydrateG;
    fluid += servings * item.fluidMl;
    sodium += servings * item.sodiumMg;
  }

  const missing: string[] = [];
  if (cho < targetCho * 0.8) missing.push("Más fuentes de carbohidratos (fruta, pan, gel o bebida).");
  if (fluid < targetFluid * 0.7) missing.push("Más líquido (agua o isotónico).");
  if (input.durationMinutes >= 90 && sodium < 200) missing.push("Algo de sodio (isotónico, pan o electrolitos) si la sesión es larga o calurosa.");

  const coverage = Math.round(Math.min(100, ((Math.min(cho, targetCho) / Math.max(targetCho, 1)) * 0.6 + (Math.min(fluid, targetFluid) / Math.max(targetFluid, 1)) * 0.4) * 100));

  return { used, missing, coveragePercent: coverage };
}

export function buildShoppingList(
  input: PlannerInput,
  carbohydrate: CarbohydrateTarget,
  hydration: HydrationTarget,
): ShoppingItem[] {
  const hours = input.durationMinutes / 60;
  const cho = carbohydrate.gramsPerHourTypical * hours;
  const fluid = hydration.mlPerHourTypical * hours;
  const items: ShoppingItem[] = [];
  const pool = preferredProducts(input.fuelPreference);

  const food = pool.filter((item) => item.fluidMl === 0 && item.carbohydrateG > 0 && item.category !== "electrolytes");
  const drinks = pool.filter((item) => item.fluidMl > 0);
  const extras = pool.filter((item) => item.category === "electrolytes");

  const pick = food[0] ?? pool[0];
  if (pick && cho > 0) {
    const servings = Math.min(8, Math.max(1, Math.ceil(cho / Math.max(pick.carbohydrateG, 1))));
    items.push({
      name: pick.name,
      category: pick.category === "gels" || pick.category === "bars" ? "supplement" : "food",
      quantityLabel: `${servings} × ${pick.servingLabel}`,
      optional: false,
      notes: "Cantidad orientativa para cubrir el objetivo de carbohidratos. Ningún producto concreto es obligatorio.",
    });
  }

  if (food[1] && cho > 40) {
    items.push({
      name: food[1].name,
      category: "food",
      quantityLabel: `2–4 × ${food[1].servingLabel}`,
      optional: true,
      notes: "Alternativa o complemento para no depender de un solo alimento.",
    });
  }

  const drink = drinks.find((item) => item.id === "water") ?? drinks[0];
  if (drink) {
    const bottles = Math.max(1, Math.ceil(fluid / Math.max(drink.fluidMl, 500)));
    items.push({
      name: drink.name,
      category: "drink",
      quantityLabel: `${bottles} × ${drink.servingLabel}`,
      optional: false,
    });
  }

  if (input.fuelPreference !== "real-food") {
    const iso = drinks.find((item) => item.id === "isotonic");
    if (iso && input.durationMinutes >= 75) {
      items.push({
        name: iso.name,
        category: "drink",
        quantityLabel: `${Math.max(1, Math.round(hours))} × ${iso.servingLabel}`,
        optional: true,
        notes: "Opción, no requisito. Puedes sustituir por agua + comida + algo de sal.",
      });
    }
  }

  if (extras[0] && input.durationMinutes >= 90 && input.temperatureC >= 22) {
    items.push({
      name: extras[0].name,
      category: "supplement",
      quantityLabel: `${Math.max(1, Math.round(hours))} ración`,
      optional: true,
      notes: "Solo si no cubres sodio con comida o isotónico. No es una megadosis.",
    });
  }

  return items;
}

export function estimateOutingCost(input: PlannerInput, carbohydrate: CarbohydrateTarget): OutingCost {
  const hours = Math.max(1, input.durationMinutes / 60);
  const cho = carbohydrate.gramsPerHourTypical * hours;
  const economy = 0.35 * hours + cho * 0.012;
  const mid = 1.1 * hours + cho * 0.03;
  const sport = 2.4 * hours + cho * 0.055;
  return {
    economyEur: Math.round(economy * 10) / 10,
    midEur: Math.round(mid * 10) / 10,
    sportEur: Math.round(sport * 10) / 10,
    assumptions: [
      "Precios de ejemplo editables en el catálogo local (sin API de precios).",
      "Económica ≈ comida real; intermedia ≈ mezcla; deportiva ≈ geles/isotónicos de ejemplo.",
    ],
    disclaimer: "No es un precio de mercado en tiempo real ni una recomendación de marca. Ningún producto es obligatorio.",
  };
}
