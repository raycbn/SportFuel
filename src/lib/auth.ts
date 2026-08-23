import type { FuelPreference, SportId } from "@/features/nutrition-engine";

const USERS_KEY = "sportfuel.users.v1";
const SESSION_KEY = "sportfuel.session.v1";

export interface UserProfile {
  email: string;
  passwordHash?: string;
  createdAt: string;
  weightKg?: number;
  usualSports?: SportId[];
  fuelPreference?: FuelPreference;
  provider?: AuthProvider;
  pedalmapUid?: string;
  displayName?: string;
}

export type AuthProvider = "local" | "pedalmap";

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers(): UserProfile[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as UserProfile[];
  } catch {
    return [];
  }
}

function writeUsers(users: UserProfile[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSessionEmail(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function getCurrentUser(): UserProfile | null {
  const email = getSessionEmail();
  if (!email) return null;
  return readUsers().find((user) => user.email === email) ?? null;
}

export async function registerLocal(email: string, password: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, message: "Introduce un email válido." };
  }
  if (password.length < 8) {
    return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };
  }
  const users = readUsers();
  if (users.some((user) => user.email === normalized)) {
    return { ok: false, message: "Ya existe una cuenta con ese email en este dispositivo." };
  }
  users.push({
    email: normalized,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, normalized);
  return { ok: true };
}

export async function loginLocal(email: string, password: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const normalized = email.trim().toLowerCase();
  const user = readUsers().find((item) => item.email === normalized);
  if (!user || user.passwordHash !== (await hashPassword(password))) {
    return { ok: false, message: "Email o contraseña no coinciden." };
  }
  localStorage.setItem(SESSION_KEY, normalized);
  return { ok: true };
}

export function logoutLocal(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function updateProfile(patch: Partial<Pick<UserProfile, "weightKg" | "usualSports" | "fuelPreference">>): void {
  const email = getSessionEmail();
  if (!email) return;
  const users = readUsers().map((user) => (user.email === email ? { ...user, ...patch } : user));
  writeUsers(users);
}

export function deleteAccount(): void {
  const email = getSessionEmail();
  if (!email) return;
  writeUsers(readUsers().filter((user) => user.email !== email));
  localStorage.removeItem(SESSION_KEY);
}

export async function handoffLogin(params: {
  email: string;
  pedalmapUid: string;
  displayName?: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const normalized = params.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, message: "Email inválido." };
  }
  const users = readUsers();
  const existing = users.find((user) => user.email === normalized);
  if (existing) {
    existing.provider = "pedalmap";
    existing.pedalmapUid = params.pedalmapUid;
    if (params.displayName && !existing.usualSports?.length) {
      existing.displayName = params.displayName;
    }
    writeUsers(users);
    localStorage.setItem(SESSION_KEY, normalized);
    return { ok: true };
  }
  users.push({
    email: normalized,
    createdAt: new Date().toISOString(),
    provider: "pedalmap",
    pedalmapUid: params.pedalmapUid,
    displayName: params.displayName ?? undefined,
  });
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, normalized);
  return { ok: true };
}

export function firebaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY);
}
