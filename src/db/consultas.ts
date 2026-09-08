import { unstable_cache, updateTag } from "next/cache";
import { hayBase, sql } from "./cliente";
import * as esFijo from "@/data/content";
import * as enFijo from "@/data/content.en";
import { UI, type Idioma } from "@/data/idioma";
import type { PaletaGuardada, Tema } from "@/lib/paleta";
import type { Experiencia, Imagen, Proyecto } from "@/data/content";
import { imagenes as imagenesFijas } from "@/data/content";

/**
 * ─────────────────────────────────────────────────────────────
 *  LECTURA DEL CONTENIDO
 *
 *  Devuelve exactamente la misma forma que `contenido(idioma)`
 *  devolvía leyendo de los módulos TypeScript. Ese es el punto: las
 *  páginas no saben si el texto viene de la base o del repositorio.
 *
 *  Dos decisiones que merecen explicación:
 *
 *  1. HAY RESPALDO EN CÓDIGO. Si no existe `DATABASE_URL` —o si la
 *     consulta falla— se sirve el contenido de `content.ts`. Un
 *     portafolio que devuelve 500 porque la base está caída es peor
 *     que uno con el texto de la última versión desplegada. Además
 *     permite levantar el proyecto sin base para trabajar en diseño.
 *
 *  2. SE CACHEA POR ETIQUETA, no por tiempo. El contenido cambia
 *     cuando alguien pulsa «guardar» en el panel, no cada N minutos:
 *     con `revalidate: 60` habría hasta un minuto de espera tras cada
 *     edición y, aun así, una consulta por minuto para siempre. Con
 *     etiquetas, la caché dura indefinidamente y el panel la invalida
 *     en el momento exacto en que deja de ser válida.
 * ─────────────────────────────────────────────────────────────
 */

export const ETIQUETA = "contenido";

/**
 * Sal de despliegue para las claves de caché.
 *
 * `unstable_cache` escribe en `.next/cache`, y ese directorio se
 * RESTAURA entre despliegues para acelerar la compilación. Sin nada que
 * distinga una compilación de la siguiente, el prerender de las páginas
 * estáticas —que son casi todas— reutilizaba la entrada de la anterior
 * en vez de consultar Postgres.
 *
 * El efecto era invisible y desesperante: cambiabas la paleta o un texto
 * en el panel, `updateTag` invalidaba la caché del servidor en marcha y
 * el sitio lo reflejaba… hasta el siguiente despliegue, que volvía a
 * publicar el HTML con los valores del día que se cacheó por primera
 * vez. Parecía que el panel no servía para nada.
 *
 * Con la sal, cada despliegue estrena espacio de caché y lee de la base
 * al menos una vez. Dentro del despliegue no cambia nada: es una
 * constante, así que se sigue cacheando igual y el panel lo sigue
 * invalidando por etiqueta.
 */
const SAL =
  process.env.VERCEL_DEPLOYMENT_ID ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  "local";

/** Lo invoca el panel después de guardar. */
export function invalidarContenido() {
  // `updateTag` y no `revalidateTag`: en Next 16 el segundo caduca la
  // caché con un perfil de tiempo, mientras que el primero está pensado
  // para Server Actions y da semántica de «lee lo que acabas de
  // escribir». Sin eso, el panel guarda y a continuación se muestra a sí
  // mismo el contenido viejo.
  updateTag(ETIQUETA);
}

type Fijo = typeof esFijo;

/** La forma que consumen las páginas. Es la misma que tenían los
 *  módulos de datos, para que cambiar el origen no cambiara el resto. */
export type Contenido = {
  perfil: Fijo["perfil"];
  manifiesto: Fijo["manifiesto"];
  metricas: Fijo["metricas"];
  experiencias: Experiencia[];
  proyectos: Proyecto[];
  competencias: Fijo["competencias"];
  metodologia: Fijo["metodologia"];
  educacion: Fijo["educacion"];
  idiomas: Fijo["idiomas"];
  casoCollieApp: Fijo["casoCollieApp"];
  navegacion: Fijo["navegacion"];
  textos: (typeof UI)["es"];
  /** Las fotos no dependen del idioma: son las mismas en las dos versiones. */
  imagenes: Record<string, Imagen>;
};

