# SECURITY

## Principios

- No secretos en el repo. `.env.example` vacío.
- Validación de inputs en el motor (no solo en la UI).
- No se confía en el frontend para “seguridad clínica”: si hay flag clínico, no hay plan personalizado.
- Minimización RGPD: no se piden datos médicos innecesarios.

## Auth local

Contraseñas con SHA-256 en el dispositivo. **No es un backend seguro**: cualquiera con acceso al navegador puede leer `localStorage`. Se documenta como limitación. Firebase Auth + reglas Firestore se usarán si hay sync real.

## Firestore (futuro)

Reglas previstas: el usuario solo lee/escribe sus `plans` y `favorites`. Productos y sources de solo lectura. Sin datos clínicos.

## Rate limits

Sin API propia en MVP. Si se añade un endpoint, limitar `plan_created` / auth.

## XSS / share

El payload compartido se decodifica con try/catch y no se inyecta HTML. No incluye peso ni email.

## Dependencias

Sin SDKs de IA. Firebase SDK no se instala hasta que aporte valor.
