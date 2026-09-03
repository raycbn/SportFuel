import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { encodePublicPlan, sourceList, type CompetitionEvent, type NutritionPlan, type SportId } from "@/features/nutrition-engine";
import { track } from "@/lib/analytics";
import { getSessionEmail } from "@/lib/auth";
import { useFuelAuth } from "@/contexts/AuthContext";
import { formatDuration, GOAL_LABELS, INTENSITY_LABELS, PREFERENCE_LABELS, SPORT_LABELS } from "@/lib/labels";
import { savePlan } from "@/lib/plans-store";
import { type RouteSummary } from "@/lib/pedalmap-integration";
import { DisclaimerBanner } from "./DisclaimerBanner";

const SPORT_CALLOUTS: Partial<Record<SportId, string>> = {
  hiking: "Senderismo: prioriza comida real y un ritmo de ingesta más holgado. El desnivel es contexto, no gramos extra.",
  triathlon: "Triatlón: no hay un split T1/T2 inventado. El g/h es del tiempo total; come sobre todo en bici.",
  football: "Fútbol: partido intermitente. Hidratación al borde y en el descanso, no un protocolo de ultra.",
};

export function PlanResult({ plan, onNeedAuth, routeSummary }: { plan: NutritionPlan; onNeedAuth: () => void; routeSummary?: RouteSummary | null }) {
  const [openFull, setOpenFull] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const { plan: authPlan, maxRoutesSaved, routesSaved } = useFuelAuth();
  const isPremium = authPlan === "premium";
  const sources = useMemo(() => {
    const ids = [
      ...plan.carbohydrate.meta.evidenceSources,
      ...plan.hydration.meta.evidenceSources,
      ...plan.electrolytes.meta.evidenceSources,
    ];
    return sourceList([...new Set(ids)]);
  }, [plan]);

  if (!plan.calculatorReady) {
    return (
      <section className="sf-card space-y-4 p-6">
        <h2 className="font-display text-2xl">No podemos personalizar este plan</h2>
        <p>{plan.blockedReason}</p>
        <DisclaimerBanner />
      </section>
    );
  }

  const shareUrl = `/plan/${plan.shareSlug}?p=${encodeURIComponent(encodePublicPlan(plan))}`;
  const sportCallout = SPORT_CALLOUTS[plan.sport];
  const email = getSessionEmail();
  const limit = typeof maxRoutesSaved === "number" ? maxRoutesSaved : 3;
  const savedCount = typeof routesSaved === "number" ? routesSaved : 0;
  const atLimit = !isPremium && savedCount >= limit;

  return (
    <div id="resultado" className="space-y-6">
      {routeSummary ? (
        <section className="sf-card overflow-hidden">
          <div className="bg-ink-900 px-5 py-6 text-white sm:px-8">
            <p className="text-xs uppercase tracking-[0.2em] text-fuel-300">Tu salida</p>
            <h2 className="mt-2 font-display text-3xl">
              {SPORT_LABELS[plan.sport]} · {formatDuration(routeSummary.durationMinutes ?? plan.durationMinutes)}
            </h2>
            <p className="mt-2 text-white/70">
              {routeSummary.distanceKm !== undefined && `${routeSummary.distanceKm.toLocaleString("es-ES")} km · `}
              {routeSummary.elevationGainM !== undefined && `+${routeSummary.elevationGainM.toLocaleString("es-ES")} m · `}
              Intensidad {INTENSITY_LABELS[plan.intensity].toLowerCase()} · {routeSummary.temperatureC ?? plan.temperatureC} °C · {GOAL_LABELS[plan.goal]} ·{" "}
              {PREFERENCE_LABELS[plan.fuelPreference]}
            </p>
          </div>
        </section>
      ) : (
        <section className="sf-card overflow-hidden">
          <div className="bg-ink-900 px-5 py-6 text-white sm:px-8">
            <p className="text-xs uppercase tracking-[0.2em] text-fuel-300">Tu plan</p>
            <h2 className="mt-2 font-display text-3xl">
              {SPORT_LABELS[plan.sport]} · {formatDuration(plan.durationMinutes)}
            </h2>
            <p className="mt-2 text-white/70">
              Intensidad {INTENSITY_LABELS[plan.intensity].toLowerCase()} · {plan.temperatureC} °C · {GOAL_LABELS[plan.goal]} ·{" "}
              {PREFERENCE_LABELS[plan.fuelPreference]}
            </p>
          </div>
        </section>
      )}

      <section className="sf-card overflow-hidden">
        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-8">
          <Metric label="Carbohidratos objetivo" value={plan.summary.carbohydratePerHourLabel} />
          <Metric label="Hidratación orientativa" value={plan.summary.hydrationPerHourLabel} />
          <Metric label="Electrolitos" value={plan.summary.electrolyteLabel} />
        </div>
        <div className="space-y-3 px-5 pb-4 sm:px-8">
          <p className="text-sm leading-relaxed text-ink-700">{plan.during.strategySummary}</p>
          {sportCallout ? <p className="rounded-2xl bg-fuel-50 px-4 py-3 text-sm">{sportCallout}</p> : null}
        </div>
        <div className="flex flex-col gap-3 px-5 pb-6 sm:flex-row sm:px-8">
          <button type="button" className="sf-btn w-full bg-fuel-600 text-white sm:w-auto" onClick={() => setOpenFull(true)}>
            Ver plan completo
          </button>
          <button
            type="button"
            className="sf-btn w-full border border-ink-900/10 sm:w-auto"
            onClick={() => {
              if (!email) {
                onNeedAuth();
                return;
              }
              if (atLimit) {
                return;
              }
              savePlan(email, plan, encodePublicPlan(plan));
              setSaved(true);
              track("plan_saved", { sport: plan.sport });
            }}
          >
            {saved ? "Plan guardado" : atLimit ? "Límite de planes alcanzado" : "Guarda este plan gratis"}
          </button>
          <Link
            to={shareUrl}
            className="sf-btn w-full border border-ink-900/10 sm:w-auto"
            onClick={() => track("plan_shared", { sport: plan.sport })}
          >
            Compartir
          </Link>
        </div>
        {atLimit ? (
          <p className="px-5 pb-2 text-sm text-ink-700 sm:px-8">
            Has alcanzado el límite de {limit} planes guardados en modo Free.{" "}
            <Link className="text-fuel-700 underline" to="/premium">
              Hazte Premium para guardar planes ilimitados
            </Link>
            .
          </p>
        ) : null}
      </section>

      {plan.competitionStrategy ? (
        <section className="sf-card space-y-3 border-2 border-fuel-500/20 bg-fuel-50/40 p-6">
          <h3 className="font-display text-xl">Día de competición</h3>
          <p className="text-sm text-ink-700">{plan.competitionStrategy.summary}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-semibold">Pre-salida</h4>
              <ul className="mt-2 space-y-2">
                {plan.competitionStrategy.preStart.map((event: CompetitionEvent) => (
                  <li key={event.minute} className="text-sm">
                    <span className="font-medium">{event.label}</span>
                    {event.carbohydrateGrams ? <span> · {event.carbohydrateGrams} g CHO</span> : null}
                    {event.fluidMl ? <span> · {event.fluidMl} ml</span> : null}
                    <ul className="list-disc pl-5 text-ink-700">
                      {event.items.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Durante</h4>
              <ul className="mt-2 space-y-2">
                {plan.competitionStrategy.during.map((event: CompetitionEvent) => (
                  <li key={event.minute} className="text-sm">
                    <span className="font-medium">{event.label}</span>
                    {event.carbohydrateGrams ? <span> · {event.carbohydrateGrams} g CHO</span> : null}
                    {event.fluidMl ? <span> · {event.fluidMl} ml</span> : null}
                    {event.sodiumMg ? <span> · {event.sodiumMg} mg sodio</span> : null}
                    <ul className="list-disc pl-5 text-ink-700">
                      {event.items.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-semibold">Meta y primeros minutos</h4>
              <ul className="mt-2 space-y-2">
                {plan.competitionStrategy.finish.map((event: CompetitionEvent) => (
                  <li key={event.minute} className="text-sm">
                    <span className="font-medium">{event.label}</span>
                    {event.carbohydrateGrams ? <span> · {event.carbohydrateGrams} g CHO</span> : null}
                    {event.fluidMl ? <span> · {event.fluidMl} ml</span> : null}
                    <ul className="list-disc pl-5 text-ink-700">
                      {event.items.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Recuperación</h4>
              <ul className="mt-2 space-y-2">
                {plan.competitionStrategy.recovery.map((event: CompetitionEvent) => (
                  <li key={event.minute} className="text-sm">
                    <span className="font-medium">{event.label}</span>
                    {event.carbohydrateGrams ? <span> · {event.carbohydrateGrams} g CHO</span> : null}
                    {event.fluidMl ? <span> · {event.fluidMl} ml</span> : null}
                    <ul className="list-disc pl-5 text-ink-700">
                      {event.items.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Estrategia de emergencia</h4>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-700">
              {plan.competitionStrategy.emergency.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {plan.digestiveAdaptation && isPremium ? (
        <section className="sf-card space-y-3 border-2 border-fuel-500/20 bg-fuel-50/40 p-6">
          <h3 className="font-display text-xl">Adaptación digestiva</h3>
          <p className="text-sm text-ink-700">{plan.digestiveAdaptation.summary}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-semibold">Timing</h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-ink-700">
                {plan.digestiveAdaptation.timingGuidance.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Alimentos</h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-ink-700">
                {plan.digestiveAdaptation.foodGuidance.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-sm text-ink-700">{plan.digestiveAdaptation.carbohydrateNote}</p>
        </section>
      ) : null}

      {plan.digestiveAdaptation && !isPremium ? (
        <section className="sf-card space-y-3 border-2 border-fuel-500/20 bg-fuel-50/40 p-6">
          <h3 className="font-display text-xl">Adaptación digestiva</h3>
          <p className="text-sm text-ink-700">
            Tu plan ya tiene en cuenta tu tolerancia digestiva en el cálculo de carbohidratos. La adaptación avanzada con timing y alimentos específicos está disponible para usuarios Premium.
          </p>
          <p className="text-sm text-fuel-700">
            ¿Quieres acceder a la adaptación digestiva avanzada?{" "}
            <Link className="underline" to="/premium">
              Ver planes Premium
            </Link>
            .
          </p>
        </section>
      ) : null}

      {openFull ? (
        <div className="space-y-6">
          <section className="sf-card space-y-4 p-6">
            <h3 className="font-display text-xl">Timeline</h3>
            <ol className="space-y-3">
              {plan.during.events.map((event) => (
                <li key={`${event.minute}-${event.label}`} className="flex flex-col gap-1 rounded-2xl bg-fuel-50 px-4 py-3 sm:flex-row sm:gap-4">
                  <span className="shrink-0 font-semibold text-fuel-700 sm:w-20">{event.label}</span>
                  <div>
                    <p>{event.items.join(" ")}</p>
                    {event.carbohydrateGrams ? <p className="text-sm text-ink-700">≈ {event.carbohydrateGrams} g CHO · {event.fluidMl} ml</p> : null}
                    {event.note ? <p className="text-sm text-ink-700">{event.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="sf-card space-y-3 p-6">
            <h3 className="font-display text-xl">Hidratación</h3>
            <p>{plan.hydration.why}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Hidratación/h" value={plan.summary.hydrationPerHourLabel} />
              <Metric label="Sodio orientativo" value={plan.summary.electrolyteLabel} />
              <Metric label="Temperatura" value={`${plan.temperatureC} °C`} />
            </div>
            <ul className="list-disc pl-5 text-sm text-ink-700">
              {plan.hydration.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {plan.hydration.warnings.map((item) => (
              <p key={item} className="text-sm">
                {item}
              </p>
            ))}
          </section>

          <section className="sf-card space-y-3 p-6">
            <h3 className="font-display text-xl">Qué preparar y llevar</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-fuel-700">Qué tienes en casa</p>
                {plan.pantry.used.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-700">Selecciona alimentos en el formulario para adaptar el plan a lo que ya tienes.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {plan.pantry.used.map((item) => (
                      <li key={item.productId} className="flex flex-col gap-1 rounded-xl bg-fuel-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <span>
                          {item.servings} × {item.name}
                        </span>
                        <span className="text-sm text-ink-700">
                          ≈ {item.carbohydrateG} g CHO
                          {item.fluidMl ? ` · ${item.fluidMl} ml` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-sm">Cobertura estimada: {plan.pantry.coveragePercent}%</p>
                {plan.pantry.missing.length > 0 ? (
                  <p className="mt-2 text-sm text-ink-700">Falta: {plan.pantry.missing.join(" ")}</p>
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-fuel-700">Lista de compra</p>
                <ul className="mt-2 space-y-2">
                  {plan.shoppingList.map((item) => (
                    <li key={item.name} className="flex flex-col gap-1 rounded-xl bg-fuel-50 px-3 py-3">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-ink-700">
                        {item.quantityLabel}
                        {item.optional ? " (opcional)" : ""}
                      </span>
                      {item.notes ? <span className="text-sm text-ink-700">{item.notes}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="sf-card space-y-3 p-6">
            <h3 className="font-display text-xl">Antes de salir</h3>
            <p>{plan.preActivity.timingLabel}</p>
            <p>
              Ejemplo práctico: {plan.preActivity.exampleMealGramsMin}–{plan.preActivity.exampleMealGramsMax} g de carbohidratos (
              {plan.preActivity.carbohydrateGPerKgMin}–{plan.preActivity.carbohydrateGPerKgMax} g/kg), no una dieta clínica.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {plan.preActivity.foodExamples.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}.</strong> {item.reason}
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink-700">{plan.preActivity.hydrationNote}</p>
          </section>

          <section className="sf-card space-y-3 p-6">
            <h3 className="font-display text-xl">Después de la salida</h3>
            <p>{plan.recovery.carbohydrateNote}</p>
            <p>{plan.recovery.proteinNote}</p>
            <p>{plan.recovery.hydrationNote}</p>
            <ul className="list-disc pl-5">
              {plan.recovery.mealExamples.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="sf-card space-y-3 p-6">
            <h3 className="font-display text-xl">¿Cuánto me costará alimentar esta salida?</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Económica" value={`${plan.cost.economyEur.toFixed(1)} €`} />
              <Metric label="Intermedia" value={`${plan.cost.midEur.toFixed(1)} €`} />
              <Metric label="Deportiva" value={`${plan.cost.sportEur.toFixed(1)} €`} />
            </div>
            <p className="text-sm text-ink-700">{plan.cost.disclaimer}</p>
          </section>

          <section className="sf-card space-y-3 p-6">
            <h3 className="font-display text-xl">Por qué estos rangos</h3>
            <p>{plan.carbohydrate.why}</p>
            <ul className="list-disc pl-5 text-sm text-ink-700">
              {plan.carbohydrate.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {plan.carbohydrate.warnings.map((item) => (
              <p key={item} className="text-sm">
                {item}
              </p>
            ))}
          </section>

          <section className="sf-card space-y-3 p-6">
            <h3 className="font-display text-xl">Fuentes</h3>
            <ul className="space-y-2 text-sm">
              {sources.map((source) => (
                <li key={source.id}>
                  <a className="font-medium text-fuel-700 underline" href={source.url} target="_blank" rel="noreferrer">
                    {source.shortName}
                  </a>
                  : {source.title} ({source.year}).
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          className="sf-btn w-full border text-sm sm:w-auto"
          onClick={async () => {
            const url = `${window.location.origin}${shareUrl}`;
            const title = `Mi plan para ${formatDuration(plan.durationMinutes)} de ${SPORT_LABELS[plan.sport]}`;
            try {
              if (typeof navigator.share === "function") {
                await navigator.share({ title, text: plan.during.strategySummary, url });
                track("plan_shared", { method: "native" });
                return;
              }
            } catch {
              /* cancelado o no soportado: copiar */
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            track("plan_shared", { method: "copy" });
          }}
        >
          {copied ? "Enlace copiado" : "Copiar o compartir tarjeta"}
        </button>
        <p className="text-xs text-ink-700">El enlace no incluye peso, email ni datos privados.</p>
      </div>
      <DisclaimerBanner compact />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-fuel-50 px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-fuel-700">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold leading-snug">{value}</p>
    </div>
  );
}
