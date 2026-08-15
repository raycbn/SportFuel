const KEY = "sportfuel.sweat-rate.v1";

export interface StoredSweatRate {
  litersPerHour: number;
  savedAt: string;
}

export function saveSweatRate(litersPerHour: number): void {
  const payload: StoredSweatRate = { litersPerHour, savedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function readSweatRate(): StoredSweatRate | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSweatRate;
    if (typeof parsed.litersPerHour !== "number" || parsed.litersPerHour <= 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSweatRate(): void {
  localStorage.removeItem(KEY);
}
