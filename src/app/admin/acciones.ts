"use server";

import { CLAVES, type Tema } from "@/lib/paleta";
import type { EstadoAdmin, EstadoSesion } from "./tipos";

/** Lo que manda el panel. Se valida al escribir, no aquí: el tipo sólo
 *  documenta la forma esperada. */
type Payload = {
  idioma?: string;
  perfil?: Record<string, string>;
  manifiesto?: { kicker: string; texto: string; cierre: string };
  metricas?: { valor: number; prefijo?: string; sufijo?: string; titulo: string; detalle: string }[];
  experiencias?: {
    empresa: string; cargo: string; periodo: string; desde: string; hasta: string;
    sector: string; modalidad?: string; resumen: string; logros?: string[]; stack?: string[];
  }[];
  proyectos?: {
    slug?: string; nombre: string; tagline: string; categoria: string; plataformas?: string[];
    anio: string; rol: string; problema: string; solucion: string;
    impacto?: string[]; stack?: string[]; proceso?: string[]; destacado?: boolean;
  }[];
  competencias?: {
    grupo: string; icono?: string; claim: string; detalle: string; items?: string[];
  }[];
  metodologia?: {
    kicker: string; titulo: string; intro: string; fases?: unknown[];
  };
  educacion?: { titulo: string; institucion: string; anio: string; tipo: string }[];
  idiomas?: { idioma: string; nivel: string; pct: number }[];
  caso?: Record<string, unknown>;
  textos?: Record<string, unknown>;
  paleta?: unknown;
};
import { pool, sql } from "@/db/cliente";
import { invalidarContenido } from "@/db/consultas";
import type { Idioma } from "@/data/idioma";
import {
  abrirSesion,
  claveValida,
  cerrarSesion as cerrarSesionDb,
  haySesion as haySesionDb,
} from "@/db/sesion";

export async function iniciarSesion(
  _previo: EstadoSesion,
  datos: FormData,
): Promise<EstadoSesion> {
  const enviada = String(datos.get("clave") ?? "");

  // El mensaje no distingue entre «no hay contraseña puesta» y «la
  // contraseña es otra»: contarlo sólo ayudaría a quien no debería estar
  // probando. El detalle va al registro del servidor.
  let ok = false;
  try {
    ok = await claveValida(enviada);
  } catch (e) {
    console.error("No se pudo comprobar la contraseña del panel:", e);
    return {
      estado: "error",
      mensaje: "No hay conexión con la base de datos. Revisa DATABASE_URL.",
    };
  }

  if (!ok) return { estado: "error", mensaje: "Clave incorrecta." };

  if (!(await abrirSesion())) {
    return {
      estado: "error",
      mensaje:
        "Falta ADMIN_SECRET en el entorno (32 caracteres o más). Sin él no se pueden firmar sesiones.",
    };
  }
  return { estado: "ok", mensaje: "" };
}

export async function cerrarSesion() {
  await cerrarSesionDb();
}

export async function haySesion() {
  return haySesionDb();
}

/** Sólo acepta claves conocidas y colores hexadecimales. */
function limpiarPaleta(entrada: unknown) {
  const HEX = /^#[0-9a-fA-F]{6}$/;
  const salida: Partial<Record<Tema, Record<string, string>>> = {};
  const raiz = (entrada ?? {}) as Record<string, unknown>;

  for (const tema of ["dark", "light"] as Tema[]) {
    const bloque = (raiz[tema] ?? {}) as Record<string, unknown>;
    const limpio: Record<string, string> = {};
    for (const [clave, valor] of Object.entries(bloque)) {
      if (CLAVES.includes(clave) && typeof valor === "string" && HEX.test(valor)) {
        limpio[clave] = valor.toLowerCase();
      }
    }
    if (Object.keys(limpio).length > 0) salida[tema] = limpio;
  }
  return salida;
}

/**
 * Guarda los cambios del panel en la base de datos.
 *
 * El archivo se versiona con el repositorio: el panel edita el contenido
 * de forma visual, y el despliegue sigue siendo el mismo `git push`. Por eso
 * en producción no escribe: allí el panel funciona como vista previa y
 * exportación.
 */
