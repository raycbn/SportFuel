import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { decodePublicPlan } from "@/features/nutrition-engine";
import { formatDuration, SPORT_LABELS } from "@/lib/labels";

export function SharePage() {
  const [params] = useSearchParams();
  const decoded = params.get("p") ? decodePublicPlan(params.get("p") ?? "") : null;

  if (!decoded) {
    return (
      <div className="sf-container py-16">
        <h1 className="font-display text-3xl">Plan no disponible</h1>
        <p className="mt-3">Este enlace no incluye datos privados y puede haber caducado en este dispositivo.</p>
        <Link to="/planner" className="mt-4 inline-block text-fuel-700">
          Crear mi plan
        </Link>
      </div>
    );
  }

  return (
    <div className="sf-container max-w-2xl py-12">
      <Seo
        title={`Mi plan para ${formatDuration(decoded.durationMinutes)} de ${SPORT_LABELS[decoded.sport]} — SportFuel`}
        description={`${decoded.carbohydratePerHourLabel}. Estrategia pública sin peso ni email.`}
        path="/plan/compartido"
      />
      <p className="text-xs uppercase tracking-[0.2em] text-fuel-700">Tarjeta compartible</p>
      <h1 className="mt-2 font-display text-4xl">
        Mi plan para {formatDuration(decoded.durationMinutes)} de {SPORT_LABELS[decoded.sport].toLowerCase()}
      </h1>
      <div className="sf-card mt-6 space-y-3 p-6">
        <p>Carbohidratos: {decoded.carbohydratePerHourLabel}</p>
        <p>Hidratación: {decoded.hydrationPerHourLabel}</p>
        <p>{decoded.electrolyteLabel}</p>
        <p className="text-ink-700">{decoded.strategySummary}</p>
      </div>
      <p className="mt-4 text-sm text-ink-700">Este enlace no muestra peso, email ni datos privados.</p>
      <Link to="/planner" className="mt-6 inline-block rounded-full bg-fuel-600 px-5 py-3 font-semibold text-white">
        Crear el mío
      </Link>
    </div>
  );
}
