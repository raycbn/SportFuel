import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("Fuel Google sign-in", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFirebaseAuth.mockReturnValue({ name: "shared-pedalmap-auth" });
    mocks.isFirebaseConfigured.mockReturnValue(true);
    mocks.signInWithPopup.mockResolvedValue({ user: { uid: "test-user" } });
  });

  it("starts Google OAuth against the shared PedalMap Firebase account", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <LoginPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Continuar con Google \(cuenta PedalMap\)/ }));

    await waitFor(() => {
      expect(mocks.signInWithPopup).toHaveBeenCalledOnce();
    });
    const [auth, provider] = mocks.signInWithPopup.mock.calls[0] as unknown[];
    expect(auth).toEqual({ name: "shared-pedalmap-auth" });
    expect(provider).toBeInstanceOf(Object);
  });

  it("does not fake a sign-in when Firebase is not configured", async () => {
    mocks.isFirebaseConfigured.mockReturnValue(false);

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <LoginPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Continuar con Google/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no está configurado/i);
    expect(mocks.signInWithPopup).not.toHaveBeenCalled();
  });
});
