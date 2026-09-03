import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { track } from "@/lib/analytics";

export function PremiumPage() {
  return (
    <div className="sf-container max-w-3xl py-12">
      <Seo
        title="Premium — PedalMap Fuel"
        description="Planes ilimitados, historial y personalización avanzada. Trial futuro de 7 días."
        path="/premium"
      />
      <h1 className="font-display text-4xl">Premium (provisional)</h1>
      <p className="mt-4 text-ink-700">
        Los pagos no están implementados. Stripe queda preparado en arquitectura. No se cobra nada en esta fase.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="sf-card p-6">
          <h2 className="font-display text-2xl">Gratis</h2>
          <ul className="mt-3 list-disc pl-5 text-ink-700">
            <li>Calculadoras y modo rápido</li>
            <li>Planes básicos</li>
            <li>Tasa de sudoración</li>
            <li>Lista de compra básica</li>
            <li>Hasta 3 planes guardados</li>
            <li>Plan básico de nutrición</li>
          </ul>
        </article>
        <article className="sf-card p-6">
          <h2 className="font-display text-2xl">Premium</h2>
          <p className="mt-1 text-fuel-700">4,99 €/mes o 39,99 €/año</p>
          <ul className="mt-3 list-disc pl-5 text-ink-700">
            <li>Planes guardados ilimitados</li>
            <li>Modo competición con timeline estructurado</li>
            <li>Adaptación digestiva avanzada</li>
            <li>Estrategia de cafeína</li>
            <li>Personalización avanzada</li>
            <li>Más deportes y plantillas</li>
            <li>Trial futuro de 7 días</li>
          </ul>
          <button
            className="mt-6 rounded-full bg-ink-900 px-5 py-3 text-white"
            onClick={() => track("premium_clicked", { source: "premium_page" })}
          >
            Avisarme cuando exista (sin pago)
          </button>
        </article>
      </div>
      <Link to="/planner" className="mt-8 inline-block text-fuel-700">
        Seguir con el plan gratis →
      </Link>
    </div>
  );
}
