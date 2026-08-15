# Cómo seguir con la web

Última revisión: 2026-08-15.

Sitio público: https://tranquil-basbousa-7fec55.netlify.app  
Admin: https://app.netlify.com/projects/tranquil-basbousa-7fec55  
Repo: https://github.com/raycbn/SportFuel (`main`)

## Qué ya está hecho

- Drop reclamado y sitio **público**.
- Rewrite SPA (`/* → /index.html`).
- `VITE_SITE_URL` en Netlify.
- El proyecto Netlify **ya está vinculado** a `raycbn/SportFuel`:
  - rama de producción: `main`
  - build: `npm run build`
  - publish: `dist`
- Falta que GitHub acepte la clave SSH de Netlify. Sin eso el clone falla (`Permission denied (publickey)`). La web en producción sigue siendo el último deploy por CLI, que sí funciona.

## Autorizar el clone (hace falta tu cuenta de GitHub)

Este agente no puede crear deploy keys ni webhooks en GitHub (el token de Cursor no tiene admin del repo).

### Opción A — app de Netlify (recomendada)

1. https://github.com/apps/netlify/installations/new
2. Cuenta `raycbn`, acceso a `SportFuel`.
3. Si Netlify pide reautorizar: [Build & deploy](https://app.netlify.com/projects/tranquil-basbousa-7fec55/configuration/deploys).

### Opción B — deploy key + webhook

1. [Deploy keys](https://github.com/raycbn/SportFuel/settings/keys) → Add deploy key  
   Título: `Netlify`  
   Allow write access: **no**  
   Clave:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDa2r3XWDcMgCcewLf501bztLHQCznsLE+a6kvZRoTptaz+JN7g2s6ByKzL6BqqqqT2BQ6250F+zY/1PMvEvqQ//5xKJKAfTQOOz0dJL71bXElkT6aLxFpZ+60iB1sKrL4caKh+T+Gf5mH/XFOf60l6g2gjf4Wrz4A3dwsZ3xLbBY127A8g6lsJgO+WP9DQepQMphSvz6NcNllaV3XQM/Wn/AJxupS09CKNKqDpxxPtGxRxVDyBZk1G+Jlvwqti9IJLU9LOfhY7+DD9cFu/9Nsp5IvapLdVNt3N/JOKkpwagRQUwW6iXiUelzrg+F3kQGO+V5HlrZYBY+jEMx9MJgt/BpqiycX2TdhNc88c1WJOE6WaoBPOvXXARdY7n3vXShdAnG9VIHj2FVx1ExCLIcHAuKBYaMkntNbvuY7euTjvu7/lBI0WxZ3/UO+ueSEDfbO1Us00hjuOqwUBSlRj2XpQCgvnnphxEFqW+cykHDkulbT95c2ZkN2ZxHb1FyQEG/zqYGa4fddWRCzybT7Vdx59q34MT+iEPVI62U1QP5c/6gpL1CtBdvoIME+DSnZidhudkoUi4zfYYFTPhv2cG3+P/aEO+T8W/UQYVubeOQLriygCVhzZ2XKoEWGAG3LTYgZrHftbHL+GnWjZG0k7FfSW5U3UXLjt3B6mHphMyQ8rkQ==
```

2. [Webhooks](https://github.com/raycbn/SportFuel/settings/hooks) → Add webhook  
   Payload URL: `https://api.netlify.com/hooks/github`  
   Content type: `application/json`  
   Eventos: `push`, `pull_request`, `delete`

Cuando la clave esté en GitHub, un push a `main` (o un *Trigger deploy* en Netlify) publica solo.

## GitHub Action (alternativa)

`.github/workflows/deploy-netlify.yml` ya está activo. Para que publique hace falta:

- `NETLIFY_AUTH_TOKEN` (token de Netlify)
- `NETLIFY_SITE_ID` = `506ccb87-455e-4323-964e-b9ed61c6475e`

en **Settings → Secrets and variables → Actions**. Con la opción A/B de arriba no hace falta.

## Search Console

1. Propiedad URL `https://tranquil-basbousa-7fec55.netlify.app`
2. Meta tag → valor en `VITE_GSC_VERIFICATION` (env de Netlify)
3. Enviar `/sitemap.xml`

## Dominio propio

Netlify → Domain management → Add domain. Sigue siendo 0 € con `*.netlify.app`.