/**
 * Funde lo guardado sobre los valores del código, campo por campo.
 *
 * Los textos de interfaz se guardan como un documento entero, así que
 * una versión guardada ANTES de añadir una clave nueva no la tiene — y
 * el componente que la usa revienta con «cannot read properties of
 * undefined». Pasó exactamente eso al añadir los textos del CV.
 *
 * Fundiendo, el código aporta siempre el juego completo de claves y la
 * base sólo pisa las que de verdad se editaron. Desplegar textos nuevos
 * deja de exigir un resembrado inmediato.
 */
function fundir<T>(base: T, guardado: unknown): T {
  if (!guardado || typeof guardado !== "object" || Array.isArray(guardado)) {
    return base;
  }
  const salida = { ...(base as object) } as Record<string, unknown>;
  for (const [k, v] of Object.entries(guardado as Record<string, unknown>)) {
    const previo = salida[k];
    salida[k] =
      previo && typeof previo === "object" && !Array.isArray(previo)
        ? fundir(previo, v)
        : v;
  }
  return salida as T;
}

const respaldo = (idioma: Idioma): Contenido => {
  const c = idioma === "en" ? enFijo : esFijo;
  return {
    perfil: c.perfil,
    manifiesto: c.manifiesto,
    metricas: c.metricas,
    experiencias: c.experiencias,
    proyectos: c.proyectos,
    competencias: c.competencias,
    metodologia: c.metodologia,
    educacion: c.educacion,
    idiomas: c.idiomas,
    casoCollieApp: c.casoCollieApp,
    navegacion: c.navegacion,
    textos: UI[idioma],
    imagenes: imagenesFijas,
  };
};

/**
 * La paleta editada desde el panel.
 *
 * Va aparte de `leerContenido` porque no depende del idioma: es el
 * aspecto del sitio, no su texto. La consume el layout para inyectar las
 * variables CSS.
 */
async function consultarPaleta(): Promise<PaletaGuardada> {
  const filas = await sql<{ tema: Tema; datos: Record<string, string> }>(
    "SELECT tema, datos FROM paleta",
  );
  const salida: PaletaGuardada = {};
  for (const f of filas) salida[f.tema] = f.datos;
  return salida;
}

const paletaCacheada = unstable_cache(consultarPaleta, ["paleta", SAL], {
  tags: [ETIQUETA],
});

export async function leerPaleta(): Promise<PaletaGuardada> {
  if (!hayBase()) return {};
  try {
    return await paletaCacheada();
  } catch (e) {
    console.error("No se pudo leer la paleta:", e);
    return {};
  }
}

