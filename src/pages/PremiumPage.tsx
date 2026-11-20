import { useState } from "react";
import { getIdToken } from "firebase/auth";
import { useSearchParams } from "react-router-dom";
import { FuelLink as Link } from "@/components/FuelLink";
import { Seo } from "@/components/Seo";
import { useFuelAuth } from "@/contexts/AuthContext";
import { openSharedPremiumPortal, SharedBillingError, startSharedPremiumCheckout, type SharedCheckoutInterval } from "@/lib/billing";
import { track } from "@/lib/analytics";
import { buildSharedAccountSignInPath } from "@/lib/shared-account";

export function PremiumPage() {
  const { user, localUser, plan, entitlementLoading, entitlementError } = useFuelAuth();
  const [params] = useSearchParams();
  const [interval, setInterval] = useState<SharedCheckoutInterval>(() =>
    params.get("interval") === "month" ? "month" : "year",
  );
  const [busy, setBusy] = useState<"checkout" | "portal" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const checkingAccount = Boolean(user) && (entitlementLoading || plan === null);
  const canStartCheckout = Boolean(user) && plan === "free" && !entitlementLoading && !entitlementError && !busy;

  async function startCheckout() {
    if (!user || !canStartCheckout) return;
    setBusy("checkout");
    setMessage(null);
    track("premium_clicked", { source: "fuel_shared_checkout", interval });
    try {
      const idToken = await getIdToken(user, true);
      const checkout = await startSharedPremiumCheckout(idToken, interval);
      window.location.assign(checkout.url);
    } catch (error) {
      const text = error instanceof SharedBillingError
        ? error.message
        : "No se pudo abrir el checkout compartido. Intentalo de nuevo.";
      setMessage(text);
      setBusy(null);
    }
  }

  async function manageSubscription() {
    if (!user || busy) return;
    setBusy("portal");
    setMessage(null);
    try {
      const idToken = await getIdToken(user, true);
      const portal = await openSharedPremiumPortal(idToken);
      window.location.assign(portal.url);
    } catch (error) {
      const text = error instanceof SharedBillingError
        ? error.message
        : "No se pudo abrir la gestion de facturacion.";
      setMessage(text);
      setBusy(null);
    }
  }

  function connectPedalMapAccount() {
    track("premium_clicked", { source: "fuel_shared_account_bridge", interval });
    window.location.assign(buildSharedAccountSignInPath(interval));
  }

  return (
    <div className="sf-container max-w-3xl py-12">
      <Seo
        title="Premium compartido - PedalMap Fuel"
        description="Una sola suscripcion Premium para PedalMap y Fuel, con los mismos derechos de cuenta."
        path="/premium"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuel-700">Una cuenta, dos productos</p>
      <h1 className="mt-2 font-display text-4xl">PedalMap Premium</h1>
      <p className="mt-4 text-ink-700">
        Cuando una cuenta contrata Premium, el derecho se comparte entre PedalMap y Fuel. No hay una segunda suscripcion de Fuel: ambas aplicaciones consultan los derechos de la misma cuenta.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="sf-card p-6">
          <h2 className="font-display text-2xl">Free</h2>
          <p className="mt-1 text-ink-700">Para empezar sin pagar.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-700">
            <li>Calculadoras y plan basico</li>
            <li>Hasta 3 planes Fuel guardados</li>
            <li>Funciones Premium avanzadas bloqueadas</li>
          </ul>
        </article>
        <article className="sf-card border-2 border-fuel-500/30 p-6">
          <h2 className="font-display text-2xl">Premium compartido</h2>
          <p className="mt-1 text-fuel-700">{interval === "year" ? "39,99 EUR/anio" : "4,99 EUR/mes"}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-700">
            <li>Planes guardados ilimitados en Fuel</li>
            <li>Timeline de competicion y estrategias avanzadas</li>
            <li>Premium de PedalMap incluido con la misma suscripcion</li>
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-2" aria-label="Periodicidad de Premium">
            <button
              type="button"
              className={`rounded-full border px-3 py-2 text-sm ${interval === "month" ? "border-fuel-600 bg-fuel-600 text-white" : "border-ink-200"}`}
              aria-pressed={interval === "month"}
              disabled={busy !== null}
              onClick={() => setInterval("month")}
            >
              Mensual
            </button>
            <button
              type="button"
              className={`rounded-full border px-3 py-2 text-sm ${interval === "year" ? "border-fuel-600 bg-fuel-600 text-white" : "border-ink-200"}`}
              aria-pressed={interval === "year"}
              disabled={busy !== null}
              onClick={() => setInterval("year")}
            >
              Anual
            </button>
          </div>
          {user && plan === "premium" ? (
            <div className="mt-5 space-y-3">
              <p className="rounded-xl bg-fuel-50 p-3 text-sm font-semibold text-ink-900" role="status">
                Premium compartido activo en PedalMap y Fuel.
              </p>
              <button
                type="button"
                className="w-full rounded-full border px-5 py-3 font-semibold"
                disabled={busy !== null}
                onClick={() => void manageSubscription()}
              >
                {busy === "portal" ? "Abriendo facturacion..." : "Gestionar suscripcion"}
              </button>
            </div>
          ) : user && entitlementError ? (
            <div className="mt-5 space-y-3">
              <p className="text-sm text-red-700" role="alert">
                No se pudo verificar el estado Premium de esta cuenta. Por seguridad, no iniciaremos otra suscripcion hasta verificarlo.
              </p>
              <button type="button" className="w-full rounded-full border px-5 py-3 font-semibold" onClick={() => window.location.reload()}>
                Volver a comprobar
              </button>
            </div>
          ) : user && plan === "free" && !entitlementLoading ? (
            <button
              type="button"
              className="mt-5 w-full rounded-full bg-ink-900 px-5 py-3 font-semibold text-white disabled:opacity-60"
              disabled={!canStartCheckout}
              onClick={() => void startCheckout()}
            >
              {busy === "checkout" ? "Abriendo checkout..." : `Activar Premium compartido (${interval === "year" ? "39,99 EUR/anio" : "4,99 EUR/mes"})`}
            </button>
          ) : user && checkingAccount ? (
            <p className="mt-5 rounded-xl bg-fuel-50 p-3 text-sm" role="status">
              Comprobando la suscripcion compartida antes de mostrar opciones de compra...
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              <p className="text-sm text-ink-700">
                {localUser
                  ? "Tu cuenta local de Fuel no comparte la identidad de PedalMap. Conecta tu cuenta PedalMap para comprobar si ya tienes Premium y evitar duplicar suscripciones."
                  : "Conecta tu cuenta de PedalMap para comprobar tus derechos actuales o activar la unica suscripcion compartida."}
              </p>
              <button
                type="button"
                className="w-full rounded-full bg-ink-900 px-5 py-3 font-semibold text-white"
                onClick={connectPedalMapAccount}
              >
                Conectar cuenta de PedalMap
              </button>
            </div>
          )}
        </article>
      </div>

      {message ? <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{message}</p> : null}
      {params.get("checkout") === "success" && user && plan === "premium" ? (
        <p className="mt-5 rounded-xl bg-fuel-50 p-3 text-sm font-semibold" role="status">
          Pago confirmado: Premium esta activo en PedalMap y Fuel.
        </p>
      ) : null}
      <p className="mt-6 text-xs text-ink-700">
        El checkout y la facturacion los gestiona PedalMap. Si la cuenta ya tiene una suscripcion activa o en prueba, el servidor bloquea una segunda compra.
      </p>
      <Link to="/planner" className="mt-8 inline-block text-fuel-700">
        Seguir con el plan gratis
      </Link>
    </div>
  );
}
