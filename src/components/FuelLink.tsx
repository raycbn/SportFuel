import { createContext, useContext, type ReactNode } from "react";
import {
  Link,
  NavLink,
  useNavigate,
  type LinkProps,
  type NavLinkProps,
} from "react-router-dom";

const FuelBasePathContext = createContext<string>("");

export function FuelBasePathProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) {
  return <FuelBasePathContext.Provider value={value}>{children}</FuelBasePathContext.Provider>;
}

export function useBasePath(): string {
  return useContext(FuelBasePathContext);
}

function resolve(path: unknown, base: string): unknown {
  if (typeof path !== "string") return path;
  if (path.startsWith("/")) {
    return base + path;
  }
  return path;
}

export function FuelLink({ to, ...rest }: LinkProps) {
  const base = useBasePath();
  return <Link to={resolve(to, base) as LinkProps["to"]} {...rest} />;
}

export function FuelNavLink({ to, ...rest }: NavLinkProps) {
  const base = useBasePath();
  return <NavLink to={resolve(to, base) as NavLinkProps["to"]} {...rest} />;
}

export function useFuelNavigate(): (to: string, options?: Record<string, unknown>) => void {
  const base = useBasePath();
  const navigate = useNavigate();
  return (to, options) => {
    const resolved = typeof to === "string" && to.startsWith("/") ? base + to : to;
    navigate(resolved, options as never);
  };
}
