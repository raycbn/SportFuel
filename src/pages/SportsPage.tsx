import { Link, useParams } from "react-router-dom";
import { Seo, breadcrumbLd } from "@/components/Seo";
import type { SportId } from "@/features/nutrition-engine";
import { SPORT_LABELS } from "@/lib/labels";

const pages: Record<string, { sport: SportId; intro: string; extra: string }> = {
  cycling: {
    sport: "cycling",
    intro: "El ciclismo permite comer con más facilidad que la carrera. El motor usa los rangos de duración de ACSM/IOC y no obliga a geles.",
    extra: "En salidas de 3 h, espera un rango de transición, no 90 g/h automáticos.",
  },
  running: {
    sport: "running",
    intro: "En running la tolerancia digestiva suele limitar más que la fisiología. El plan se sitúa en la parte práctica del rango.",
    extra: "Para 10K cortos, la comida previa importa más que el protocolo durante.",
  },
  trail: {
    sport: "trail",
    intro: "El trail alarga el día y mezcla comida real con productos. El desnivel se registra como contexto, no como fórmula inventada.",
    extra: "Entrena el intestino antes de perseguir el techo de 90 g/h.",
  },
  hiking: {
    sport: "hiking",
    intro: "El senderismo suele ser de menor intensidad absoluta: más comida real, cadencia más holgada y menos lógica de gel de competición.",
    extra: "El motor baja el punto del rango de carbohidratos (Jeukendrup: intensidad absoluta baja) y no inventa gramos extra por cada metro de desnivel.",
  },
  triathlon: {
    sport: "triathlon",
    intro: "El triatlón mezcla un segmento donde casi no se come (natación) con uno fácil (bici) y uno sensible de estómago (carrera).",
    extra: "Usamos el marco de resistencia de Jeukendrup/ACSM sobre el tiempo total. No fingimos un split T1/T2: la ingesta práctica va sobre todo en bici.",
  },
};

export function SportsIndexPage() {
  return (
    <div className="sf-container py-12">
      <Seo title="Deportes — SportFuel" description="Planes de nutrición para ciclismo, running, trail, senderismo y triatlón." path="/sports" />
      <h1 className="font-display text-4xl">Deportes</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Object.entries(pages).map(([slug, page]) => (
          <Link key={slug} to={`/sports/${slug}`} className="sf-card p-5">
            <h2 className="font-display text-2xl">{SPORT_LABELS[page.sport]}</h2>
            <p className="mt-2 text-sm text-ink-700">{page.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SportDetailPage() {
  const { slug } = useParams();
  const page = slug ? pages[slug] : undefined;
  if (!page) {
    return (
      <div className="sf-container py-16">
        <h1 className="font-display text-3xl">Deporte en arquitectura</h1>
        <p className="mt-3">Natación, MTB, gravel, tenis, pádel, CrossFit y esquí están previstos. Aún no tienen motor propio.</p>
        <Link to="/sports" className="mt-4 inline-block text-fuel-700">
          Volver
        </Link>
      </div>
    );
  }
  return (
    <div className="sf-container max-w-3xl py-12">
      <Seo
        title={`Nutrición ${SPORT_LABELS[page.sport]} — SportFuel`}
        description={page.intro}
        path={`/sports/${slug}`}
        jsonLd={[breadcrumbLd([{ name: "Inicio", path: "/" }, { name: "Deportes", path: "/sports" }, { name: SPORT_LABELS[page.sport], path: `/sports/${slug}` }])]}
      />
      <h1 className="font-display text-4xl">{SPORT_LABELS[page.sport]}</h1>
      <p className="mt-4 text-lg text-ink-700">{page.intro}</p>
      <p className="mt-4">{page.extra}</p>
      <Link to={`/planner?sport=${page.sport}`} className="mt-8 inline-block rounded-full bg-fuel-600 px-5 py-3 font-semibold text-white">
        Crear plan de {SPORT_LABELS[page.sport].toLowerCase()}
      </Link>
    </div>
  );
}