export async function guardarCambios(
  _previo: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  if (!(await haySesion())) {
    return { estado: "error", mensaje: "Sesión expirada. Vuelve a entrar." };
  }

  let entrada: Payload;
  try {
    entrada = JSON.parse(String(datos.get("payload") ?? "{}"));
  } catch {
    return { estado: "error", mensaje: "Los datos enviados no son JSON válido." };
  }

  const idioma: Idioma = entrada.idioma === "en" ? "en" : "es";

  try {
    await escribir(idioma, entrada);
    // Sin esto el panel guarda y a continuación se muestra el contenido
    // viejo, porque las páginas leen de una caché por etiqueta.
    invalidarContenido();
    return {
      estado: "ok",
      mensaje: `Guardado en la base (${idioma === "es" ? "español" : "inglés"}). El sitio ya lo refleja.`,
    };
  } catch (e) {
    console.error("No se pudo guardar en la base:", e);
    return {
      estado: "error",
      mensaje: "No se pudo escribir en la base de datos. Revisa DATABASE_URL.",
    };
  }
}

/**
 * Escritura en una transacción.
 *
 * Todo o nada: si falla el tercer proyecto, no queda medio contenido
 * guardado. El panel manda el estado COMPLETO de cada sección, así que
 * las listas se borran y se reinsertan en vez de intentar casar filas —
 * es lo que permite además reordenar y eliminar elementos.
 */
