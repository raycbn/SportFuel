import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  isFirebaseConfigured,
  onFirebaseAuthChanged,
  signInWithFuelHandoff,
  signOutFuel,
} from "@/lib/firebase";
import {
  getCurrentUser as getLocalUser,
  loginLocal,
  logoutLocal,
  registerLocal,
} from "@/lib/auth";

export type AuthProvider = "local" | "pedalmap";

export interface FuelAuthState {
  user: User | null;
  localUser: ReturnType<typeof getLocalUser>;
  provider: AuthProvider;
  loading: boolean;
  firebaseReady: boolean;
}

export interface FuelAuthActions {
  loginLocal: typeof loginLocal;
  registerLocal: typeof registerLocal;
  logout: () => Promise<void>;
  handoffLogin: (customToken: string) => Promise<void>;
}

const FuelAuthContext = createContext<(FuelAuthState & FuelAuthActions) | null>(null);

export function useFuelAuth() {
  const ctx = useContext(FuelAuthContext);
  if (!ctx) throw new Error("useFuelAuth debe usarse dentro de FuelAuthProvider");
  return ctx;
}

export function FuelAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseReady = isFirebaseConfigured();

  const localUser = getLocalUser();
  const provider: AuthProvider = user ? "pedalmap" : localUser ? "local" : "local";

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onFirebaseAuthChanged((next) => {
      setUser(next);
      setLoading(false);
    });
    return unsub;
  }, [firebaseReady]);

  async function handoffLogin(customToken: string) {
    if (!firebaseReady) throw new Error("Firebase no está configurado.");
    await signInWithFuelHandoff(customToken);
  }

  async function logout() {
    setUser(null);
    await signOutFuel();
    logoutLocal();
  }

  return (
    <FuelAuthContext.Provider
      value={{
        user,
        localUser: getLocalUser(),
        provider,
        loading,
        firebaseReady,
        loginLocal,
        registerLocal,
        logout,
        handoffLogin,
      }}
    >
      {children}
    </FuelAuthContext.Provider>
  );
}
