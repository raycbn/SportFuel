import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { FuelAuthContext, type FuelAuthState, type FuelAuthActions } from "@/contexts/AuthContext";
import { FuelBasePathProvider } from "@/components/FuelLink";
import { RequireFuelAuth } from "@/components/RequireFuelAuth";

function authState(user: FuelAuthState["user"]): FuelAuthState & FuelAuthActions {
  return {
    user,
    localUser: null,
    provider: user && !user.isAnonymous ? "pedalmap" : "local",
    loading: false,
    firebaseReady: true,
    plan: user && !user.isAnonymous ? "free" : null,
    entitlementLoading: false,
    entitlementError: false,
    entitlementAllowlisted: null,
    entitlementGrupetaSeat: null,
    canSaveRoute: null,
    maxRoutesSaved: null,
    routesSaved: 0,
    loginLocal: vi.fn(),
    registerLocal: vi.fn(),
    logout: vi.fn(),
    handoffLogin: vi.fn(),
  };
}

function LoginProbe() {
  const location = useLocation();
  return <div data-testid="login-query">{location.search}</div>;
}

function renderGuard(user: FuelAuthState["user"], initialEntry = "/fuel/planner?source=ready") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <FuelBasePathProvider value="/fuel">
        <FuelAuthContext.Provider value={authState(user)}>
          <Routes>
            <Route path="/fuel/planner" element={<RequireFuelAuth><div>Private Fuel planner</div></RequireFuelAuth>} />
            <Route path="/fuel/login" element={<LoginProbe />} />
          </Routes>
        </FuelAuthContext.Provider>
      </FuelBasePathProvider>
    </MemoryRouter>,
  );
}

describe("RequireFuelAuth", () => {
  it("redirects guests to shared PedalMap login and preserves the embedded destination", () => {
    renderGuard(null);
    expect(screen.getByTestId("login-query").textContent).toContain("shared=1");
    expect(screen.getByTestId("login-query").textContent).toContain("next=%2Fplanner%3Fsource%3Dready");
  });

  it("does not treat an anonymous Firebase user as authenticated", () => {
    renderGuard({ uid: "guest-1", isAnonymous: true } as never);
    expect(screen.getByTestId("login-query").textContent).toContain("next=%2Fplanner");
  });

  it("allows registered shared Firebase accounts", () => {
    renderGuard({ uid: "member-1", isAnonymous: false } as never);
    expect(screen.getByText("Private Fuel planner")).toBeInTheDocument();
  });
});