async function consultar(idioma: Idioma): Promise<Contenido> {
  const base = respaldo(idioma);

  const [
    perfil,
    manifiesto,
    metricas,
    experiencias,
    proyectos,
    competencias,
    metodologia,
    educacion,
    hablados,
    caso,
    textos,
    subidas,
  ] = await Promise.all([
    sql<{ datos: Fijo["perfil"] }>(`SELECT datos FROM perfil WHERE idioma = $1`, [idioma]),
    sql<Fijo["manifiesto"]>(
      `SELECT kicker, texto, cierre FROM manifiesto WHERE idioma = $1`, [idioma]),
    sql<Fijo["metricas"][number]>(
      `SELECT valor, prefijo, sufijo, titulo, detalle FROM metricas
       WHERE idioma = $1 ORDER BY orden`, [idioma]),
    sql<Experiencia>(
      `SELECT empresa, cargo, periodo, desde, hasta, sector, modalidad, resumen, logros, stack
       FROM experiencias WHERE idioma = $1 ORDER BY orden`, [idioma]),
    sql<Proyecto>(
      `SELECT slug, nombre, tagline, categoria, plataformas, anio, rol,
              problema, solucion, impacto, stack, proceso, destacado
       FROM proyectos WHERE idioma = $1 ORDER BY orden`, [idioma]),
    sql<Fijo["competencias"][number]>(
      `SELECT grupo, icono, claim, detalle, items FROM competencias
       WHERE idioma = $1 ORDER BY orden`, [idioma]),
    sql<Fijo["metodologia"]>(
      `SELECT kicker, titulo, intro, fases FROM metodologia WHERE idioma = $1`, [idioma]),
    sql<Fijo["educacion"][number]>(
      `SELECT titulo, institucion, anio, tipo FROM educacion
       WHERE idioma = $1 ORDER BY orden`, [idioma]),
    sql<{ nombre: string; nivel: string; pct: number }>(
      `SELECT nombre, nivel, pct FROM idiomas_hablados WHERE idioma = $1 ORDER BY orden`, [idioma]),
    sql<{ datos: Fijo["casoCollieApp"] }>(
      `SELECT datos FROM caso_estudio WHERE idioma = $1 AND slug = 'collie-app'`, [idioma]),
    sql<{ datos: (typeof UI)["es"] }>(`SELECT datos FROM textos_ui WHERE idioma = $1`, [idioma]),
    sql<{
      clave: string;
      alt: string;
      pie: string;
      foco: string;
      actualizado_en: Date;
    }>("SELECT clave, alt, pie, foco, actualizado_en FROM imagenes"),
  ]);

  /* Las fotos subidas SUSTITUYEN a las del repositorio, clave por clave.
     La URL lleva la marca de tiempo COMO SEGMENTO —no como `?v=`— para
     que al reemplazar una foto cambie la dirección y el navegador deje
     de servir la anterior. Va en la ruta porque `next/image` rechaza las
     URL locales con query string. */
  const fotos: Record<string, Imagen> = { ...imagenesFijas };
  for (const f of subidas) {
    fotos[f.clave] = {
      src: `/api/imagen/${f.clave}/${f.actualizado_en.getTime()}`,
      alt: f.alt || imagenesFijas[f.clave as keyof typeof imagenesFijas]?.alt || "",
      pie: f.pie,
      foco: f.foco,
    };
  }

  // Tabla vacía → se conserva el respaldo para ESE campo. Así una
  // sección a medio migrar no deja un hueco en la página.
  return {
    perfil: perfil[0]?.datos ?? base.perfil,
    manifiesto: manifiesto[0] ?? base.manifiesto,
    metricas: metricas.length ? metricas : base.metricas,
    experiencias: experiencias.length ? experiencias : base.experiencias,
    proyectos: proyectos.length ? proyectos : base.proyectos,
    competencias: competencias.length ? competencias : base.competencias,
    metodologia: metodologia[0] ?? base.metodologia,
    educacion: educacion.length ? educacion : base.educacion,
    idiomas: hablados.length
      ? hablados.map((h) => ({ idioma: h.nombre, nivel: h.nivel, pct: h.pct }))
      : base.idiomas,
    casoCollieApp: caso[0]?.datos ?? base.casoCollieApp,
    // La navegación no se edita: sus destinos son rutas del código, no datos.
    navegacion: base.navegacion,
    textos: fundir(base.textos, textos[0]?.datos),
    imagenes: fotos,
  };
}

const cacheado = unstable_cache(consultar, ["contenido", SAL], { tags: [ETIQUETA] });

/**
 * El contenido de una página, venga de donde venga.
 *
 * Es `async`, a diferencia del `contenido()` síncrono que sustituye:
 * por eso las páginas lo resuelven en el servidor y bajan los datos ya
 * hechos a las secciones. Un componente cliente no puede esperar a una
 * consulta.
 */
export async function leerContenido(idioma: Idioma): Promise<Contenido> {
  if (!hayBase()) return respaldo(idioma);
  try {
    return await cacheado(idioma);
  } catch (e) {
    console.error("No se pudo leer el contenido de la base:", e);
    return respaldo(idioma);
  }
}
