# SEO

Idioma: **es-ES**. Intención: “qué como / bebo / llevo” antes de una salida.

Sitio canónico actual: `https://fuel.pedalmap.es`

## Páginas de esta entrega

### Producto
`/`, `/planner`, `/calculators`, `/calculators/sweat-rate`, `/sports/*`, `/premium`

### Calculadoras / long-tail
- `/calculadora-carbohidratos-deporte`
- `/calculadora-hidratacion-deporte`
- `/calculadora-tasa-sudoracion`
- `/nutricion-ciclismo`, `/nutricion-running`, `/nutricion-trail`
- `/nutricion-senderismo`, `/nutricion-triatlon`, `/nutricion-futbol`
- `/hidratacion-ciclismo`, `/carbohidratos-ciclismo`
- `/que-llevar-salida-3-horas`
- `/que-comer-antes-de-correr`, `/que-comer-antes-de-montar-en-bici`

### Blog (12 artículos con fuentes)
Listados en `/blog`. Estructura: problema → explicación → CTA al calculador → FAQ visible → fuentes.

## On-page

Cada página de contenido tiene `title`, `meta description`, `canonical`, Open Graph, breadcrumbs JSON-LD. `FAQPage` solo si las FAQ se renderizan. `WebApplication` en home. `Article` en blog.

Si existe `VITE_GSC_VERIFICATION`, se emite `<meta name="google-site-verification">`.

## Técnico

- `public/sitemap.xml` y `public/robots.txt`
- Limitación SPA: sin prerender, algunos crawlers verán menos HTML. Fase siguiente: prerender de landings.
- Search Console: el dueño añade la propiedad y pega el código en env. No se inventa verificación.

## Lo que no se hace

Keyword stuffing, doorway pages automáticas, cientos de artículos vacíos, comparativas agresivas.
