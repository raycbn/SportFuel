import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

const PRODUCTION_FIREBASE_WEB_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBVm-ldZ499JHm0_mt6bQUKX7C-F1tP7gY",
  authDomain: "pedalmap-79b3a.firebaseapp.com",
  projectId: "pedalmap-79b3a",
};

export function readFirebaseConfig(): FirebaseConfig | null {
  // Production Fuel must use PedalMap's known-good Firebase identity. Build-time VITE_FIREBASE_*
  // values may be stale or placeholders and must not override the valid production config.
  if (import.meta.env.PROD) return PRODUCTION_FIREBASE_WEB_CONFIG;

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (apiKey && authDomain && projectId) return { apiKey, authDomain, projectId };
  return null;
}
export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  const config = readFirebaseConfig();
  if (!config) return null;
  app = initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  const app = getFirebaseApp();
  if (!app) return null;
  auth = getAuth(app);
  return auth;
}

export function isFirebaseConfigured(): boolean {
  return readFirebaseConfig() !== null;
}

export function onFirebaseAuthChanged(
  callback: (user: User | null) => void,
): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signInWithFuelHandoff(customToken: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth no está configurado.");
  const credential = await signInWithCustomToken(auth, customToken);
  return credential.user;
}

export async function signOutFuel(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}
