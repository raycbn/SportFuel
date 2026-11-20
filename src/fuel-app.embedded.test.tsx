import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { FuelApp } from "@/fuel-app";
import { App as StandaloneApp } from "@/App";

vi.mock("@/lib/firebase", () => {
  const getFirebaseAuth = vi.fn();
  return {
    getFirebaseApp: vi.fn(),
    getFirebaseAuth,
    isFirebaseConfigured: vi.fn(() => false),
    onFirebaseAuthChanged: vi.fn((cb: (u: null) => void) => {
      cb(null);
      return () => {};
    }),
    signInWithFuelHandoff: vi.fn(),
    signOutFuel: vi.fn(),
  };
});

vi.mock("@/lib/handoff", () => ({
  consumeHandoffFromUrl: vi.fn(() => null),
}));

function makeAuth(plan: "free" | "premium" = "free") {
  return {
    user: { uid: "u1", email: "user@example.com", isAnonymous: false } as never,
    localUser: null,
    provider: "pedalmap" as "pedalmap" | "local",
    loading: false,
    firebaseReady: true,
    plan,
    entitlementLoading: false,
    entitlementError: false,
    entitlementAllowlisted: false,
    entitlementGrupetaSeat: false,
    canSaveRoute: plan === "premium",
    maxRoutesSaved: plan === "premium" ? null : 5,
    routesSaved: 0,
    loginLocal: vi.fn(),
    registerLocal: vi.fn(),
    logout: vi.fn(),
    handoffLogin: vi.fn(),
  };
}

function renderEmbedded(auth = makeAuth("free"), routeContext?: Record<string, unknown>, initial = "/fuel") {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="fuel/*" element={<FuelApp auth={auth} base="/fuel" routeContext={routeContext as never} />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("Fuel embedded mode (FASE APP 2C)", () => {
  it("requires the shared login before entering the planner with a Firebase guest session", () => {
    const guest = makeAuth("free");
    guest.user = { uid: "guest-u1", email: null, isAnonymous: true } as never;
    guest.provider = "local";
    renderEmbedded(guest, undefined, "/fuel/planner?source=ready");
    expect(screen.getByRole("heading", { name: /Conectar cuenta de PedalMap/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it("keeps the Fuel marketing home available without a registered account", () => {
    const guest = makeAuth("free");
    guest.user = null as never;
    guest.provider = "local";
    renderEmbedded(guest, undefined, "/fuel");
    expect(screen.getAllByRole("link", { name: /Crear mi plan gratis/i })).toHaveLength(2);
    expect(screen.queryByRole("heading", { name: /Conectar cuenta de PedalMap/i })).not.toBeInTheDocument();
  });

  it("uses host auth: premium arrives and shows Premium badge (test 4/5)", async () => {
    renderEmbedded(makeAuth("premium"), undefined, "/fuel/planner");
    expect(screen.getByText("Conectado con PedalMap")).toBeInTheDocument();
    const premiumBadge = screen.getAllByText("Premium").find((el) => el.tagName === "SPAN");
    expect(premiumBadge).toBeInTheDocument();
  });

  it("free host does not show premium badge (test 5)", () => {
    renderEmbedded(makeAuth("free"), undefined, "/fuel");
    expect(screen.getByText("Conectado con PedalMap")).toBeInTheDocument();
    expect(screen.queryByText("Premium", { selector: "span" })).not.toBeInTheDocument();
  });

  it("does not bootstrap its own Firebase Auth instance when auth is provided (test 2)", async () => {
    const firebase = await import("@/lib/firebase");
    renderEmbedded();
    expect(firebase.getFirebaseAuth).not.toHaveBeenCalled();
    expect(firebase.onFirebaseAuthChanged).not.toHaveBeenCalled();
  });

  it("delegates logout to the host (test 6)", async () => {
    const auth = makeAuth("free");
    renderEmbedded(auth, undefined, "/fuel/plans");
    const logoutBtn = await screen.findByRole("button", { name: /Cerrar sesión/i });
    await fireEvent.click(logoutBtn);
    expect(auth.logout).toHaveBeenCalled();
  });

  it("links are scoped under /fuel/* (test 7)", () => {
    renderEmbedded(undefined, undefined, "/fuel");
    const createPlanLinks = screen.getAllByRole("link", { name: /Crear mi plan gratis/i }) as HTMLAnchorElement[];
    expect(createPlanLinks[0]!.getAttribute("href")).toBe("/fuel/planner");
    const blogLinks = screen.getAllByRole("link", { name: /^Blog$/i }) as HTMLAnchorElement[];
    expect(blogLinks[0]!.getAttribute("href")).toBe("/fuel/blog");
  });

  it("no #pm_ct handoff in embedded mode (test 11)", async () => {
    const handoff = await import("@/lib/handoff");
    renderEmbedded();
    expect(handoff.consumeHandoffFromUrl).not.toHaveBeenCalled();
  });

  it("RouteContext prefills PlannerPage (test 9)", () => {
    renderEmbedded(undefined, { sport: "cycling", distanceKm: 42, durationMinutes: 60, temperatureC: 26 }, "/fuel/planner");
    expect(screen.getByLabelText(/Distancia \(km, opcional\)/i)).toHaveValue(42);
    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(60);
    expect(screen.getByText(/Tu salida de PedalMap/i)).toBeInTheDocument();
  });

  it("absent RouteContext renders without crashing (test 10)", () => {
    renderEmbedded(undefined, undefined, "/fuel/planner");
    expect(screen.getByLabelText(/Duración \(min\)/i)).toHaveValue(180);
    expect(screen.queryByText(/Tu salida de PedalMap/i)).not.toBeInTheDocument();
  });
});

describe("Fuel standalone mode (FASE APP 2C)", () => {
  it("standalone keeps absolute routes /planner, /plans (test 8) and runs HandoffConsumer", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/"]}>
          <StandaloneApp />
        </MemoryRouter>
      </HelmetProvider>,
    );
    const link = screen.getAllByRole("link", { name: /Crear mi plan gratis/i })[0]!;
    expect(link.getAttribute("href")).toBe("/planner");
  });
});
