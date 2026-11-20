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
import { fetchEntitlements, type FuelPlan } from "@/lib/entitlements";

export type AuthProvider = "local" | "pedalmap";

export interface FuelAuthState {
  user: User | null;
  /** Legacy local profile is never an authenticated identity. */
  localUser: null;
  provider: AuthProvider;
  loading: boolean;
  firebaseReady: boolean;
  plan: FuelPlan | null;
  entitlementLoading: boolean;
  entitlementError: boolean;
  entitlementAllowlisted: boolean | null;
  entitlementGrupetaSeat: boolean | null;
  canSaveRoute: boolean | null;
  maxRoutesSaved: number | null;
  routesSaved: number;
}

export interface FuelAuthActions {
  loginLocal: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  registerLocal: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  handoffLogin: (customToken: string) => Promise<void>;
}

export const FuelAuthContext = createContext<(FuelAuthState & FuelAuthActions) | null>(null);

const rejectLocalAuthentication = async (): Promise<{ ok: false; message: string }> => ({
  ok: false,
  message: "Fuel requiere una cuenta compartida de PedalMap. Inicia sesión con email o Google.",
});

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
  const [entitlementAllowlisted, setEntitlementAllowlisted] = useState<boolean | null>(null);
  const [entitlementGrupetaSeat, setEntitlementGrupetaSeat] = useState<boolean | null>(null);
  const [canSaveRoute, setCanSaveRoute] = useState<boolean | null>(null);
  const [maxRoutesSaved, setMaxRoutesSaved] = useState<number | null>(null);
  const [routesSaved, setRoutesSaved] = useState(0);
  const firebaseReady = isFirebaseConfigured();
  const fetchedUidRef = useRef<string | null>(null);
  const userUid = user?.uid ?? null;

  const provider: AuthProvider = user && !user.isAnonymous ? "pedalmap" : "local";

  useEffect(() => {
    if (!firebaseReady) {
      setUser(null);
      setLoading(false);
      setPlan(null);
      setEntitlementLoading(false);
      setEntitlementError(false);
      setEntitlementAllowlisted(null);
      setEntitlementGrupetaSeat(null);
      fetchedUidRef.current = null;
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
    if (!firebaseReady || !userUid || !user || user.isAnonymous) {
      setPlan(null);
      setEntitlementLoading(false);
      setEntitlementError(false);
      setEntitlementAllowlisted(null);
      setEntitlementGrupetaSeat(null);
      setCanSaveRoute(null);
      setMaxRoutesSaved(null);
      setRoutesSaved(0);
      fetchedUidRef.current = null;
      return;
    }

    // The entitlement cache is per Firebase UID, never per browser session.
    // Clear the previous account's plan immediately while the new UID is checked.
    if (fetchedUidRef.current === userUid) return;
    let cancelled = false;
    fetchedUidRef.current = userUid;
    setPlan(null);
    setEntitlementLoading(true);
    setEntitlementError(false);
    setEntitlementAllowlisted(null);
    setEntitlementGrupetaSeat(null);
    setCanSaveRoute(null);
    setMaxRoutesSaved(null);
    setRoutesSaved(0);

    const entitlementUser = user;

    async function load() {
      try {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase Auth unavailable");
        const idToken = await getIdToken(entitlementUser, true);
        const result = await fetchEntitlements(idToken);
        if (result.ok !== true || result.uid !== userUid) {
          throw new Error("Entitlement identity did not match the signed-in Firebase user");
        }
        if (!cancelled) {
          setPlan(result.plan);
          setEntitlementLoading(false);
          setEntitlementError(false);
          setEntitlementAllowlisted(result.allowlisted === true);
          setEntitlementGrupetaSeat(result.grupetaSeat === true);
          setCanSaveRoute(result.canSaveRoute);
          setMaxRoutesSaved(result.maxRoutesSaved);
          setRoutesSaved(result.routesSaved);
        }
      } catch {
        if (!cancelled) {
          // Unknown/unavailable entitlement is not Free and never Premium: keep it unverified.
          setPlan(null);
          setEntitlementLoading(false);
          setEntitlementError(true);
          setEntitlementAllowlisted(null);
          setEntitlementGrupetaSeat(null);
          setCanSaveRoute(null);
          setMaxRoutesSaved(null);
          setRoutesSaved(0);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // Firebase UID is the identity key; token refreshes for the same UID do not change the plan owner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUid, firebaseReady]);

  async function handoffLogin(customToken: string) {
    if (!firebaseReady) throw new Error("Firebase no está configurado.");
    await signInWithFuelHandoff(customToken);
  }

  async function logout() {
    setUser(null);
    fetchedUidRef.current = null;
    setPlan(null);
    setEntitlementLoading(false);
    setEntitlementError(false);
    setEntitlementAllowlisted(null);
    setEntitlementGrupetaSeat(null);
    setCanSaveRoute(null);
    setMaxRoutesSaved(null);
    setRoutesSaved(0);
    let signOutError: unknown = null;
    try {
      await signOutFuel();
    } catch (error) {
      signOutError = error;
    }
    // Legacy localStorage profiles are intentionally ignored and preserved;
    // they are not sessions and cannot authenticate application actions.
    if (signOutError) throw signOutError;
  }

  return (
    <FuelAuthContext.Provider
      value={{
        user,
        localUser: null,
        provider,
        loading,
        firebaseReady,
        plan,
        entitlementLoading,
        entitlementError,
        entitlementAllowlisted,
        entitlementGrupetaSeat,
        canSaveRoute,
        maxRoutesSaved,
        routesSaved,
        loginLocal: rejectLocalAuthentication,
        registerLocal: rejectLocalAuthentication,
        logout,
        handoffLogin,
      }}
    >
      {children}
    </FuelAuthContext.Provider>
  );
}