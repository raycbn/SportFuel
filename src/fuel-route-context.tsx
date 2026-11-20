import { createContext, useContext, type ReactNode } from "react";

export interface RouteContextValue {
  distanceKm?: number;
  durationMinutes?: number;
  elevationGainM?: number;
  temperatureC?: number;
  intensity?: string;
  goal?: string;
  sport?: string;
  bodyMassKg?: number;
  sweatRateLPerHour?: number;
  departureTime?: string;
}

export const FuelRouteContext = createContext<RouteContextValue | null>(null);

export function FuelRouteProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: RouteContextValue | null;
}) {
  return <FuelRouteContext.Provider value={value}>{children}</FuelRouteContext.Provider>;
}

export function useFuelRouteContext(): RouteContextValue | null {
  return useContext(FuelRouteContext);
}
