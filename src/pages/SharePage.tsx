import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { decodePublicPlan } from "@/features/nutrition-engine";
import { formatDuration, SPORT_LABELS } from "@/lib/labels";

export function SharePage() {
  const [params] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const decoded = params.get("p") ? decodePublicPlan(params.get("p") ?? "") : null;

  if (!decoded) {
    return (
      <div className="sf-container py-16">
        <h1 className="font-display text-3xl">Plan no disponible</h1>
        <p className="mt-3">Este enlace no incluye datos privados y puede haber caducado en este dispositivo.</p>
        <Link to="/planner" className="sf-btn mt-4 inline-flex bg-fuel-600 text-white">
          Crear mi plan
        </Link>
      </div>
    );
  }

  const title = `Mi plan para ${formatDuration(decoded.durationMinutes)} de ${SPORT_LABELS[decoded.sport]}`;

  async function shareOrCopy() {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text: decoded?.strategySummary, url });
        return;
      }
    } catch {
      /* cancelado o no soportado */
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  return (
    <div className="sf-container max-w-2xl py-10 sm:py-12">
      <Seo
        title={`${title} — PedalMap Fuel`}
        description={`${decoded.carbohydratePerHourLabel}. Estrategia pública sin peso ni email.`}
        path="/plan/compartido"
      />
      <p className="text-xs uppercase tracking-[0.2em] text-fuel-700">Tarjeta compartible</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h1>
      <div className="sf-card mt-6 space-y-4 p-5 sm:p-6">
        <p className="font-display text-xl">{SPORT_LABELS[decoded.sport]} · {formatDuration(decoded.durationMinutes)}</p>
        <p>Carbohidratos: {decoded.carbohydratePerHourLabel}</p>
        <p>Hidratación: {decoded.hydrationPerHourLabel}</p>
        <p>{decoded.electrolyteLabel}</p>
        <p className="rounded-2xl bg-fuel-50 px-4 py-3 text-ink-700">{decoded.strategySummary}</p>
      </div>
      <p className="mt-4 text-sm text-ink-700">Este enlace no muestra peso, email ni datos privados.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="sf-btn w-full border sm:w-auto" onClick={() => void shareOrCopy()}>
          {copied ? "Enlace copiado" : "Compartir o copiar enlace"}
        </button>
        <Link to="/planner" className="sf-btn w-full bg-fuel-600 text-white sm:w-auto">
          Crear el mío
        </Link>
      </div>
    </div>
  );
}
