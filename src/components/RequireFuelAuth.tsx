import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useFuelAuth } from "@/contexts/AuthContext";
import { useBasePath } from "@/components/FuelLink";

/** Requires a non-anonymous shared Firebase account in both standalone and embedded Fuel. */
export function RequireFuelAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useFuelAuth();
  const location = useLocation();
  const base = useBasePath();

  if (loading) {
    return (
      <main className="sf-container flex min-h-[60vh] items-center justify-center py-12">
        <p role="status">Comprobando sesión…</p>
      </main>
    );
  }

  if (!user || user.isAnonymous) {
    const relativePath = base && location.pathname.startsWith(base)
      ? location.pathname.slice(base.length) || "/"
      : location.pathname;
    const next = `${relativePath}${location.search}${location.hash}`;
    const params = new URLSearchParams({ shared: "1", next });
    return <Navigate to={`${base}/login?${params.toString()}`} replace />;
  }

  return <>{children}</>;
}
