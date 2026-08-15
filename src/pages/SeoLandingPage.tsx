import { Link } from "react-router-dom";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Seo, breadcrumbLd, faqLd } from "@/components/Seo";

interface Landing {
  path: string;
  title: string;
  description: string;
  lead: string;
  points: string[];
  faqs: Array<{ q: string; a: string }>;
  to: string;
}

export const SEO_LANDINGS: Landing[] = [
  {
    path: "/calculadora-carbohidratos-deporte",
    title: "Calculadora de carbohidratos para deporte",
    description: "Estima un rango de g/h según duración, intensidad y deporte. Basada en ACSM/IOC/ISSN, no en una cifra universal.",
    lead: "El motor no usa 60 g/h para todo el mundo. Cruza duración, intensidad, deporte y objetivo, y te devuelve un intervalo con supuestos.",
    points: [
      "<45 min: habitualmente 0 g/h.",
      "1–2,5 h: 30–60 g/h como banda de consenso.",
      ">2,5–3 h: hasta 90 g/h, no como valor recreativo por defecto de 120 g/h.",
    ],
    faqs: [
      { q: "¿Es una dosis médica?", a: "No. Es una estimación orientativa." },
      { q: "¿Puedo usarla sin cuenta?", a: "Sí." },
    ],
    to: "/planner",
  },
  {
    path: "/calculadora-hidratacion-deporte",
    title: "Calculadora de hidratación para deporte",
    description: "Rango de ml/h según temperatura, intensidad y, si la tienes, tasa de sudoración. Nunca “necesitas exactamente X ml”.",
    lead: "ACSM pide individualizar. Esta calculadora ofrece un rango de partida y te empuja a medir sudor si quieres más precisión.",
    points: [
      "Sin tasa medida: banda según temperatura e intensidad.",
      "Con tasa medida: 60–100 % de esa tasa, sin beber por encima.",
      "Avisos de calor, frío y sobrehidratación.",
    ],
    faqs: [
      { q: "¿400–800 ml/h es obligatorio?", a: "No. Es un intervalo frecuente en literatura, no tu número." },
      { q: "¿Qué riesgo hay si bebo de más?", a: "Hiponatremia por dilución. Por eso el motor no premia “cuanto más, mejor”." },
    ],
    to: "/planner",
  },
  {
    path: "/calculadora-tasa-sudoracion",
    title: "Calculadora de tasa de sudoración",
    description: "Estima L/h con peso antes y después, líquido y orina. Explica la fórmula y sus límites.",
    lead: "Un test de campo de 60–90 minutos te dice más que cualquier media de internet.",
    points: ["Fórmula estándar de campo.", "No es diagnóstico.", "Se puede usar después en el planner."],
    faqs: [{ q: "¿Dónde la calculo?", a: "En /calculators/sweat-rate, con la misma lógica." }],
    to: "/calculators/sweat-rate",
  },
  {
    path: "/nutricion-ciclismo",
    title: "Nutrición para ciclismo",
    description: "Cómo preparar una salida: carbohidratos, bidones, comida real y productos, con evidencia.",
    lead: "El ciclismo es el caso más cómodo para comer. Eso no justifica copiar 90 g/h en un rodaje suave.",
    points: ["Modo rápido de 3 h.", "Lista de compra y coste orientativo.", "Preferencia comida real o geles."],
    faqs: [{ q: "¿Hay que usar geles?", a: "No. Puedes cubrir el rango con pan, fruta o arroz si los toleras." }],
    to: "/planner",
  },
  {
    path: "/nutricion-running",
    title: "Nutrición para running",
    description: "Qué comer antes y durante un rodaje o carrera, con rangos y tolerancia digestiva.",
    lead: "Correr sacude más el estómago. El motor baja un poco el punto práctico del rango, no porque la ciencia sea otra.",
    points: ["Énfasis en alimentos ya probados.", "Sesiones cortas sin protocolo innecesario.", "Recuperación sin ventana mágica."],
    faqs: [{ q: "¿Sirve para 10K y maratón?", a: "El mismo motor ajusta por duración. Un 10K y un maratón no reciben el mismo rango." }],
    to: "/planner",
  },
  {
    path: "/nutricion-trail",
    title: "Nutrición para trail",
    description: "Estrategia para jornadas largas de monte: comida real, hidratación y supuestos.",
    lead: "El trail mezcla duración, calor y avituallamientos irregulares. Mejor un plan flexible que una tabla rígida.",
    points: ["Rangos de duración larga.", "Comida real como primera opción.", "Sudoración propia si puedes medirla."],
    faqs: [{ q: "¿El desnivel cambia los gramos?", a: "Se registra como contexto. No inventamos un extra de g/h por metro." }],
    to: "/planner",
  },
  {
    path: "/hidratacion-ciclismo",
    title: "Hidratación en ciclismo",
    description: "Bidones, calor y tasa de sudoración para salidas en bici, sin cifras exactas fingidas.",
    lead: "Dos ciclistas en el mismo grupo pueden necesitar rangos distintos. Por eso mostramos min/max y supuestos.",
    points: ["Temperatura como primer ajuste.", "Opción de tasa medida.", "Sodio solo si la salida lo justifica."],
    faqs: [{ q: "¿Cuántos bidones llevo?", a: "El plan estima volumen y lo traduce a raciones de 500 ml. No es una marca concreta." }],
    to: "/planner",
  },
  {
    path: "/carbohidratos-ciclismo",
    title: "Carbohidratos en ciclismo",
    description: "Rangos g/h para rodajes y marchas, con fuentes ACSM/IOC y aviso de tolerancia.",
    lead: "La bici permite acercarse al techo del rango mejor que correr, pero el techo sigue siendo un techo, no un objetivo vanity.",
    points: ["30–60 g/h en 1–2,5 h.", "Transición en 3 h.", "Múltiples transportadores si pasas de 60 g/h."],
    faqs: [{ q: "¿120 g/h?", a: "Existe en estudios y consensos recientes para muy largo + intestino entrenado. No es el default de SportFuel." }],
    to: "/planner",
  },
];

export function SeoLandingPage({ path }: { path: string }) {
  const landing = SEO_LANDINGS.find((item) => item.path === path);
  if (!landing) return null;
  return (
    <div className="sf-container max-w-3xl py-12">
      <Seo
        title={`${landing.title} — SportFuel`}
        description={landing.description}
        path={landing.path}
        jsonLd={[
          breadcrumbLd([
            { name: "Inicio", path: "/" },
            { name: landing.title, path: landing.path },
          ]),
          faqLd(landing.faqs),
        ]}
      />
      <h1 className="font-display text-4xl">{landing.title}</h1>
      <p className="mt-4 text-lg text-ink-700">{landing.lead}</p>
      <ul className="mt-6 list-disc space-y-2 pl-5">
        {landing.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <Link to={landing.to} className="mt-8 inline-block rounded-full bg-fuel-600 px-5 py-3 font-semibold text-white">
        Calcular ahora
      </Link>
      <dl className="mt-10 space-y-3">
        {landing.faqs.map((faq) => (
          <div key={faq.q} className="sf-card p-4">
            <dt className="font-semibold">{faq.q}</dt>
            <dd className="mt-1 text-ink-700">{faq.a}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8">
        <DisclaimerBanner compact />
      </div>
    </div>
  );
}
