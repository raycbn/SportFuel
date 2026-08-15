# PROJECT_AUDIT — SportFuel

Fecha de auditoría: 2026-08-15  
Revisión: 1.0  
Estado del repositorio en el momento de la auditoría: **vacío** (solo `README.md` con el título `# SportFuel` y un commit inicial).

## 1. Hallazgos del repositorio

| Área | Estado | Riesgo |
| --- | --- | --- |
| Código de aplicación | Inexistente | Ningún lastre; hay que construir desde cero |
| Identidad PedalMap | No hay código, usuarios ni datos reutilizables | Cumple el requisito de independencia |
| Dependencias | Ninguna | Hay que elegir stack y pinnear versiones |
| Tests | Ninguno | El motor de nutrición debe nacer con tests |
| Infra / secretos | Ninguno | Evitar introducir costes o secretos innecesarios |
| Dominio / hosting | No configurado | Preview local / hosting estático gratuito |

Conclusión: el MVP debe construirse como producto independiente (React + TypeScript + Vite + Tailwind), con cálculos 100 % locales y sin APIs de IA ni de nutrición de pago.

## 2. Problema de producto

El usuario tiene una actividad o competición y necesita saber **qué preparar, comer y beber antes, durante y después**, con un plan comprensible, una lista de lo que llevar y una adaptación a lo que ya tiene en casa.

No es un producto médico. No diagnostica, no trata, no prescribe dietas clínicas ni planes de pérdida de peso.

## 3. Decisiones de arquitectura (post-auditoría)

| Decisión | Elección | Motivo |
| --- | --- | --- |
| Stack | React 18 + TypeScript + Vite + Tailwind | Pedido explícito si el repo está vacío; 0 €, estático, rápido |
| Motor | `src/features/nutrition-engine/` | La UI no calcula; reglas versionadas y auditables |
| Persistencia MVP | `localStorage` | Guest-first, offline, 0 €, sin backend obligatorio |
| Auth | Cuentas locales (email/contraseña) + adaptador Firebase opcional | Google real exige proyecto Firebase; no se activa de pago |
| Firebase / Firestore | Preparado, no obligatorio | Solo aporta valor si hay sync en la nube; no se activa en MVP |
| Stripe | Modelos y página `/premium`, sin pagos | No implementar cobros hasta validar producto |
| IA | Prohibida | Motor determinista |
| Mapas / geocoding / APIs nutricionales | No | Coste y dependencia innecesaria |
| PWA | `manifest.json` preparado; sin service worker agresivo | Arquitectura lista, no prioridad MVP |
| SEO | Páginas reales + JSON-LD + sitemap/robots | Prioridad alta, sin spam |
| Idioma | Español desde el día 1 | Diferenciación |

## 4. Alcance MVP real (no mock)

**Fase 1 (esta entrega, funcional):**

- Landing → CTA → `/planner` en modo rápido
- Deportes calculables: ciclismo, running, trail (arquitectura para senderismo, triatlón, fútbol y otros)
- Motor: carbohidratos, hidratación, sodio orientativo, pre / durante / post, timeline, lista, coste, “qué tengo en casa”
- Calculadora de tasa de sudoración
- Plan compartible sin datos privados
- Guest-first; registro local para guardar planes
- SEO + blog inicial de calidad
- Legal (privacidad, cookies, términos, disclaimer)
- Tests del motor + build

**Fuera de esta entrega (documentado, no fingido):**

- Pagos Stripe reales
- Enlaces de afiliación reales
- Sync Garmin / Wahoo / Strava
- App nativa
- Coaching humano
- Comparativas “SportFuel vs X” (faltan datos primarios suficientes y actualizados para ser justos)

## 5. Riesgos

1. **Recomendaciones sin evidencia.** Mitigación: cada regla tiene `ruleVersion`, `reviewedAt` y fuentes; si no hay evidencia, no se inventa.
2. **Cifras universales mal aplicadas.** Mitigación: rangos según duración, intensidad, deporte y objetivo; nunca “necesitas exactamente X ml”.
3. **Uso clínico indebido.** Mitigación: disclaimer visible; bloqueo de personalización ante condiciones clínicas declaradas; no se piden datos médicos innecesarios.
4. **Valores absurdos.** Mitigación: validación de inputs y techos del motor + tests de extremos.
5. **Coste mensual.** Mitigación: estático, local, sin APIs de pago. Estimación MVP: **0 €/mes**.
6. **SEO en SPA.** Limitación real: sin prerender/SSR, los crawlers que no ejecutan JS verán menos contenido. Se documenta y se prepara prerender futuro. El contenido existe en páginas reales, no es doorway spam.
7. **Auth Google.** Sin proyecto Firebase del propietario, no se puede completar OAuth real. Se deja adaptador y no se fingen enlaces.

## 6. Competencia (resumen; detalle en COMPETITIVE_ANALYSIS.md)

| Producto | Hueco que SportFuel puede ocupar |
| --- | --- |
| EatMyRide | Fuerte en Garmin/ciclismo; menos web ES sencilla y guest-first |
| Fuelin | Coaching diario de pago; no es un calculador rápido gratuito |
| FlöFuel | Excelente en iOS/Watch y despensa de productos; no es web ES ni multi-deporte |
| Fuel the Goal | Marca/educación; no es un planner web abierto |

Diferenciación prevista: español, modo rápido, comida real vs productos, “qué tengo en casa”, lista de compra, coste por salida, calculadoras SEO y transparencia científica.

## 7. Coste estimado

| Concepto | MVP | Notas |
| --- | --- | --- |
| Hosting estático (Cloudflare Pages / GitHub Pages / Firebase Spark) | 0 € | Si se usa el plan gratuito |
| Dominio | 0–12 €/año | Opcional; no se compra en esta fase |
| IA / APIs nutricionales / mapas | 0 € | No se usan |
| Stripe / afiliación | 0 € | No activados |
| **Total mensual objetivo** | **0 €** | Prioridad absoluta |

## 8. Plan de ejecución inmediato

1. Documentar esta auditoría.
2. Definir arquitectura y motor de reglas.
3. Implementar calculador real (ciclismo / running / trail).
4. Tests del motor, build y QA del flujo de éxito.
5. SEO, legal, cuentas locales, documentación.

No se crearán decenas de páginas vacías antes de que el calculador funcione.
