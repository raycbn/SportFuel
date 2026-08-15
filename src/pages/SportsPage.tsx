import { Link, useParams } from "react-router-dom";
import { Seo, breadcrumbLd } from "@/components/Seo";
import type { SportId } from "@/features/nutrition-engine";
import { SPORT_LABELS } from "@/lib/labels";

const pages: Record<string, { sport: SportId; intro: string; extra: string; points: string[] }> = {
  cycling: {
    sport: "cycling",
    intro: "El ciclismo permite comer con más facilidad que la carrera. El motor usa los rangos de duración de ACSM/IOC y no obliga a geles.",
    extra: "En salidas de 3 h, espera un rango de transición, no 90 g/h automáticos.",
    points: ["Comer en bici es más fácil que corriendo.", "Puedes cubrir el rango con comida real o productos.", "El calor y tu tasa de sudor pesan más que una cifra de internet."],
  },
  running: {
    sport: "running",
    intro: "En running la tolerancia digestiva suele limitar más que la fisiología. El plan se sitúa en la parte práctica del rango.",
    extra: "Para 10K cortos, la comida previa importa más que el protocolo durante.",
    points: ["El estómago se sacude: prioriza alimentos ya probados.", "Un 10K y un maratón no reciben el mismo rango.", "Beber según sed y temperatura, no por eslogan."],
  },
  trail: {
    sport: "trail",
    intro: "El trail alarga el día y mezcla comida real con productos. El desnivel se registra como contexto, no como fórmula inventada.",
    extra: "Entrena el intestino antes de perseguir el techo de 90 g/h.",
    points: ["Jornadas largas: cadencia más holgada.", "El desnivel no suma gramos mágicos.", "Avituallamientos irregulares: lleva un plan flexible."],
  },
  hiking: {
    sport: "hiking",
    intro: "El senderismo suele ser de menor intensidad absoluta: más comida real, cadencia más holgada y menos lógica de gel de competición.",
    extra: "El motor baja el punto del rango de carbohidratos (Jeukendrup: intensidad absoluta baja) y no inventa gramos extra por cada metro de desnivel.",
    points: [
      "Bocadillo, fruta y frutos secos suelen encajar mejor que un gel cada 20 min.",
      "El desnivel se anota como contexto; no hay un extra de g/h por metro.",
      "Hidratación según calor y, si la tienes, tu tasa de sudoración.",
    ],
  },
  triathlon: {
    sport: "triathlon",
    intro: "El triatlón mezcla un segmento donde casi no se come (natación) con uno fácil (bici) y uno sensible de estómago (carrera).",
    extra: "Usamos el marco de resistencia de Jeukendrup/ACSM sobre el tiempo total. No fingimos un split T1/T2: la ingesta práctica va sobre todo en bici.",
    points: [
      "Llega a la natación ya alimentado; en el agua casi no se come.",
      "La bici es la ventana práctica de bidones y raciones.",
      "En carrera a pie baja la tolerancia: no copies el techo de la bici.",
    ],
  },
  football: {
    sport: "football",
    intro: "El fútbol es intermitente: sprints, pausas y un descanso. No se trata como una marcha de varias horas.",
    extra: "La comida previa cubre gran parte de un partido de ~90 min. Durante, hidratación al borde y en el descanso; no un protocolo de ultra-resistencia.",
    points: [
      "Come 2–3 h antes con alimentos que ya toleras.",
      "Agua (y sodio si hace calor) en el descanso, no un gel de ultra.",
      "Las bandas de resistencia continua se aplican con cautela al tiempo de alta demanda.",
    ],
  },
};

export function SportsIndexPage() {
  return (
    <div className="sf-container py-12">
      <Seo title="Deportes — SportFuel" description="Planes de nutrición para ciclismo, running, trail, senderismo, triatlón y fútbol." path="/sports" />
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
      <ul className="mt-6 list-disc space-y-2 pl-5 text-ink-700">
        {page.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <Link to={`/planner?sport=${page.sport}`} className="sf-btn mt-8 inline-flex bg-fuel-600 text-white">
        Crear plan de {SPORT_LABELS[page.sport].toLowerCase()}
      </Link>
    </div>
  );
}
