# NUTRITION_RULES

`engineVersion`: **1.0.0**  
`reviewedAt`: **2026-08-15**

Todas las reglas viven en código, no en componentes React.

## CHO — `cho-endurance-duration-intensity` v1.0.0

| Duración | Banda | Notas |
| --- | --- | --- |
| <45 min | 0 g/h | Reservas endógenas |
| 45–75 min | 0–30 g/h | Pequeñas cantidades / enjuague opcional |
| 75–150 min | 30–60 g/h | Consenso ACSM/IOC/ISSN |
| 150–180 min | 45–75 g/h | Transición 2,5–3 h |
| >180 min | 60–90 g/h | Techo default 90; 120 solo como nota |

Desplazamientos **dentro** de la banda (no inventan un techo nuevo):

- Intensidad fácil −10 g/h típico; alta +8
- Objetivo completar −6; rendir +6
- Running/trail −5 (tolerancia GI práctica)
- Senderismo −12 (intensidad absoluta suele ser menor)

Techo duro de salida: **0–90 g/h**.

## Hidratación — `hydration-range-not-exact-dose` v1.0.0

Sin tasa medida: bandas por temperatura (aprox. 300–1200 ml/h) × intensidad × ajuste menor de masa (heurístico débil, documentado).

Con tasa medida: 60–100 % de esa tasa, nunca por encima como máximo recomendado. Techo **1500 ml/h**.

## Sodio — `sodium-contextual-not-megadose` v1.0.0

- Sesión <60 min y <25 °C: no se propone suplemento.
- Resto: fluido estimado × 300–700 mg/L (ancla de bebidas / ACSM histórico).
- Techo **1000 mg/h**. No megadosis.

## Pre — `pre-activity-cho-1-4gkg` v1.0.0

Rango práctico 1–2,5 g/kg (dentro de 1–4 g/kg ACSM). Ejemplos: avena, pan, plátano, arroz, yogur. No dietas clínicas.

## Durante — `during-timeline-30min` v1.0.0

Eventos cada 30–40 min, máximo ~9. Traduce g/h y ml/h a acciones.

## Post — `recovery-no-magic-window` v1.0.0

Comida normal; reposición agresiva solo si hay otra sesión pronto. Proteína 20–40 g como bolo práctico. `avoidAbsoluteWindowClaim: true`.

## Sudor

`(peso_antes − peso_después) + líquido_L − orina_L`, dividido por horas. No clínico.

## Barreras

Peso 40–150 kg, duración 15–720 min, temperatura −5–45 °C. Valores negativos o absurdos se rechazan. El motor no emite CHO <0 ni >90, ni hidro >1500 ml/h.
