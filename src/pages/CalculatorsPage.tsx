import { Link } from "react-router-dom";
import { Seo, breadcrumbLd } from "@/components/Seo";

const items = [
  { to: "/calculadora-carbohidratos-deporte", title: "Carbohidratos", text: "Rangos g/h según duración e intensidad." },
  { to: "/calculadora-hidratacion-deporte", title: "Hidratación", text: "ml/h orientativos, nunca una dosis exacta." },
  { to: "/calculators/sweat-rate", title: "Tasa de sudoración", text: "Test de campo con fórmula y límites." },
  { to: "/planner", title: "Plan completo", text: "Antes, durante, después, lista y coste." },
];

export function CalculatorsPage() {
  return (
    <div className="sf-container py-12">
      <Seo
        title="Calculadoras de nutrición deportiva — PedalMap Fuel"
        description="Calculadoras locales de carbohidratos, hidratación y tasa de sudoración. Sin cuenta y sin IA."
        path="/calculators"
        jsonLd={[breadcrumbLd([{ name: "Inicio", path: "/" }, { name: "Calculadoras", path: "/calculators" }])]}
      />
      <h1 className="font-display text-4xl">Calculadoras</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="sf-card p-6">
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-2 text-ink-700">{item.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
