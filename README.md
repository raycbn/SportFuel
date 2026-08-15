# SportFuel

Aplicación web para planificar **nutrición e hidratación** antes, durante y después de una actividad deportiva. Independiente de PedalMap: código, identidad, usuarios y datos propios.

> Dime qué vas a hacer y te digo cómo prepararte.

## Qué hace (MVP real)

Un usuario anónimo puede: **Ciclismo → 3 h → intensidad moderada → 75 kg → 25 °C → calcular** y recibir carbohidratos, hidratación, estrategia, timeline y lista. Sin cuenta, sin IA y sin backend obligatorio.

- Planner en `/planner` (ciclismo, running, trail, senderismo, triatlón, fútbol)
- Motor determinista en `src/features/nutrition-engine/`
- “Qué tengo en casa”, preferencia comida real / productos / mezcla
- Lista de compra y coste orientativo por salida
- Calculadora de tasa de sudoración
- Plan compartible **sin peso ni email**
- Cuentas locales para guardar historial
- Blog, landings SEO, privacidad y disclaimer

## Stack

React + TypeScript + Vite + Tailwind. Cálculos locales. Coste objetivo: **0 €/mes**.

```bash
npm install
npm test
npm run dev
npm run build
```

## Principios

- No es un producto médico.
- No se inventan recomendaciones: cada regla tiene fuentes y fecha de revisión.
- La UI no calcula; el motor sí.
- Firebase y Stripe son opcionales y no están activados.

## Sitio de prueba

https://tranquil-basbousa-7fec55.netlify.app

Cada push a `main` se publica solo (Netlify GitHub App). Detalles en [DEPLOY.md](./DEPLOY.md).

## Documentación

- [PROJECT_AUDIT.md](./PROJECT_AUDIT.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [NUTRITION_EVIDENCE.md](./NUTRITION_EVIDENCE.md)
- [NUTRITION_RULES.md](./NUTRITION_RULES.md)
- [COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md)
- [SEO.md](./SEO.md)
- [MONETIZATION.md](./MONETIZATION.md)
- [SECURITY.md](./SECURITY.md)
- [ROADMAP.md](./ROADMAP.md)
