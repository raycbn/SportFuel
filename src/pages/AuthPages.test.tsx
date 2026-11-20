import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FuelAuthContext } from "@/contexts/AuthContext";
import { LoginPage } from "./AuthPages";

const mocks = vi.hoisted(() => ({
  getFirebaseAuth: vi.fn(),
  isFirebaseConfigured: vi.fn(),
  signInWithPopup: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: class GoogleAuthProvider {},
  signInWithPopup: mocks.signInWithPopup,
}));

vi.mock("@/lib/firebase", () => ({
  getFirebaseAuth: mocks.getFirebaseAuth,
  isFirebaseConfigured: mocks.isFirebaseConfigured,
}));

vi.mock("@/components/Seo", () => ({ Seo: () => null }));

const authContextValue = {
  user: null,
  localUser: null,
  provider: "local" as const,
  loading: false,
  firebaseReady: true,
  plan: null,
  entitlementLoading: false,
  entitlementError: false,
  entitlementAllowlisted: null,
  entitlementGrupetaSeat: null,
  canSaveRoute: null,
  maxRoutesSaved: null,
  routesSaved: 0,
  loginLocal: vi.fn(async () => ({ ok: false as const, message: "Cuenta compartida requerida." })),
  registerLocal: vi.fn(async () => ({ ok: false as const, message: "Cuenta compartida requerida." })),
  logout: vi.fn(async () => undefined),
  handoffLogin: vi.fn(async () => undefined),
};

function renderLogin() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <FuelAuthContext.Provider value={authContextValue}>
          <LoginPage />
        </FuelAuthContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("Fuel Google sign-in", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFirebaseAuth.mockReturnValue({ name: "shared-pedalmap-auth" });
    mocks.isFirebaseConfigured.mockReturnValue(true);
    mocks.signInWithPopup.mockResolvedValue({ user: { uid: "test-user" } });
  });

  it("starts Google OAuth against the shared PedalMap Firebase account", async () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /Continuar con Google/ }));

    await waitFor(() => {
      expect(mocks.signInWithPopup).toHaveBeenCalledOnce();
    });
    const [auth, provider] = mocks.signInWithPopup.mock.calls[0] as unknown[];
    expect(auth).toEqual({ name: "shared-pedalmap-auth" });
    expect(provider).toBeInstanceOf(Object);
  });

  it("does not fake a sign-in when Firebase is not configured", async () => {
    mocks.isFirebaseConfigured.mockReturnValue(false);

    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /Continuar con Google/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no se ha configurado|no está configurado/i);
    expect(mocks.signInWithPopup).not.toHaveBeenCalled();
  });
});
