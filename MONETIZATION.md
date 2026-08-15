# MONETIZATION

## Ahora (0 €)

Gratis: calculadoras, modo rápido, plan básico, sudor, lista. Sin pagos.

## Premium (provisional, no cobrado)

- 4,99 €/mes  
- 39,99 €/año  
- Trial futuro 7 días  

Contenido previsto: planes ilimitados, historial, personalización avanzada, más deportes, plantillas, competición.

Stripe: **no implementado**. No hay claves ni checkout.

## Afiliación (preparada, no activa)

Modelos `CatalogProduct` y `AffiliateOffer` (Amazon, Decathlon, marca, tienda). `enabled: false`. Cero enlaces falsos y cero claims médicos de producto.

## Métricas

| Embudo | Evento |
| --- | --- |
| Activation | `calculator_completed` / `plan_created` |
| Retention | vuelta al planner (evento local) |
| Conversion | `plan_saved` / `signup_completed` |
| Revenue | `premium_clicked` / `affiliate_clicked` (este último no se dispara: no hay links) |

## Coste mensual estimado

**0 €** en MVP si el hosting es Cloudflare Pages, GitHub Pages o Firebase Spark.
