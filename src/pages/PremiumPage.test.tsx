import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({ useFuelAuth: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useFuelAuth: mocks.useFuelAuth }));
vi.mock("firebase/auth", () => ({ getIdToken: vi.fn() }));
vi.mock("@/lib/billing", () => ({
  openSharedPremiumPortal: vi.fn(),
  SharedBillingError: class SharedBillingError extends Error {},
  startSharedPremiumCheckout: vi.fn(),
}));
vi.mock("@/lib/shared-account", () => ({ buildSharedAccountSignInPath: vi.fn(() => "/login?shared=1&next=%2Fpremium%3Finterval%3Dyear") }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import { PremiumPage } from "@/pages/PremiumPage";

function renderPremiumPage() {
  return render(<MemoryRouter initialEntries={["/premium"]}><PremiumPage /></MemoryRouter>);
}

describe("Fuel shared Premium page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the shared entitlement and does not offer a second checkout to a Premium user", () => {
    mocks.useFuelAuth.mockReturnValue({
      user: { uid: "shared-uid" }, localUser: null, plan: "premium",
      entitlementLoading: false, entitlementError: false,
    });

    renderPremiumPage();

    expect(screen.getByRole("status").textContent).toContain("Premium compartido activo en PedalMap y Fuel");
    expect(screen.queryByRole("button", { name: /Activar Premium compartido/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Gestionar suscripcion/ })).toBeTruthy();
  });

  it("requires a shared PedalMap account before allowing checkout", () => {
    mocks.useFuelAuth.mockReturnValue({
      user: null,
      localUser: { email: "local@example.test" },
      plan: null,
      entitlementLoading: false,
      entitlementError: false,
    });

    renderPremiumPage();

    expect(screen.getByRole("button", { name: "Conectar cuenta de PedalMap" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Activar Premium compartido/ })).toBeNull();
    expect(screen.getByText(/Tu cuenta local de Fuel no comparte la identidad de PedalMap/)).toBeTruthy();
  });

  it("fails closed when the server cannot verify the current entitlement", () => {
    mocks.useFuelAuth.mockReturnValue({
      user: { uid: "shared-uid" }, localUser: null, plan: "free",
      entitlementLoading: false, entitlementError: true,
    });

    renderPremiumPage();

    expect(screen.getByRole("alert").textContent).toContain("no iniciaremos otra suscripcion");
    expect(screen.queryByRole("button", { name: /Activar Premium compartido/ })).toBeNull();
  });
});
