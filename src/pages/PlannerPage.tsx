import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PlanResult } from "@/components/PlanResult";
import { Seo } from "@/components/Seo";
import {
  DEFAULT_PANTRY_IDS,
  buildNutritionPlan,
  getProduct,
  type ActivityGoal,
  type ClinicalFlag,
  type FuelPreference,
  type Intensity,
  type NutritionPlan,
  type PlannerInput,
  type SportId,
  validatePlannerInput,
} from "@/features/nutrition-engine";
import { track } from "@/lib/analytics";
import { GOAL_LABELS, INTENSITY_LABELS, PREFERENCE_LABELS, SPORT_LABELS, SPORT_READY } from "@/lib/labels";
import { clearSweatRate, readSweatRate } from "@/lib/sweat-store";

const STEPS = ["Deporte", "Duración", "Intensidad", "Condiciones", "Opcional"];

function defaultDuration(sport: SportId): number {
  if (sport === "hiking") return 240;
  if (sport === "triathlon") return 150;
  if (sport === "football") return 90;
  return 180;
}

export function PlannerPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PlannerInput>(() => {
    const sportParam = params.get("sport");
    const sport = SPORT_READY.includes(sportParam as SportId) ? (sportParam as SportId) : "cycling";
    const sweatParam = Number(params.get("sweat"));
    const stored = readSweatRate();
    const sweat = Number.isFinite(sweatParam) && sweatParam >= 0.2 && sweatParam <= 3.5 ? sweatParam : stored?.litersPerHour;
    return {
      sport,
      durationMinutes: defaultDuration(sport),
      intensity: "moderate",
      bodyMassKg: 75,
      temperatureC: 25,
      goal: "train",
      fuelPreference: sport === "hiking" ? "real-food" : "mixed",
      availableFoodIds: [],
      sweatRateLPerHour: sweat,
    };
  });

  const issues = useMemo(() => validatePlannerInput(form), [form]);
  const storedSweat = readSweatRate();

  useEffect(() => {
    if (params.get("sport") || params.get("sweat")) {
      setStep(params.get("sweat") ? 4 : 0);
    }
  }, [params]);

  function update<K extends keyof PlannerInput>(key: K, value: PlannerInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setPlan(null);
  }

  function calculate() {
    if (issues.length) {
      setError(issues[0]?.message ?? "Revisa los datos.");
      return;
    }
    const next = buildNutritionPlan(form);
    setPlan(next);
    setError(null);
    track("calculator_completed", { sport: form.sport, duration: form.durationMinutes });
    track("plan_created", { sport: form.sport });
    if (next.shoppingList.length) track("shopping_list_created", { items: next.shoppingList.length });
    requestAnimationFrame(() => document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function pickSport(sport: SportId) {
    setForm((current) => {
      const typical = [90, 150, 180, 240];
      return {
        ...current,
        sport,
        durationMinutes: typical.includes(current.durationMinutes) ? defaultDuration(sport) : current.durationMinutes,
        fuelPreference: sport === "hiking" && current.fuelPreference === "mixed" ? "real-food" : current.fuelPreference,
      };
    });
    setPlan(null);
  }

  return (
    <div className="sf-container py-8 sm:py-12">
      <Seo
        title="Crear mi plan — PedalMap Fuel"
        description="Modo rápido: deporte, duración, intensidad, peso y temperatura. Recibe un plan de carbohidratos, hidratación y qué llevar."
        path="/planner"
      />
      <p className="text-sm text-fuel-700">Dime qué vas a hacer y te digo cómo prepararte.</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">Crear mi plan</h1>
      <ol className="mt-6 flex flex-wrap gap-2 text-xs" aria-label="Pasos">
        {STEPS.map((label, index) => (
          <li key={label} className={`rounded-full px-3 py-1 ${index === step ? "bg-ink-900 text-white" : "bg-white text-ink-700"}`}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form
          className="sf-card space-y-5 p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (step < 4) {
              if (step === 0) track("calculator_started", { sport: form.sport });
              setStep((value) => value + 1);
              return;
            }
            calculate();
          }}
        >
          {step === 0 ? (
            <fieldset>
              <legend className="font-display text-xl">Deporte</legend>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SPORT_READY.map((sport) => (
                  <Choice key={sport} active={form.sport === sport} onClick={() => pickSport(sport as SportId)} label={SPORT_LABELS[sport]} />
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 1 ? (
            <fieldset className="space-y-4">
              <legend className="font-display text-xl">Duración</legend>
              <NumberField label="Minutos" value={form.durationMinutes} min={15} max={720} onChange={(value) => update("durationMinutes", value)} />
              {form.sport !== "football" ? (
                <NumberField
                  label="Distancia (km, opcional)"
                  value={form.distanceKm ?? 0}
                  min={0}
                  max={400}
                  onChange={(value) => update("distanceKm", value || undefined)}
                />
              ) : null}
              {form.sport === "cycling" || form.sport === "trail" || form.sport === "hiking" ? (
                <NumberField
                  label="Desnivel (m, opcional)"
                  value={form.elevationGainM ?? 0}
                  min={0}
                  max={8000}
                  onChange={(value) => update("elevationGainM", value || undefined)}
                />
              ) : null}
            </fieldset>
          ) : null}

          {step === 2 ? (
            <fieldset>
              <legend className="font-display text-xl">Intensidad</legend>
              <div className="mt-4 grid gap-2">
                {(Object.keys(INTENSITY_LABELS) as Intensity[]).map((intensity) => (
                  <Choice key={intensity} active={form.intensity === intensity} onClick={() => update("intensity", intensity)} label={INTENSITY_LABELS[intensity]} />
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 3 ? (
            <fieldset className="space-y-4">
              <legend className="font-display text-xl">Condiciones</legend>
              <NumberField label="Peso (kg)" value={form.bodyMassKg} min={40} max={150} onChange={(value) => update("bodyMassKg", value)} />
              <NumberField label="Temperatura (°C)" value={form.temperatureC} min={-5} max={45} onChange={(value) => update("temperatureC", value)} />
              <p className="text-sm font-medium">Objetivo</p>
              <div className="grid gap-2">
                {(Object.keys(GOAL_LABELS) as ActivityGoal[]).map((goal) => (
                  <Choice key={goal} active={form.goal === goal} onClick={() => update("goal", goal)} label={GOAL_LABELS[goal]} />
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 4 ? (
            <fieldset className="space-y-4">
              <legend className="font-display text-xl">Opcional</legend>
              <p className="text-sm text-ink-700">No hace falta para obtener un plan. Sirve para adaptarlo a tu estilo.</p>
              <p className="text-sm font-medium">Preferencia</p>
              <div className="grid gap-2">
                {(Object.keys(PREFERENCE_LABELS) as FuelPreference[]).map((pref) => (
                  <Choice key={pref} active={form.fuelPreference === pref} onClick={() => update("fuelPreference", pref)} label={PREFERENCE_LABELS[pref]} />
                ))}
              </div>
              <p className="text-sm font-medium">Qué tengo en casa</p>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_PANTRY_IDS.map((id) => {
                  const product = getProduct(id);
                  const checked = form.availableFoodIds?.includes(id);
                  return (
                    <label key={id} className="sf-tap flex items-center gap-2 rounded-xl bg-fuel-50 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(checked)}
                        onChange={(event) => {
                          const current = new Set(form.availableFoodIds);
                          if (event.target.checked) current.add(id);
                          else current.delete(id);
                          update("availableFoodIds", [...current]);
                        }}
                      />
                      {product?.name}
                    </label>
                  );
                })}
              </div>
              <NumberField
                label="Tasa de sudoración (L/h, opcional)"
                value={form.sweatRateLPerHour ?? 0}
                min={0}
                max={3.5}
                onChange={(value) => update("sweatRateLPerHour", value >= 0.2 ? value : undefined)}
              />
              {storedSweat ? (
                <p className="text-xs text-ink-700">
                  Última medición en este dispositivo: {storedSweat.litersPerHour} L/h.{" "}
                  <button type="button" className="underline" onClick={() => { clearSweatRate(); update("sweatRateLPerHour", undefined); }}>
                    Quitar
                  </button>
                </p>
              ) : (
                <p className="text-xs text-ink-700">
                  Si no la tienes, el motor usa un rango por temperatura. Mídela en{" "}
                  <Link className="text-fuel-700 underline" to="/calculators/sweat-rate">
                    /calculators/sweat-rate
                  </Link>
                  .
                </p>
              )}
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(form.clinicalFlags?.length)}
                  onChange={(event) => update("clinicalFlags", event.target.checked ? (["other-clinical"] as ClinicalFlag[]) : [])}
                />
                Tengo una condición clínica relevante (diabetes, enfermedad renal/cardiovascular, embarazo, TCA, alergia grave u otra) y no quiero un plan personalizado.
              </label>
            </fieldset>
          ) : null}

          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            {step > 0 ? (
              <button type="button" className="sf-btn w-full border sm:w-auto" onClick={() => setStep((value) => value - 1)}>
                Atrás
              </button>
            ) : null}
            <button type="submit" className="sf-btn w-full bg-fuel-600 text-white sm:w-auto">
              {step < 4 ? "Continuar" : "Crear plan"}
            </button>
            {step < 4 ? (
              <button
                type="button"
                className="sf-btn w-full border sm:w-auto"
                onClick={() => {
                  track("calculator_started", { sport: form.sport, mode: "quick" });
                  calculate();
                  setStep(4);
                }}
              >
                Calcular ya (modo rápido)
              </button>
            ) : null}
          </div>
        </form>

        <div>
          {plan ? (
            <PlanResult plan={plan} onNeedAuth={() => navigate("/register?next=/planner")} />
          ) : (
            <aside className="sf-card p-6 text-ink-700">
              <p className="font-display text-xl text-ink-900">Modo rápido</p>
              <p className="mt-2">Deporte + duración + intensidad + peso + temperatura. El resto es opcional.</p>
              <p className="mt-4 text-sm">
                ¿Quieres afinar hidratación? Usa la{" "}
                <Link className="text-fuel-700 underline" to="/calculators/sweat-rate">
                  tasa de sudoración
                </Link>
                .
              </p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function Choice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`sf-tap w-full rounded-2xl px-4 py-3 text-left text-sm font-medium ${active ? "bg-ink-900 text-white" : "bg-fuel-50"}`}
    >
      {label}
    </button>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => onChange(Number(event.target.value))}
        className="sf-tap mt-1 w-full rounded-2xl border border-ink-900/10 px-4 py-3"
      />
    </label>
  );
}
