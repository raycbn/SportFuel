import { Link } from "react-router-dom";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Seo, faqLd, webAppLd } from "@/components/Seo";

const faqs = [
  {
    q: "¿PedalMap Fuel sustituye a un nutricionista?",
    a: "No. Ofrece estimaciones orientativas a partir de duración, intensidad y referencias de nutrición deportiva. No diagnostica ni trata.",
  },
  {
    q: "¿Necesito crear una cuenta?",
    a: "No. Puedes calcular y compartir sin registro. La cuenta solo hace falta para guardar historial y preferencias.",
  },
  {
    q: "¿Usa inteligencia artificial?",
    a: "No. El plan sale de reglas, rangos y fórmulas deterministas documentadas.",
  },
  {
    q: "¿Para qué deportes sirve ahora?",
    a: "Ciclismo, running, trail, senderismo, triatlón y fútbol. El resto (natación, MTB, gravel, etc.) está preparado en arquitectura.",
  },
];

export function HomePage() {
  return (
    <>
      <Seo
        title="PedalMap Fuel — Prepara tu próxima salida"
        description="Calcula qué comer, cuánto beber y qué llevar antes de entrenar o competir. Planes de nutrición e hidratación para ciclismo, running, trail, senderismo, triatlón y fútbol."
        path="/"
        jsonLd={[webAppLd(), faqLd(faqs)]}
      />
      <section className="bg-ink-900 text-white">
        <div className="sf-container grid gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-24">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-fuel-300">Nutrición para salir a entrenar</p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Prepara tu próxima salida.</h1>
            <p className="mt-4 max-w-xl text-lg text-white/75">
              Calcula qué comer, cuánto beber y qué llevar antes de entrenar o competir.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/planner" className="sf-btn bg-fuel-500 text-center text-white hover:bg-fuel-400">
                Crear mi plan gratis
              </Link>
              <Link to="/calculators" className="sf-btn border border-white/20 text-center">
                Ver calculadoras
              </Link>
            </div>
          </div>
          <div className="sf-card p-6 text-ink-900">
            <p className="text-xs uppercase tracking-wide text-fuel-700">Ejemplo</p>
            <p className="mt-2 font-display text-2xl">Ciclismo · 3 h</p>
            <p className="mt-3 text-sm">Carbohidratos 45–75 g/h · Hidratación 500–1000 ml/h · Timeline cada 30 min</p>
            <p className="mt-4 text-xs text-ink-700">Rangos orientativos, no una dosis exacta. El motor usa tu duración, intensidad y condiciones.</p>
          </div>
        </div>
      </section>

      <section className="sf-container grid gap-6 py-14 md:grid-cols-3">
        {[
          ["1. Deporte", "Ciclismo, running, trail, senderismo, triatlón o fútbol. El resto se irá abriendo sin rehacer la app."],
          ["2. Datos mínimos", "Duración, intensidad, peso y temperatura. Nada de historial clínico innecesario."],
          ["3. Tu plan", "Qué comer, cuándo beber, qué llevar y qué puedes usar de casa."],
        ].map(([title, text]) => (
          <article key={title} className="sf-card p-6">
            <h2 className="font-display text-xl">{title}</h2>
            <p className="mt-2 text-ink-700">{text}</p>
          </article>
        ))}
      </section>

      <section className="bg-white py-14">
        <div className="sf-container">
          <h2 className="font-display text-3xl">Deportes</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {(
              [
                ["/sports/cycling", "Ciclismo"],
                ["/sports/running", "Running"],
                ["/sports/trail", "Trail"],
                ["/sports/hiking", "Senderismo"],
                ["/sports/triathlon", "Triatlón"],
                ["/sports/football", "Fútbol"],
              ] as const
            ).map(([to, label]) => (
              <Link key={to} to={to} className="sf-card p-5 font-semibold hover:border-fuel-400">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sf-container grid gap-6 py-14 md:grid-cols-2">
        <article className="sf-card p-6">
          <h2 className="font-display text-2xl">Calculadoras</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link className="text-fuel-700 underline" to="/calculadora-carbohidratos-deporte">
                Carbohidratos
              </Link>
            </li>
            <li>
              <Link className="text-fuel-700 underline" to="/calculadora-hidratacion-deporte">
                Hidratación
              </Link>
            </li>
            <li>
              <Link className="text-fuel-700 underline" to="/calculadora-tasa-sudoracion">
                Tasa de sudoración
              </Link>
            </li>
          </ul>
        </article>
        <article className="sf-card p-6">
          <h2 className="font-display text-2xl">Por qué es distinto</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-700">
            <li>Español desde el día 1 y modo rápido.</li>
            <li>Comida real, productos deportivos o mezcla.</li>
            <li>Qué tienes en casa, lista de compra y coste orientativo.</li>
            <li>Reglas con fuentes, no una caja negra.</li>
          </ul>
        </article>
      </section>

      <section className="bg-white py-14">
        <div className="sf-container">
          <h2 className="font-display text-3xl">Evidencia, no eslóganes</h2>
          <p className="mt-3 max-w-3xl text-ink-700">
            Las reglas parten de position stands de ACSM, ISSN e IOC y de consensos recientes. Si una cifra no se puede justificar, no se inventa.
          </p>
          <Link to="/blog" className="mt-4 inline-block font-semibold text-fuel-700">
            Leer el blog →
          </Link>
        </div>
      </section>

      <section className="sf-container py-14">
        <h2 className="font-display text-3xl">Preguntas frecuentes</h2>
        <dl className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="sf-card p-5">
              <dt className="font-semibold">{faq.q}</dt>
              <dd className="mt-2 text-ink-700">{faq.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8">
          <DisclaimerBanner />
        </div>
        <div className="mt-8 text-center">
          <Link to="/planner" className="sf-btn inline-flex bg-fuel-600 text-white">
            Crear mi plan gratis
          </Link>
        </div>
      </section>
    </>
  );
}
