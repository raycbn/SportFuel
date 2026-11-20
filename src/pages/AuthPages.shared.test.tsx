import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  useFuelAuth: vi.fn(),
  navigate: vi.fn(),
  getFirebaseAuth: vi.fn(),
  isFirebaseConfigured: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  track: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useFuelAuth: mocks.useFuelAuth }));
vi.mock("@/components/FuelLink", () => ({
  FuelLink: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
  useFuelNavigate: () => mocks.navigate,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/lib/firebase", () => ({
  getFirebaseAuth: mocks.getFirebaseAuth,
  isFirebaseConfigured: mocks.isFirebaseConfigured,
}));
vi.mock("@/lib/analytics", () => ({ track: mocks.track }));
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  GoogleAuthProvider: class GoogleAuthProvider {},
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signInWithPopup: mocks.signInWithPopup,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
}));

import { ForgotPasswordPage, LoginPage, RegisterPage } from "@/pages/AuthPages";

function renderPage(path: string, Page: React.ComponentType = LoginPage) {
  return render(<MemoryRouter initialEntries={[path]}><Page /></MemoryRouter>);
}

describe("Fuel mandatory shared Firebase authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useFuelAuth.mockReturnValue({ provider: "local", logout: vi.fn() });
    mocks.isFirebaseConfigured.mockReturnValue(true);
    mocks.getFirebaseAuth.mockReturnValue({ name: "shared-pedalmap-auth" });
    mocks.signInWithEmailAndPassword.mockResolvedValue({ user: { uid: "shared-uid" } });
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: "new-shared-uid" } });
    mocks.signInWithPopup.mockResolvedValue({ user: { uid: "google-shared-uid" } });
    mocks.sendPasswordResetEmail.mockResolvedValue(undefined);
  });

  it("always offers the shared account login, not a local-only account route", () => {
    renderPage("/login");
    expect(screen.getByRole("heading", { name: "Conectar cuenta de PedalMap" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar con mi cuenta PedalMap" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar con Google" })).toBeInTheDocument();
    expect(screen.queryByText(/cuenta local guarda/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Conectar cuenta de PedalMap" })).not.toBeInTheDocument();
  });

  it("signs in with the shared Firebase account and restores the requested destination", async () => {
    renderPage("/login?next=%2Fplanner%3Ffrom%3Dmap");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "member@example.test" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "correct-horse-battery" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar con mi cuenta PedalMap" }));

    await waitFor(() => expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      { name: "shared-pedalmap-auth" }, "member@example.test", "correct-horse-battery",
    ));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/planner?from=map", { replace: true }));
  });

  it("registers a new account in the shared Firebase project", async () => {
    renderPage("/register?next=%2Fplanner", RegisterPage);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.test" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "strong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta de PedalMap" }));

    await waitFor(() => expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      { name: "shared-pedalmap-auth" }, "new@example.test", "strong-password",
    ));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/planner", { replace: true }));
  });

  it("uses Google OAuth against the shared Firebase project", async () => {
    renderPage("/login?next=%2Fplans");
    fireEvent.click(screen.getByRole("button", { name: "Continuar con Google" }));

    await waitFor(() => expect(mocks.signInWithPopup).toHaveBeenCalledOnce());
    const [auth, provider] = mocks.signInWithPopup.mock.calls[0] as unknown[];
    expect(auth).toEqual({ name: "shared-pedalmap-auth" });
    expect(provider).toBeInstanceOf((await import("firebase/auth")).GoogleAuthProvider);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/plans", { replace: true }));
  });

  it("does not grant Premium because an authenticated Firebase account is Free", () => {
    mocks.useFuelAuth.mockReturnValue({
      provider: "pedalmap", user: { uid: "free-uid", email: "free@example.test" },
      localUser: null, plan: "free", entitlementLoading: false, entitlementError: false, logout: vi.fn(),
    });
    renderPage("/login");
    expect(screen.getByRole("heading", { name: "Ya hay una sesión de PedalMap" })).toBeInTheDocument();
    expect(screen.getByText("Cuenta: free@example.test")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Esta cuenta está en el plan Free");
    expect(screen.queryByText("Premium activo", { exact: true })).not.toBeInTheDocument();
  });

  it("continues with the already authenticated account to the original destination", async () => {
    mocks.useFuelAuth.mockReturnValue({
      provider: "pedalmap", user: { uid: "free-uid", email: "free@example.test" },
      localUser: null, plan: "free", entitlementLoading: false, entitlementError: false, logout: vi.fn(),
    });
    renderPage("/login?next=%2Fplanner");
    fireEvent.click(screen.getByRole("button", { name: "Continuar con esta cuenta" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/planner", { replace: true });
  });

  it("changes Firebase account through a real sign-out and returns to shared login", async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    mocks.useFuelAuth.mockReturnValue({
      provider: "pedalmap", user: { uid: "free-uid", email: "free@example.test" },
      localUser: null, plan: "free", entitlementLoading: false, entitlementError: false, logout,
    });
    renderPage("/login?next=%2Fplanner");
    fireEvent.click(screen.getByRole("button", { name: "Cambiar cuenta de PedalMap" }));
    await waitFor(() => expect(logout).toHaveBeenCalledOnce());
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith(
      "/login?shared=1&next=%2Fplanner", { replace: true },
    ));
  });

  it("reports a failed Firebase sign-out and does not claim that the session closed", async () => {
    const logout = vi.fn().mockRejectedValue(new Error("signOut failed"));
    mocks.useFuelAuth.mockReturnValue({
      provider: "pedalmap", user: { uid: "free-uid", email: "free@example.test" },
      localUser: null, plan: "free", entitlementLoading: false, entitlementError: false, logout,
    });
    renderPage("/login");
    fireEvent.click(screen.getByRole("button", { name: "Cambiar cuenta de PedalMap" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/No se pudo cerrar la sesión de PedalMap/);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("sends password recovery through Firebase Auth and does not reveal whether the email exists", async () => {
    renderPage("/forgot-password?next=%2Fplanner", ForgotPasswordPage);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "member@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar enlace" }));
    await waitFor(() => expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(
      { name: "shared-pedalmap-auth" }, "member@example.test",
    ));
    expect(await screen.findByRole("status")).toHaveTextContent("Si existe una cuenta con ese email");
  });

  it("fails closed when Firebase is not configured", async () => {
    mocks.isFirebaseConfigured.mockReturnValue(false);
    renderPage("/login");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "member@example.test" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "correct-horse-battery" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar con mi cuenta PedalMap" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No se ha configurado la autenticación compartida");
    expect(mocks.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });
});
