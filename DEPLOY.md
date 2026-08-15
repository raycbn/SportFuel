# Cómo seguir con la web (después de reclamar Netlify)

Última revisión: 2026-08-15. Si `/planner` da 404, falta un deploy nuevo tras reclamar el sitio.

## 1. Haz el sitio público (ahora mismo da 401)

Al reclamar un drop, Netlify suele dejar el proyecto **privado / solo equipo**. Por eso el mundo ve “Login Redirect”.

En [app.netlify.com](https://app.netlify.com):

1. Abre el sitio `tranquil-basbousa-7fec55`.
2. **Project configuration → Access & security / Project visibility**.
3. Pon visibilidad **Public** (o desactiva “Team login” / password).
4. Recarga https://tranquil-basbousa-7fec55.netlify.app — debe cargar SportFuel sin login.

## 2. Conecta GitHub para que cada push se publique

Opción A — panel Netlify (la más simple):

1. **Project configuration → Build & deploy → Import repository** (o *Link repository*).
2. Repo: `raycbn/SportFuel`.
3. Branch: `main` cuando merges el PR, o `cursor/sportfuel-mvp-4dfc` mientras tanto.
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Variable: `VITE_SITE_URL=https://tranquil-basbousa-7fec55.netlify.app`

Opción B — GitHub Action (ya está el workflow):

1. En el repo: **Settings → Secrets and variables → Actions**.
2. Crea `NETLIFY_AUTH_TOKEN` (User settings de Netlify → Applications → New access token).
3. Crea `NETLIFY_SITE_ID` = `506ccb87-455e-4323-964e-b9ed61c6475e`.
4. El workflow `.github/workflows/deploy-netlify.yml` publica en cada push.

## 3. Qué estamos construyendo ahora

- Fase 2: senderismo y triatlón más útiles, tasa de sudoración que entra en el planner, planes guardados (ya locales).
- Aún no: Stripe, afiliación real, Garmin, app nativa.

## 4. Dominio propio (cuando quieras)

Netlify → Domain management → Add domain. Sigue siendo 0 € si usas el `*.netlify.app`.
