import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { deleteAccount, getCurrentUser, logoutLocal, updateProfile } from "@/lib/auth";
import { formatDuration, PREFERENCE_LABELS, SPORT_LABELS } from "@/lib/labels";
import { deletePlan, listPlans, toggleFavorite } from "@/lib/plans-store";
import type { FuelPreference, SportId } from "@/features/nutrition-engine";

export function PlansPage() {
  const user = getCurrentUser();
  const [, setTick] = useState(0);
  const plans = useMemo(() => (user ? listPlans(user.email) : []), [user, user?.email]);

  if (!user) {
    return (
      <div className="sf-container py-16">
        <h1 className="font-display text-3xl">Mis planes</h1>
        <p className="mt-3">Inicia sesión para ver el historial. Puedes calcular sin cuenta.</p>
        <Link to="/login" className="mt-4 inline-block text-fuel-700">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="sf-container space-y-8 py-10">
      <Seo title="Mis planes — SportFuel" description="Historial local de planes guardados." path="/plans" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Mis planes</h1>
        <button className="text-sm underline" onClick={() => { logoutLocal(); setTick((v) => v + 1); }}>
          Cerrar sesión
        </button>
      </div>
      <section className="sf-card p-6">
        <h2 className="font-display text-xl">Preferencias</h2>
        <p className="mt-2 text-sm text-ink-700">Solo peso, deportes habituales y estilo de alimentación. Nada sanitario innecesario.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Peso (kg)
            <input
              className="mt-1 w-full rounded-2xl border px-3 py-2"
              type="number"
              defaultValue={user.weightKg ?? 75}
              onBlur={(event) => updateProfile({ weightKg: Number(event.target.value) })}
            />
          </label>
          <label className="text-sm">
            Preferencia
            <select
              className="mt-1 w-full rounded-2xl border px-3 py-2"
              defaultValue={user.fuelPreference ?? "mixed"}
              onChange={(event) => updateProfile({ fuelPreference: event.target.value as FuelPreference })}
            >
              {Object.entries(PREFERENCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-ink-700">Email: {user.email}</p>
        </div>
        <button
          className="mt-4 text-sm text-red-700 underline"
          onClick={() => {
            deleteAccount();
            setTick((v) => v + 1);
          }}
        >
          Eliminar cuenta local
        </button>
      </section>
      <section className="space-y-3">
        {plans.length === 0 ? <p>Aún no hay planes guardados.</p> : null}
        {plans.map((plan) => (
          <article key={plan.id} className="sf-card flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-semibold">
                {SPORT_LABELS[plan.sport as SportId]} · {formatDuration(plan.durationMinutes)}
              </p>
              <p className="text-sm text-ink-700">{new Date(plan.createdAt).toLocaleString("es-ES")}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => { toggleFavorite(plan.id); setTick((v) => v + 1); }}>{plan.favorite ? "★ Favorito" : "☆ Favorito"}</button>
              <Link to={`/plan/${plan.shareSlug}?p=${encodeURIComponent(plan.publicPayload)}`}>Ver</Link>
              <button onClick={() => { deletePlan(plan.id, user.email); setTick((v) => v + 1); }}>Eliminar</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