async function escribir(idioma: Idioma, e: Payload) {
  const c = await pool().connect();
  try {
    await c.query("BEGIN");

    // Se comprueba que haya CONTENIDO, no sólo que el campo exista: un
    // objeto vacío es verdadero y pasaría de largo.
    if (e.perfil && Object.keys(e.perfil).length > 0) {
      /* `||` FUSIONA el objeto JSONB en vez de reemplazarlo.
         El formulario del panel sólo edita ocho campos del perfil, pero el
         objeto tiene más (`telefonoRaw`, `linkedinLabel`, `nombre`,
         `apellidos`). Escribiéndolo entero, guardar desde el panel
         BORRABA los que no aparecen en el formulario — y la página de
         contacto, que usa `telefonoRaw` para el enlace de WhatsApp,
         dejaba de renderizar con un 500. */
      await c.query(
        `INSERT INTO perfil (idioma, datos) VALUES ($1, $2)
         ON CONFLICT (idioma) DO UPDATE SET
           datos = perfil.datos || $2::jsonb, actualizado_en = now()`,
        [idioma, JSON.stringify(e.perfil)],
      );
    }

    if (e.manifiesto?.kicker && e.manifiesto.texto && e.manifiesto.cierre) {
      await c.query(
        `INSERT INTO manifiesto (idioma, kicker, texto, cierre) VALUES ($1,$2,$3,$4)
         ON CONFLICT (idioma) DO UPDATE SET kicker=$2, texto=$3, cierre=$4, actualizado_en = now()`,
        [idioma, e.manifiesto.kicker, e.manifiesto.texto, e.manifiesto.cierre],
      );
    }

    if (Array.isArray(e.metricas) && e.metricas.length > 0) {
      await c.query("DELETE FROM metricas WHERE idioma = $1", [idioma]);
      for (const [i, m] of e.metricas.entries()) {
        await c.query(
          `INSERT INTO metricas (idioma, clave, orden, valor, prefijo, sufijo, titulo, detalle)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [idioma, clave(m.titulo, i), i, m.valor, m.prefijo ?? "", m.sufijo ?? "", m.titulo, m.detalle],
        );
      }
    }

    if (Array.isArray(e.experiencias) && e.experiencias.length > 0) {
      await c.query("DELETE FROM experiencias WHERE idioma = $1", [idioma]);
      for (const [i, x] of e.experiencias.entries()) {
        await c.query(
          `INSERT INTO experiencias
             (idioma, clave, orden, empresa, cargo, periodo, desde, hasta, sector, modalidad, resumen, logros, stack)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [idioma, clave(`${x.empresa}-${x.desde}`, i), i, x.empresa, x.cargo, x.periodo,
           x.desde, x.hasta, x.sector, x.modalidad ?? null, x.resumen, x.logros ?? [], x.stack ?? []],
        );
      }
    }

    if (Array.isArray(e.proyectos) && e.proyectos.length > 0) {
      await c.query("DELETE FROM proyectos WHERE idioma = $1", [idioma]);
      for (const [i, p] of e.proyectos.entries()) {
        await c.query(
          `INSERT INTO proyectos
             (idioma, slug, orden, nombre, tagline, categoria, plataformas, anio, rol,
              problema, solucion, impacto, stack, proceso, destacado)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [idioma, p.slug || clave(p.nombre, i), i, p.nombre, p.tagline, p.categoria,
           p.plataformas ?? [], p.anio, p.rol, p.problema, p.solucion,
           p.impacto ?? [], p.stack ?? [], p.proceso ?? [], Boolean(p.destacado)],
        );
      }
    }

    if (Array.isArray(e.competencias) && e.competencias.length > 0) {
      await c.query("DELETE FROM competencias WHERE idioma = $1", [idioma]);
      for (const [i, k] of e.competencias.entries()) {
        await c.query(
          `INSERT INTO competencias (idioma, clave, orden, grupo, icono, claim, detalle, items)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [idioma, clave(k.grupo, i), i, k.grupo, k.icono ?? "negocio", k.claim, k.detalle, k.items ?? []],
        );
      }
    }

    if (e.metodologia?.titulo) {
      await c.query(
        `INSERT INTO metodologia (idioma, kicker, titulo, intro, fases) VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (idioma) DO UPDATE SET kicker=$2, titulo=$3, intro=$4, fases=$5`,
        [
          idioma,
          e.metodologia.kicker ?? "",
          e.metodologia.titulo,
          e.metodologia.intro ?? "",
          JSON.stringify(e.metodologia.fases ?? []),
        ],
      );
    }

    if (Array.isArray(e.educacion) && e.educacion.length > 0) {
      await c.query("DELETE FROM educacion WHERE idioma = $1", [idioma]);
      for (const [i, x] of e.educacion.entries()) {
        await c.query(
          `INSERT INTO educacion (idioma, clave, orden, titulo, institucion, anio, tipo)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [idioma, clave(x.titulo, i), i, x.titulo, x.institucion, x.anio, x.tipo],
        );
      }
    }

    if (Array.isArray(e.idiomas) && e.idiomas.length > 0) {
      await c.query("DELETE FROM idiomas_hablados WHERE idioma = $1", [idioma]);
      for (const [i, l] of e.idiomas.entries()) {
        await c.query(
          `INSERT INTO idiomas_hablados (idioma, clave, orden, nombre, nivel, pct)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [idioma, clave(l.idioma, i), i, l.idioma, l.nivel, Math.min(100, Math.max(0, l.pct || 0))],
        );
      }
    }

    // Documentos JSONB: se reemplazan enteros, que es como se editan.
    if (e.caso && Object.keys(e.caso).length > 0) {
      await c.query(
        `INSERT INTO caso_estudio (idioma, slug, datos) VALUES ($1,$2,$3)
         ON CONFLICT (idioma, slug) DO UPDATE SET datos=$3, actualizado_en = now()`,
        [idioma, String(e.caso.slug ?? "collie-app"), JSON.stringify(e.caso)],
      );
    }

    if (e.textos && Object.keys(e.textos).length > 0) {
      await c.query(
        `INSERT INTO textos_ui (idioma, datos) VALUES ($1,$2)
         ON CONFLICT (idioma) DO UPDATE SET datos=$2, actualizado_en = now()`,
        [idioma, JSON.stringify(e.textos)],
      );
    }

    // La paleta no depende del idioma: es el aspecto del sitio.
    if (e.paleta) {
      const limpia = limpiarPaleta(e.paleta);
      for (const tema of ["light", "dark"] as Tema[]) {
        if (!limpia[tema]) continue;
        await c.query(
          `INSERT INTO paleta (tema, datos) VALUES ($1,$2)
           ON CONFLICT (tema) DO UPDATE SET datos = $2, actualizado_en = now()`,
          [tema, JSON.stringify(limpia[tema])],
        );
      }
    }

    await c.query("COMMIT");
  } catch (err) {
    await c.query("ROLLBACK");
    throw err;
  } finally {
    c.release();
  }
}

