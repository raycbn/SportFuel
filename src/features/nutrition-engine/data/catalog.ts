import type { AffiliateOffer, CatalogProduct } from "../models/types";

export const CATALOG: CatalogProduct[] = [
  { id: "banana", name: "Plátano", category: "real-food", carbohydrateG: 27, fluidMl: 0, sodiumMg: 1, servingLabel: "1 mediano", preference: "real-food", examplePriceEur: 0.3, costTier: "economy" },
  { id: "dates", name: "Dátiles", category: "real-food", carbohydrateG: 18, fluidMl: 0, sodiumMg: 1, servingLabel: "3 unidades", preference: "real-food", examplePriceEur: 0.4, costTier: "economy" },
  { id: "bread", name: "Pan", category: "real-food", carbohydrateG: 15, fluidMl: 0, sodiumMg: 140, servingLabel: "1 rebanada", preference: "real-food", examplePriceEur: 0.15, costTier: "economy" },
  { id: "honey", name: "Miel", category: "real-food", carbohydrateG: 16, fluidMl: 0, sodiumMg: 1, servingLabel: "20 g", preference: "real-food", examplePriceEur: 0.25, costTier: "economy" },
  { id: "fruit", name: "Fruta", category: "real-food", carbohydrateG: 20, fluidMl: 0, sodiumMg: 2, servingLabel: "1 ración", preference: "real-food", examplePriceEur: 0.4, costTier: "economy" },
  { id: "yogurt", name: "Yogur", category: "real-food", carbohydrateG: 15, fluidMl: 0, sodiumMg: 60, proteinG: 8, servingLabel: "125 g", preference: "real-food", examplePriceEur: 0.45, costTier: "economy" },
  { id: "rice", name: "Arroz cocido", category: "real-food", carbohydrateG: 28, fluidMl: 0, sodiumMg: 1, servingLabel: "100 g", preference: "real-food", examplePriceEur: 0.2, costTier: "economy" },
  { id: "bar", name: "Barrita", category: "bars", carbohydrateG: 25, fluidMl: 0, sodiumMg: 80, servingLabel: "1 barrita", preference: "mixed", examplePriceEur: 1.2, costTier: "mid" },
  { id: "gel", name: "Gel deportivo (ejemplo)", category: "gels", carbohydrateG: 22, fluidMl: 0, sodiumMg: 50, servingLabel: "1 gel", preference: "sports-products", examplePriceEur: 2.2, costTier: "sport" },
  { id: "isotonic", name: "Bebida isotónica", category: "isotonic", carbohydrateG: 30, fluidMl: 500, sodiumMg: 250, servingLabel: "500 ml", preference: "sports-products", examplePriceEur: 1.5, costTier: "mid" },
  { id: "cho-drink", name: "Bebida con carbohidratos", category: "sports-foods", carbohydrateG: 40, fluidMl: 500, sodiumMg: 200, servingLabel: "500 ml", preference: "sports-products", examplePriceEur: 1.8, costTier: "sport" },
  { id: "water", name: "Agua", category: "water", carbohydrateG: 0, fluidMl: 500, sodiumMg: 0, servingLabel: "500 ml", preference: "any", examplePriceEur: 0.2, costTier: "economy" },
  { id: "electrolytes", name: "Electrolitos (tableta/sobre)", category: "electrolytes", carbohydrateG: 2, fluidMl: 0, sodiumMg: 300, servingLabel: "1 ración", preference: "sports-products", examplePriceEur: 0.8, costTier: "mid" },
  { id: "bottle", name: "Bidón 500–750 ml", category: "bottles", carbohydrateG: 0, fluidMl: 0, sodiumMg: 0, servingLabel: "1 bidón", preference: "any", examplePriceEur: 6, costTier: "mid", notes: "Material reutilizable; no es un alimento." },
];

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  { id: "aff-gel-amazon", productId: "gel", provider: "amazon", region: "es", enabled: false },
  { id: "aff-iso-decathlon", productId: "isotonic", provider: "decathlon", region: "es", enabled: false },
  { id: "aff-bar-brand", productId: "bar", provider: "brand", region: "eu", enabled: false },
  { id: "aff-electro-store", productId: "electrolytes", provider: "store", region: "es", enabled: false },
];

export function getProduct(id: string): CatalogProduct | undefined {
  return CATALOG.find((item) => item.id === id);
}

export const DEFAULT_PANTRY_IDS = ["banana", "dates", "bread", "honey", "bar", "gel", "isotonic", "cho-drink", "water", "electrolytes", "fruit", "yogurt", "rice"];
