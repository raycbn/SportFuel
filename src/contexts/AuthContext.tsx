import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { getIdToken } from "firebase/auth";
import {
  getFirebaseAuth,
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
import { fetchEntitlements, type FuelPlan } from "@/lib/entitlements";

export type AuthProvider = "local" | "pedalmap";

export interface FuelAuthState {
  user: User | null;
  localUser: ReturnType<typeof getLocalUser>;
  provider: AuthProvider;
  loading: boolean;
  firebaseReady: boolean;
  plan: FuelPlan | null;
  entitlementLoading: boolean;
  entitlementError: boolean;
  canSaveRoute: boolean | null;
  maxRoutesSaved: number | null;
  routesSaved: number;
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
  const [plan, setPlan] = useState<FuelPlan | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(false);
  const [entitlementError, setEntitlementError] = useState(false);
  const [canSaveRoute, setCanSaveRoute] = useState<boolean | null>(null);
  const [maxRoutesSaved, setMaxRoutesSaved] = useState<number | null>(null);
  const [routesSaved, setRoutesSaved] = useState(0);
  const firebaseReady = isFirebaseConfigured();
  const fetchedRef = useRef(false);

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

  useEffect(() => {
    if (!user || !firebaseReady || fetchedRef.current) {
      if (!user) {
        setPlan(null);
        setEntitlementLoading(false);
        setEntitlementError(false);
        fetchedRef.current = false;
      }
      return;
    }
    let cancelled = false;
    fetchedRef.current = true;
    setEntitlementLoading(true);
    setEntitlementError(false);

    async function load() {
      try {
        const auth = getFirebaseAuth();
        if (!auth || !user) return;
        const idToken = await getIdToken(user, true);
        const result = await fetchEntitlements(idToken);
        if (!cancelled) {
          setPlan(result.plan);
          setEntitlementLoading(false);
          setCanSaveRoute(result.canSaveRoute);
          setMaxRoutesSaved(result.maxRoutesSaved);
          setRoutesSaved(result.routesSaved);
        }
      } catch {
        if (!cancelled) {
          setPlan("free");
          setEntitlementLoading(false);
          setEntitlementError(true);
          setCanSaveRoute(null);
          setMaxRoutesSaved(null);
          setRoutesSaved(0);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, firebaseReady]);

  async function handoffLogin(customToken: string) {
    if (!firebaseReady) throw new Error("Firebase no está configurado.");
    await signInWithFuelHandoff(customToken);
  }

  async function logout() {
    setUser(null);
    fetchedRef.current = false;
    setPlan(null);
    setEntitlementLoading(false);
    setEntitlementError(false);
    setCanSaveRoute(null);
    setMaxRoutesSaved(null);
    setRoutesSaved(0);
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
        plan,
        entitlementLoading,
        entitlementError,
        canSaveRoute,
        maxRoutesSaved,
        routesSaved,
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
