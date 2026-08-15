# Cómo seguir con la web

Última revisión: 2026-08-15.

Sitio público: https://tranquil-basbousa-7fec55.netlify.app  
Admin: https://app.netlify.com/projects/tranquil-basbousa-7fec55

## Qué ya está hecho

- El drop anónimo está reclamado y el sitio es **público**.
- Rewrite SPA (`/* → /index.html`) para que `/planner` no dé 404.
- `VITE_SITE_URL` apunta a la URL de Netlify.
- Deploy por CLI desde este entorno cuando hay sesión de Netlify.

## Auto-deploy GitHub → Netlify

El API no puede vincular el repo sin la **Netlify GitHub App**. Hasta que la instales, cada push **no** construye solo.

### Opción A — panel Netlify (recomendada)

1. [Link repository](https://app.netlify.com/projects/tranquil-basbousa-7fec55/configuration/deploys) → Import / Link repository.
2. Autoriza la app de GitHub en `raycbn/SportFuel`.
3. Branch de producción: `main` (o `cursor/sportfuel-mvp-4dfc` mientras el PR esté abierto).
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Variable: `VITE_SITE_URL=https://tranquil-basbousa-7fec55.netlify.app`
7. Opcional: `VITE_GSC_VERIFICATION=` (código de Search Console, solo el token).

### Opción B — GitHub Action

El workflow `.github/workflows/deploy-netlify.yml` prueba, construye y publica en cada push a `main` o a `cursor/sportfuel-mvp-4dfc`.

1. Repo → **Settings → Secrets and variables → Actions**.
2. `NETLIFY_AUTH_TOKEN`: token de Netlify (User settings → Applications → New access token).
3. `NETLIFY_SITE_ID`: `506ccb87-455e-4323-964e-b9ed61c6475e`.

Si faltan secretos, el job hace test/build y **omite** el deploy (no falla).

Hay un **build hook** en el panel de Netlify. Sin repo vinculado no puede clonar Git; no lo pongas en el código.

## Search Console

1. Añade la propiedad URL `https://tranquil-basbousa-7fec55.netlify.app`.
2. Elige verificación por meta tag.
3. Copia solo el valor de `content` a `VITE_GSC_VERIFICATION` (local o env de Netlify).
4. Redeploy. Envía `https://tranquil-basbousa-7fec55.netlify.app/sitemap.xml`.

No se puede completar GSC sin tu cuenta de Google.

## Dominio propio

Netlify → Domain management → Add domain. Sigue siendo 0 € si usas `*.netlify.app`.
