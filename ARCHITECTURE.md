# ARCHITECTURE — PedalMap Fuel

## Vista general

```
UI (React pages)
    ↓ inputs validados
nutrition-engine (reglas + calculadoras)
    ↓ NutritionPlan
UI de resultado / share / storage local
```

La interfaz **no** contiene gramos por hora ni mililitros hardcodeados. Todo sale de `src/features/nutrition-engine/`.

## Carpetas

| Ruta | Responsabilidad |
| --- | --- |
| `src/features/nutrition-engine/models/` | Contratos: `NutritionPlan`, targets, productos |
| `src/features/nutrition-engine/rules/` | Límites, techos, disclaimer, versión |
| `src/features/nutrition-engine/calculators/` | CHO, hidro, sodio, pre/durante/post, despensa, coste, sudor |
| `src/features/nutrition-engine/evidence/` | Catálogo de fuentes |
| `src/features/nutrition-engine/data/` | Productos de ejemplo y `AffiliateOffer` desactivadas |
| `src/pages/` | Rutas públicas |
| `src/lib/auth.ts` | Cuentas email/contraseña locales |
| `src/lib/firebase.ts` | Lectura de config; SDK no incluido |
| `src/lib/analytics.ts` | Eventos de producto en `localStorage` |

## Datos

Modelo previsto si un día se activa Firestore (no obligatorio):

`users`, `plans`, `savedPlans`, `favorites`, `products`, `sources`, `subscriptions`

En MVP: equivalentes en `localStorage`, minimizando campos. No se guarda información sanitaria. El plan compartido solo serializa deporte, duración, estrategia y rangos públicos.

## Auth

1. Guest calcula y comparte.
2. Email/contraseña local (hash SHA-256 en el dispositivo) para `/plans`.
3. Google requiere Firebase; el botón no finge un OAuth.

## Offline y PWA

Tras la primera carga, el planner y el motor funcionan sin red (salvo fuentes externas de tipografía). `manifest.json` está listo; el service worker se deja para una fase posterior.

## Exportación futura

El `NutritionPlan` es serializable. PDF, imagen, calendario y notas pueden consumirlo sin recalcular en la UI.

## Coste

Sin servidores, sin APIs de IA, sin mapas, sin bases nutricionales de pago. Hosting estático gratuito.
