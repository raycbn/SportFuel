import { useState } from "react";
import { Link } from "react-router-dom";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Seo, breadcrumbLd, faqLd } from "@/components/Seo";
import { calculateSweatRate, validateSweatRateInput, type SweatRateResult } from "@/features/nutrition-engine";
import { track } from "@/lib/analytics";
import { saveSweatRate } from "@/lib/sweat-store";

const faqs = [
  { q: "¿Es una prueba clínica?", a: "No. Es una estimación de campo con limitaciones. No diagnostica deshidratación." },
  { q: "¿Qué hago con el resultado?", a: "Úsalo como tasa opcional en el planner para acotar el rango de hidratación." },
];

export function SweatRatePage() {
  const [weightBeforeKg, setBefore] = useState(75);
  const [weightAfterKg, setAfter] = useState(73.8);
  const [fluidIngestedMl, setFluid] = useState(800);
  const [durationMinutes, setDuration] = useState(90);
  const [urineDuringMl, setUrine] = useState(0);
  const [result, setResult] = useState<SweatRateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="sf-container grid gap-8 py-10 lg:grid-cols-2">
      <Seo
        title="Calculadora de tasa de sudoración — PedalMap Fuel"
        description="Estima tu tasa de sudoración con peso antes y después, líquido y orina. Fórmula y limitaciones incluidas."
        path="/calculators/sweat-rate"
        jsonLd={[
          breadcrumbLd([
            { name: "Inicio", path: "/" },
            { name: "Calculadoras", path: "/calculators" },
            { name: "Tasa de sudoración", path: "/calculators/sweat-rate" },
          ]),
          faqLd(faqs),
        ]}
      />
      <div>
        <h1 className="font-display text-3xl">Tasa de sudoración</h1>
        <p className="mt-3 text-ink-700">No es una medición clínica. Sirve para personalizar el rango de bebida, no para diagnosticar.</p>
        <form
          className="sf-card mt-6 space-y-4 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            const input = { weightBeforeKg, weightAfterKg, fluidIngestedMl, durationMinutes, urineDuringMl };
            const issues = validateSweatRateInput(input);
            if (issues.length) {
              setError(issues[0]?.message ?? "Revisa los datos");
              setResult(null);
              return;
            }
            setError(null);
            const next = calculateSweatRate(input);
            setResult(next);
            if (next.sweatRateLPerHour > 0) saveSweatRate(next.sweatRateLPerHour);
            track("sweat_test_completed", { duration: durationMinutes });
          }}
        >
          <Field label="Peso antes (kg)" value={weightBeforeKg} onChange={setBefore} min={40} max={150} />
          <Field label="Peso después (kg)" value={weightAfterKg} onChange={setAfter} min={38} max={152} />
          <Field label="Líquido ingerido (ml)" value={fluidIngestedMl} onChange={setFluid} min={0} max={8000} />
          <Field label="Duración (min)" value={durationMinutes} onChange={setDuration} min={15} max={720} />
          <Field label="Orina durante (ml, opcional)" value={urineDuringMl} onChange={setUrine} min={0} max={2000} />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button className="rounded-full bg-fuel-600 px-5 py-3 font-semibold text-white" type="submit">
            Calcular estimación
          </button>
        </form>
      </div>
      <div className="space-y-4">
        {result ? (
          <section className="sf-card p-6">
            <p className="text-xs uppercase text-fuel-700">Estimación</p>
            <p className="mt-2 font-display text-3xl">{result.sweatRateLPerHour} L/h</p>
            <p className="mt-2">Pérdida estimada: {result.sweatLossL} L</p>
            <p className="mt-4 text-sm">{result.formula}</p>
            <ul className="mt-4 list-disc pl-5 text-sm text-ink-700">
              {result.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {result.warnings.map((item) => (
              <p key={item} className="mt-2 text-sm">
                {item}
              </p>
            ))}
            <p className="mt-4 text-sm">{result.clinicalDisclaimer}</p>
            <Link
              to={`/planner?sweat=${encodeURIComponent(String(result.sweatRateLPerHour))}`}
              className="mt-4 inline-block font-semibold text-fuel-700"
            >
              Usar {result.sweatRateLPerHour} L/h en mi plan →
            </Link>
          </section>
        ) : (
          <aside className="sf-card p-6 text-ink-700">
            <p>Pésate sin zapatillas, anota lo que bebas y, si orinas, mídelo. Repite el test en calor y en fresco: la tasa cambia.</p>
          </aside>
        )}
        <dl className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.q} className="sf-card p-4">
              <dt className="font-semibold">{faq.q}</dt>
              <dd className="mt-1 text-sm text-ink-700">{faq.a}</dd>
            </div>
          ))}
        </dl>
        <DisclaimerBanner compact />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input className="mt-1 w-full rounded-2xl border px-4 py-3" type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
