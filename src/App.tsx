import { Navigate, Route, Routes } from "react-router-dom";
import { FuelBasePathProvider } from "@/components/FuelLink";
import { Layout } from "./components/Layout";
import { HandoffConsumer } from "./components/HandoffConsumer";
import { FuelAuthProvider } from "./contexts/AuthContext";
import { ArticlePage } from "./pages/ArticlePage";
import { AdminPage } from "./pages/AdminPage";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "./pages/AuthPages";
import { BlogPage } from "./pages/BlogPage";
import { CalculatorsPage } from "./pages/CalculatorsPage";
import { HomePage } from "./pages/HomePage";
import { CookiesPage, DisclaimerPage, PrivacyPage, TermsPage } from "./pages/LegalPages";
import { PlannerPage } from "./pages/PlannerPage";
import { PlansPage } from "./pages/PlansPage";
import { PremiumPage } from "./pages/PremiumPage";
import { SEO_LANDINGS, SeoLandingPage } from "./pages/SeoLandingPage";
import { SharePage } from "./pages/SharePage";
import { SportDetailPage, SportsIndexPage } from "./pages/SportsPage";
import { SweatRatePage } from "./pages/SweatRatePage";
import { RequireFuelAuth } from "./components/RequireFuelAuth";

export function App() {
  return (
    <FuelAuthProvider>
      <HandoffConsumer />
      <FuelBasePathProvider value="">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
          <Route path="/planner" element={<RequireFuelAuth><PlannerPage /></RequireFuelAuth>} />
          <Route path="/calculators" element={<RequireFuelAuth><CalculatorsPage /></RequireFuelAuth>} />
          <Route path="/calculators/sweat-rate" element={<RequireFuelAuth><SweatRatePage /></RequireFuelAuth>} />
          <Route path="/sports" element={<SportsIndexPage />} />
          <Route path="/sports/:slug" element={<SportDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/que-comer-antes-de-correr" element={<Navigate to="/blog/que-comer-antes-de-correr" replace />} />
          <Route path="/que-comer-antes-de-montar-en-bici" element={<Navigate to="/blog/que-comer-antes-de-montar-en-bici" replace />} />
          {SEO_LANDINGS.map((landing) => (
            <Route key={landing.path} path={landing.path} element={<SeoLandingPage path={landing.path} />} />
          ))}
          <Route path="/plans" element={<RequireFuelAuth><PlansPage /></RequireFuelAuth>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/premium" element={<RequireFuelAuth><PremiumPage /></RequireFuelAuth>} />
          <Route path="/admin" element={<RequireFuelAuth><AdminPage /></RequireFuelAuth>} />
          <Route path="/plan/:slug" element={<SharePage />} />
          <Route path="/legal/privacidad" element={<PrivacyPage />} />
          <Route path="/legal/cookies" element={<CookiesPage />} />
          <Route path="/legal/terminos" element={<TermsPage />} />
          <Route path="/legal/aviso" element={<DisclaimerPage />} />
          <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </FuelBasePathProvider>
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
