import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { FuelAuthProvider, useFuelAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";

const mockUnsub = () => {};

vi.mock("firebase/auth", () => {
  const mockAuth = {
    onAuthStateChanged: vi.fn(),
    signInWithCustomToken: vi.fn(),
    signOut: vi.fn(),
    getIdToken: vi.fn(),
  };
  return {
    getAuth: vi.fn(() => mockAuth),
    onAuthStateChanged: mockAuth.onAuthStateChanged,
    signInWithCustomToken: mockAuth.signInWithCustomToken,
    signOut: mockAuth.signOut,
    getIdToken: mockAuth.getIdToken,
  };
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/"]}>
        <FuelAuthProvider>{ui}</FuelAuthProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

function AuthConsumer() {
  const ctx = useFuelAuth();
  return (
    <div>
      <span data-testid="provider">{ctx.provider}</span>
      <span data-testid="plan">{ctx.plan ?? "null"}</span>
      <span data-testid="ent-loading">{ctx.entitlementLoading ? "loading" : "idle"}</span>
      <span data-testid="ent-error">{ctx.entitlementError ? "error" : "ok"}</span>
      <span data-testid="user">{ctx.user ? "authed" : "guest"}</span>
    </div>
  );
}

describe("AuthContext + Layout Phase 4C", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows Conectado con PedalMap when provider is pedalmap and Premium when entitlements confirm", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "domain");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "project");
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://example.com");

    const { getAuth, onAuthStateChanged, getIdToken } = await import("firebase/auth");
    (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, cb: (u: { uid: string } | null) => void) => {
      setTimeout(() => cb({ uid: "uid-1" } as unknown as null), 0);
      return mockUnsub;
    });
    (getIdToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("id-token");
    (getAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ getIdToken });

    const originalFetch = (globalThis as Record<string, unknown>).fetch;
    (globalThis as Record<string, unknown>).fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            uid: "uid-1",
            plan: "premium",
            allowlisted: false,
            grupetaSeat: false,
            emailVerified: true,
            gpxExport: true,
            freeGpxRemaining: null,
            maxRoutesSaved: null,
            routesSaved: 0,
            canSaveRoute: true,
          }),
      } as unknown as Response),
    );

    renderWithProviders(
      <>
        <AuthConsumer />
        <Layout />
      </>,
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("authed"));
    expect(screen.getByTestId("provider")).toHaveTextContent("pedalmap");
    await waitFor(() => expect(screen.getByTestId("plan")).toHaveTextContent("premium"));
    expect(screen.getByText("Conectado con PedalMap")).toBeInTheDocument();
    const premiumBadges = screen.getAllByText("Premium");
    expect(premiumBadges.filter((el) => el.tagName === "SPAN").length).toBeGreaterThan(0);

    (globalThis as Record<string, unknown>).fetch = originalFetch;
  });

  it("does not show Premium while entitlement is loading", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "domain");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "project");

    const { getAuth, onAuthStateChanged, getIdToken } = await import("firebase/auth");
    (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, cb: (u: { uid: string } | null) => void) => {
      setTimeout(() => cb({ uid: "uid-1" } as unknown as null), 0);
      return mockUnsub;
    });
    (getIdToken as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));
    (getAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ getIdToken });

    renderWithProviders(
      <>
        <AuthConsumer />
        <Layout />
      </>,
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("authed"));
    expect(screen.getByTestId("provider")).toHaveTextContent("pedalmap");
    expect(screen.getByTestId("ent-loading")).toHaveTextContent("loading");
    expect(screen.queryByText("Premium", { selector: "span" })).not.toBeInTheDocument();
  });

  it("does not show Premium when entitlement errors", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "domain");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "project");
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://example.com");

    const { getAuth, onAuthStateChanged, getIdToken } = await import("firebase/auth");
    (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, cb: (u: { uid: string } | null) => void) => {
      setTimeout(() => cb({ uid: "uid-1" } as unknown as null), 0);
      return mockUnsub;
    });
    (getIdToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("id-token");
    (getAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ getIdToken });

    const originalFetch = (globalThis as Record<string, unknown>).fetch;
    (globalThis as Record<string, unknown>).fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      } as unknown as Response),
    );

    renderWithProviders(
      <>
        <AuthConsumer />
        <Layout />
      </>,
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("authed"));
    await waitFor(() => expect(screen.getByTestId("plan")).toHaveTextContent("free"));
    expect(screen.getByTestId("ent-error")).toHaveTextContent("error");
    expect(screen.queryByText("Premium", { selector: "span" })).not.toBeInTheDocument();

    (globalThis as Record<string, unknown>).fetch = originalFetch;
  });

  it("does not show PedalMap badge for local user", async () => {
    localStorage.setItem("sportfuel.session.v1", "local@example.com");
    localStorage.setItem(
      "sportfuel.users.v1",
      JSON.stringify([
        {
          email: "local@example.com",
          passwordHash: "hash",
          createdAt: new Date().toISOString(),
          provider: "local",
        },
      ]),
    );

    const { onAuthStateChanged } = await import("firebase/auth");
    (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, cb: (u: null) => void) => {
      setTimeout(() => cb(null), 0);
      return mockUnsub;
    });

    renderWithProviders(
      <>
        <AuthConsumer />
        <Layout />
      </>,
    );

    await waitFor(() => expect(screen.getByTestId("provider")).toHaveTextContent("local"));
    expect(screen.queryByText("Conectado con PedalMap")).not.toBeInTheDocument();
    expect(screen.queryByText("Premium", { selector: "span" })).not.toBeInTheDocument();
  });

  it("clears state on logout", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "domain");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "project");
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://example.com");

    const { getAuth, onAuthStateChanged, getIdToken } = await import("firebase/auth");
    (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, cb: (u: null) => void) => {
      setTimeout(() => cb(null), 0);
      return mockUnsub;
    });
    (getIdToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("id-token");
    (getAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ getIdToken });

    renderWithProviders(
      <>
        <AuthConsumer />
        <Layout />
      </>,
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("guest"));
    expect(screen.getByTestId("provider")).toHaveTextContent("local");
    expect(screen.queryByText("Conectado con PedalMap")).not.toBeInTheDocument();
    expect(screen.queryByText("Premium", { selector: "span" })).not.toBeInTheDocument();
  });

  it("does not make duplicate entitlement calls", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "domain");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "project");
    vi.stubEnv("VITE_PEDALMAP_API_URL", "https://example.com");

    const { getAuth, onAuthStateChanged, getIdToken } = await import("firebase/auth");
    (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, cb: (u: { uid: string } | null) => void) => {
      setTimeout(() => cb({ uid: "uid-1" } as unknown as null), 0);
      return mockUnsub;
    });
    (getIdToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("id-token");
    (getAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ getIdToken });

    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            uid: "uid-1",
            plan: "free",
            allowlisted: false,
            grupetaSeat: false,
            emailVerified: true,
            gpxExport: true,
            freeGpxRemaining: null,
            maxRoutesSaved: null,
            routesSaved: 0,
            canSaveRoute: true,
          }),
      } as unknown as Response),
    );

    (globalThis as Record<string, unknown>).fetch = fetchMock;

    const { rerender } = renderWithProviders(
      <>
        <AuthConsumer />
        <Layout />
      </>,
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("authed"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    rerender(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/"]}>
          <FuelAuthProvider>
            <AuthConsumer />
            <Layout />
          </FuelAuthProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("authed"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
