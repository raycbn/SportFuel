import "./fuel-embed.css";

import { HelmetProvider } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import {
  FuelAuthProvider,
  FuelAuthContext,
  type FuelAuthState,
  type FuelAuthActions,
} from "./contexts/AuthContext";
import { FuelBasePathProvider } from "./components/FuelLink";
import { FuelRouteContext, type RouteContextValue } from "./fuel-route-context";
import { HandoffConsumer } from "./components/HandoffConsumer";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { PlannerPage } from "./pages/PlannerPage";
import { CalculatorsPage } from "./pages/CalculatorsPage";
import { SweatRatePage } from "./pages/SweatRatePage";
import { SportsIndexPage, SportDetailPage } from "./pages/SportsPage";
import { BlogPage } from "./pages/BlogPage";
import { ArticlePage } from "./pages/ArticlePage";
import { PlansPage } from "./pages/PlansPage";
import { PremiumPage } from "./pages/PremiumPage";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "./pages/AuthPages";
import { SeoLandingPage, SEO_LANDINGS } from "./pages/SeoLandingPage";
import { SharePage } from "./pages/SharePage";
import { PrivacyPage, CookiesPage, TermsPage, DisclaimerPage } from "./pages/LegalPages";
import { AdminPage } from "./pages/AdminPage";
import { RequireFuelAuth } from "./components/RequireFuelAuth";

export interface FuelAppProps {
  /** When true, the standalone web HandoffConsumer runs (cross-domain #pm_ct). */
  webHandoff?: boolean;
  /** Base path prefix for routes and links (e.g. "/fuel" when embedded). */
  base?: string;
  /**
   * Host-provided auth state. When provided, Fuel runs in embedded mode:
   * it does NOT bootstrap its own Firebase Auth session, does NOT run the
   * HandoffConsumer and delegates logout to the host. Standalone web keeps
   * using its own FuelAuthProvider (pass `auth` only when embedding).
   */
  auth?: FuelAuthState & FuelAuthActions;
  /** Route context passed from the host (PedalMap planner/ready-route data). */
  routeContext?: RouteContextValue;
}

export function FuelApp({ webHandoff = false, base = "", auth, routeContext }: FuelAppProps) {
  return (
    <HelmetProvider>
      <FuelBasePathProvider value={base}>
        <AuthGate auth={auth} webHandoff={webHandoff}>
          <FuelRouteContext.Provider value={routeContext ?? null}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="planner" element={<RequireFuelAuth><PlannerPage /></RequireFuelAuth>} />
                <Route path="calculators" element={<RequireFuelAuth><CalculatorsPage /></RequireFuelAuth>} />
                <Route path="calculators/sweat-rate" element={<RequireFuelAuth><SweatRatePage /></RequireFuelAuth>} />
                <Route path="sports" element={<SportsIndexPage />} />
                <Route path="sports/:slug" element={<SportDetailPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<ArticlePage />} />
                {SEO_LANDINGS.map((landing) => (
                  <Route
                    key={landing.path}
                    path={landing.path.slice(1)}
                    element={<SeoLandingPage path={landing.path} />}
                  />
                ))}
                <Route path="plans" element={<RequireFuelAuth><PlansPage /></RequireFuelAuth>} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="premium" element={<RequireFuelAuth><PremiumPage /></RequireFuelAuth>} />
                <Route path="admin" element={<RequireFuelAuth><AdminPage /></RequireFuelAuth>} />
                <Route path="plan/:slug" element={<SharePage />} />
                <Route path="legal/privacidad" element={<PrivacyPage />} />
                <Route path="legal/cookies" element={<CookiesPage />} />
                <Route path="legal/terminos" element={<TermsPage />} />
                <Route path="legal/aviso" element={<DisclaimerPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </FuelRouteContext.Provider>
        </AuthGate>
      </FuelBasePathProvider>
    </HelmetProvider>
  );
}

function AuthGate({
  auth,
  webHandoff,
  children,
}: {
  auth?: FuelAuthState & FuelAuthActions;
  webHandoff: boolean;
  children: ReactNode;
}) {
  if (auth) {
    return <FuelAuthContext.Provider value={auth}>{children}</FuelAuthContext.Provider>;
  }
  return (
    <FuelAuthProvider>
      {webHandoff ? <HandoffConsumer /> : null}
      {children}
    </FuelAuthProvider>
  );
}

function NotFound() {
  return (
    <div className="sf-container py-16">
      <h1 className="font-display text-3xl">Página no encontrada</h1>
    </div>
  );
}
