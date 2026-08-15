import { Seo } from "@/components/Seo";
import { AFFILIATE_OFFERS, CATALOG, EVIDENCE_SOURCES, ENGINE_VERSION } from "@/features/nutrition-engine";
import { readAnalytics } from "@/lib/analytics";

export function AdminPage() {
  const events = readAnalytics();
  return (
    <div className="sf-container space-y-8 py-10">
      <Seo title="Admin local — SportFuel" description="Gestión local de fuentes, reglas y productos de ejemplo." path="/admin" />
      <h1 className="font-display text-3xl">Admin local</h1>
      <p className="text-ink-700">Sin backend. Sirve para revisar fuentes, catálogo y eventos de producto en este navegador.</p>
      <section className="sf-card p-6">
        <h2 className="font-display text-xl">Motor {ENGINE_VERSION}</h2>
        <p className="mt-2 text-sm">Reglas versionadas en <code>src/features/nutrition-engine/</code>.</p>
      </section>
      <section className="sf-card p-6">
        <h2 className="font-display text-xl">Fuentes</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {EVIDENCE_SOURCES.map((source) => (
            <li key={source.id}>
              <strong>{source.shortName}</strong> — {source.title} ({source.year})
            </li>
          ))}
        </ul>
      </section>
      <section className="sf-card p-6">
        <h2 className="font-display text-xl">Productos de ejemplo</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {CATALOG.map((item) => (
            <li key={item.id}>
              {item.name} · {item.category} · {item.examplePriceEur} €
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">Ofertas de afiliación preparadas: {AFFILIATE_OFFERS.filter((o) => !o.enabled).length} desactivadas (sin enlaces falsos).</p>
      </section>
      <section className="sf-card p-6">
        <h2 className="font-display text-xl">Eventos locales</h2>
        <p className="text-sm">{events.length} eventos en este dispositivo.</p>
      </section>
    </div>
  );
}
