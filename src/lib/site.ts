/**
 * URL pública del sitio.
 *
 * En local y en preview no hay dominio propio, así que se toma de la variable
 * de entorno y sólo cae al dominio de producción como último recurso.
 * Configúrala en Vercel como NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://gustavomarquez.dev")
).replace(/\/$/, "");

/** Rutas del sitio, en el orden en que deben indexarse. Las dos versiones
 *  de idioma se indexan por separado: cada una tiene su URL y su hreflang
 *  (ver el campo alternates en cada página). */
export const RUTAS = [
  { path: "/", priority: 1 },
  { path: "/proyectos", priority: 0.9 },
  { path: "/proyectos/collie-app", priority: 0.85 },
  { path: "/sobre-mi", priority: 0.8 },
  { path: "/contacto", priority: 0.7 },
  { path: "/en", priority: 0.9 },
  { path: "/en/work", priority: 0.8 },
  { path: "/en/work/collie-app", priority: 0.75 },
  { path: "/en/about", priority: 0.7 },
  { path: "/en/contact", priority: 0.6 },
] as const;
