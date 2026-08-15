# Cómo seguir con la web

Última revisión: 2026-08-15.

Sitio público: https://tranquil-basbousa-7fec55.netlify.app  
Admin: https://app.netlify.com/projects/tranquil-basbousa-7fec55  
Repo: https://github.com/raycbn/SportFuel (`main`)

## Auto-deploy GitHub → Netlify — activo

El sitio está vinculado a `raycbn/SportFuel` con la **Netlify GitHub App** (`installation_id` presente).

- Rama de producción: `main`
- Build: `npm run build`
- Publish: `dist`
- Variable: `VITE_SITE_URL=https://tranquil-basbousa-7fec55.netlify.app`

Un push a `main` publica solo. Primer build con clone OK: commit `5892607`, deploy `6a80203c80229408c1d34804`.

Panel: [Build & deploy](https://app.netlify.com/projects/tranquil-basbousa-7fec55/configuration/deploys)

## Qué más hay hecho

- Sitio **público** (el drop anónimo ya está reclamado).
- Rewrite SPA (`/* → /index.html`) para que `/planner` no dé 404.

## GitHub Action (opcional)

`.github/workflows/deploy-netlify.yml` prueba y construye en cada push. El deploy por CLI **no hace falta** si Netlify ya construye desde Git. Si quieres usarlo igual:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID` = `506ccb87-455e-4323-964e-b9ed61c6475e`

en **Settings → Secrets and variables → Actions**.

## Search Console

1. Propiedad URL `https://tranquil-basbousa-7fec55.netlify.app`
2. Meta tag → valor en `VITE_GSC_VERIFICATION` (env de Netlify)
3. Enviar `/sitemap.xml`

## Dominio propio

Netlify → Domain management → Add domain. Sigue siendo 0 € con `*.netlify.app`.