/** Clave estable por elemento. El índice al final evita choques si dos
 *  entradas tienen el mismo título. */
function clave(s: string, i: number) {
  const base = String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `${base || "item"}-${i}`;
}

/** Tipos de imagen aceptados y tamaño máximo. */
const MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Sube o reemplaza una foto.
 *
 * Va en su propia acción y no en `guardarCambios` porque un archivo no
 * cabe en el JSON del panel: viaja como `multipart/form-data`, que es lo
 * que las acciones de servidor ya saben recibir.
 *
 * Se valida el tipo en el SERVIDOR y no sólo con el `accept` del input:
 * `accept` es una sugerencia al selector de archivos, no una barrera —
 * cualquiera puede mandar otra cosa por su cuenta.
 */
export async function subirImagen(
  _previo: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  if (!(await haySesion())) {
    return { estado: "error", mensaje: "Sesión expirada. Vuelve a entrar." };
  }

  const clave = String(datos.get("clave") ?? "").trim();
  if (!/^[a-z0-9-]{1,40}$/.test(clave)) {
    return { estado: "error", mensaje: "Clave de imagen no válida." };
  }

  const archivo = datos.get("archivo");
  const alt = String(datos.get("alt") ?? "");
  const pie = String(datos.get("pie") ?? "");
  const foco = String(datos.get("foco") ?? "50% 50%");

  try {
    // Sin archivo nuevo: sólo se actualizan los textos de la foto que ya
    // estaba. Cambiar un pie de foto no debería obligar a resubirla.
    if (!(archivo instanceof File) || archivo.size === 0) {
      const filas = await sql<{ clave: string }>(
        "UPDATE imagenes SET alt=$2, pie=$3, foco=$4, actualizado_en=now() WHERE clave=$1 RETURNING clave",
        [clave, alt, pie, foco],
      );
      if (filas.length === 0) {
        return {
          estado: "error",
          mensaje: "No hay ninguna imagen subida con esa clave. Elige un archivo.",
        };
      }
      invalidarContenido();
      return { estado: "ok", mensaje: "Datos de la imagen actualizados." };
    }

    if (!MIMES.includes(archivo.type)) {
      return {
        estado: "error",
        mensaje: `Formato no admitido (${archivo.type || "desconocido"}). Usa JPG, PNG, WebP o AVIF.`,
      };
    }
    if (archivo.size > MAX_BYTES) {
      return {
        estado: "error",
        mensaje: `La imagen pesa ${(archivo.size / 1024 / 1024).toFixed(1)} MB y el máximo son 4 MB.`,
      };
    }

    const bytes = Buffer.from(await archivo.arrayBuffer());
    await sql(
      `INSERT INTO imagenes (clave, mime, bytes, alt, pie, foco)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (clave) DO UPDATE SET
         mime=$2, bytes=$3, alt=$4, pie=$5, foco=$6, actualizado_en=now()`,
      [clave, archivo.type, bytes, alt, pie, foco],
    );

    invalidarContenido();
    return {
      estado: "ok",
      mensaje: `Imagen reemplazada (${(archivo.size / 1024).toFixed(0)} KB). El sitio ya la usa.`,
    };
  } catch (e) {
    console.error("No se pudo guardar la imagen:", e);
    return { estado: "error", mensaje: "No se pudo guardar la imagen." };
  }
}

/** Vuelve a la foto del repositorio: borra la subida. */
export async function borrarImagen(
  _previo: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  if (!(await haySesion())) {
    return { estado: "error", mensaje: "Sesión expirada. Vuelve a entrar." };
  }
  const clave = String(datos.get("clave") ?? "").trim();
  try {
    await sql("DELETE FROM imagenes WHERE clave = $1", [clave]);
    invalidarContenido();
    return { estado: "ok", mensaje: "Restaurada la imagen del repositorio." };
  } catch (e) {
    console.error("No se pudo borrar la imagen:", e);
    return { estado: "error", mensaje: "No se pudo borrar la imagen." };
  }
}
