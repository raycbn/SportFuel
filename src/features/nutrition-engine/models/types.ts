export const MVP_SPORTS = ["cycling", "running", "trail"] as const;
export const ARCHITECTURE_SPORTS = [
  "hiking",
  "triathlon",
  "football",
  "swimming",
  "mtb",
  "gravel",
  "tennis",
  "padel",
  "crossfit",
  "skiing",
] as const;

export const ALL_SPORTS = [...MVP_SPORTS, ...ARCHITECTURE_SPORTS] as const;

export type SportId = (typeof ALL_SPORTS)[number];
export type Intensity = "easy" | "moderate" | "hard";
export type ActivityGoal = "complete" | "train" | "perform";
export type FuelPreference = "real-food" | "sports-products" | "mixed";
export type ClinicalFlag =
  | "diabetes"
  | "kidney"
  | "cardiovascular"
  | "pregnancy"
  | "eating-disorder"
  | "severe-allergy"
  | "relevant-medication"
  | "other-clinical";

export interface EvidenceSource {
  id: string;
  shortName: string;
  title: string;
  authors?: string;
  year: number;
  organization?: string;
  url: string;
  doi?: string;
  notes: string;
}

export interface NutritionRuleMeta {
  ruleId: string;
  ruleVersion: string;
  reviewedAt: string;
  evidenceSources: string[];
  limitations: string[];
}

export interface PlannerInput {
  sport: SportId;
  durationMinutes: number;
  distanceKm?: number;
  elevationGainM?: number;
  intensity: Intensity;
  bodyMassKg: number;
  temperatureC: number;
  goal: ActivityGoal;
  fuelPreference: FuelPreference;
  availableFoodIds?: string[];
  sweatRateLPerHour?: number;
  digestiveTolerance?: "low" | "normal" | "trained";
  caffeinePreferred?: boolean;
  competition?: boolean;
  dietaryRestrictions?: string[];
  clinicalFlags?: ClinicalFlag[];
}

export interface ValidationIssue {
  field: string;
  message: string;
  code: string;
}

export interface CarbohydrateTarget {
  gramsPerHourMin: number;
  gramsPerHourMax: number;
  gramsPerHourTypical: number;
  totalGramsMin: number;
  totalGramsMax: number;
  multipleTransportableRecommended: boolean;
  mouthRinseOptional: boolean;
  gutTrainingNote?: string;
  assumptions: string[];
  warnings: string[];
  why: string;
  meta: NutritionRuleMeta;
}

export interface HydrationTarget {
  mlPerHourMin: number;
  mlPerHourMax: number;
  mlPerHourTypical: number;
  totalMlMin: number;
  totalMlMax: number;
  usedMeasuredSweatRate: boolean;
  assumptions: string[];
  warnings: string[];
  why: string;
  meta: NutritionRuleMeta;
}

export interface ElectrolyteEstimate {
  applicable: boolean;
  sodiumMgPerHourMin: number;
  sodiumMgPerHourMax: number;
  contextualNote: string;
  assumptions: string[];
  warnings: string[];
  why: string;
  meta: NutritionRuleMeta;
}

export interface FoodExample {
  name: string;
  reason: string;
}

export interface PreActivityPlan {
  timingLabel: string;
  carbohydrateGPerKgMin: number;
  carbohydrateGPerKgMax: number;
  exampleMealGramsMin: number;
  exampleMealGramsMax: number;
  hydrationNote: string;
  foodExamples: FoodExample[];
  assumptions: string[];
  why: string;
  meta: NutritionRuleMeta;
}

export interface TimelineEvent {
  minute: number;
  label: string;
  carbohydrateGrams?: number;
  fluidMl?: number;
  items: string[];
  note?: string;
}

export interface DuringActivityPlan {
  events: TimelineEvent[];
  strategySummary: string;
  why: string;
  meta: NutritionRuleMeta;
}

export interface RecoveryPlan {
  carbohydrateNote: string;
  proteinNote: string;
  hydrationNote: string;
  mealExamples: string[];
  avoidAbsoluteWindowClaim: true;
  why: string;
  meta: NutritionRuleMeta;
}

export type ProductCategory =
  | "gels"
  | "bars"
  | "isotonic"
  | "electrolytes"
  | "bottles"
  | "sports-foods"
  | "real-food"
  | "water";

export interface CatalogProduct {
  id: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  carbohydrateG: number;
  fluidMl: number;
  sodiumMg: number;
  proteinG?: number;
  servingLabel: string;
  preference: FuelPreference | "any";
  examplePriceEur: number;
  costTier: "economy" | "mid" | "sport";
  notes?: string;
}

export interface AffiliateOffer {
  id: string;
  productId: string;
  provider: "amazon" | "decathlon" | "brand" | "store";
  region: "es" | "eu" | "global";
  enabled: boolean;
  url?: string;
}

export interface PantryMatch {
  productId: string;
  name: string;
  servings: number;
  carbohydrateG: number;
  fluidMl: number;
  sodiumMg: number;
  category: ProductCategory;
}

export interface ShoppingItem {
  name: string;
  category: "food" | "drink" | "supplement";
  quantityLabel: string;
  optional: boolean;
  notes?: string;
}

export interface OutingCost {
  economyEur: number;
  midEur: number;
  sportEur: number;
  assumptions: string[];
  disclaimer: string;
}

export interface NutritionPlan {
  id: string;
  createdAt: string;
  shareSlug: string;
  sport: SportId;
  durationMinutes: number;
  intensity: Intensity;
  temperatureC: number;
  goal: ActivityGoal;
  fuelPreference: FuelPreference;
  calculatorReady: boolean;
  blockedReason?: string;
  summary: {
    carbohydratePerHourLabel: string;
    hydrationPerHourLabel: string;
    electrolyteLabel: string;
  };
  carbohydrate: CarbohydrateTarget;
  hydration: HydrationTarget;
  electrolytes: ElectrolyteEstimate;
  preActivity: PreActivityPlan;
  during: DuringActivityPlan;
  recovery: RecoveryPlan;
  pantry: {
    used: PantryMatch[];
    missing: string[];
    coveragePercent: number;
  };
  shoppingList: ShoppingItem[];
  cost: OutingCost;
  disclaimer: string;
  engineVersion: string;
  competitionStrategy?: import("../calculators/competition").CompetitionStrategy;
  digestiveAdaptation?: import("../calculators/digestive-adaptation").DigestiveAdaptation;
}

export interface SweatRateInput {
  weightBeforeKg: number;
  weightAfterKg: number;
  fluidIngestedMl: number;
  durationMinutes: number;
  urineDuringMl?: number;
}

export interface SweatRateResult {
  sweatLossL: number;
  sweatRateLPerHour: number;
  formula: string;
  limitations: string[];
  warnings: string[];
  clinicalDisclaimer: string;
}
