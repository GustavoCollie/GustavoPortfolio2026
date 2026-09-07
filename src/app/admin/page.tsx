import { haySesion } from "./acciones";
import Acceso from "./Acceso";
import PanelAdmin, { type DatosPanel, type Mensaje } from "./PanelAdmin";
import { leerContenido } from "@/db/consultas";
import { hayBase, sql } from "@/db/cliente";
import type { Idioma } from "@/data/idioma";
import type { PaletaGuardada, Tema } from "@/lib/paleta";
import { claveCaptura } from "@/lib/capturas";
import { esFront } from "@/lib/superficie";
import { notFound } from "next/navigation";

/** Nunca cachear: el panel tiene que mostrar la base tal y como está. */
export const dynamic = "force-dynamic";

/**
 * El idioma viaja en la URL (`/admin?idioma=en`) y no en el estado del
 * panel.
 *
 * La alternativa era cargar los dos idiomas y guardarlos en memoria, pero
 * eso significa mantener dos copias vivas del contenido y una forma más de
 * que se desincronicen — justo el problema que ya costó un fallo cuando el
 * panel leía del código en vez de la base. Con el idioma en la URL, cada
 * versión se carga fresca de Postgres y sólo existe una a la vez.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ idioma?: string }>;
}) {
  /* La misma guarda que el layout, y no es redundante: Next renderiza
     layout y página a la vez, así que sin esto la página seguía
     consultando Postgres —y registrando un «permission denied» con el rol
     de sólo lectura— antes de que el 404 del layout ganara la carrera. La
     respuesta era correcta; el trabajo, no. */
  if (esFront) notFound();

  if (!(await haySesion())) return <Acceso />;

  const { idioma: pedido } = await searchParams;
  const idioma: Idioma = pedido === "en" ? "en" : "es";

  /* El panel arranca con lo que hay EN LA BASE, no con el contenido del
     repositorio. Cargando del código, cualquier guardado sobrescribía en
     la base todo lo editado antes: el panel se pisaba a sí mismo. */
  const c = await leerContenido(idioma);

  // La paleta no pasa por `leerContenido` (no es contenido de página) y no
  // depende del idioma.
  const filas = hayBase()
    ? await sql<{ tema: Tema; datos: Record<string, string> }>(
        "SELECT tema, datos FROM paleta",
      )
    : [];
  const paleta: PaletaGuardada = {};
  for (const f of filas) paleta[f.tema] = f.datos;

  const inicial: DatosPanel = {
    paleta,
    perfil: {
      nombreCorto: c.perfil.nombreCorto,
      rol: c.perfil.rol,
      subtitular: c.perfil.subtitular,
      disponibilidad: c.perfil.disponibilidad,
      ubicacion: c.perfil.ubicacion,
      email: c.perfil.email,
      telefono: c.perfil.telefono,
      linkedin: c.perfil.linkedin,
    },
    manifiesto: {
      kicker: c.manifiesto.kicker,
      texto: c.manifiesto.texto,
      cierre: c.manifiesto.cierre,
    },
    metricas: c.metricas.map((m) => ({ ...m })),
    experiencias: c.experiencias.map((e) => ({ ...e })),
    proyectos: c.proyectos.map((p) => ({ ...p })),
    competencias: c.competencias.map((k) => ({ ...k })),
    metodologia: {
      kicker: c.metodologia.kicker,
      titulo: c.metodologia.titulo,
      intro: c.metodologia.intro,
      fases: c.metodologia.fases.map((f) => ({ ...f })),
    },
    educacion: c.educacion.map((e) => ({ ...e })),
    idiomas: c.idiomas.map((l) => ({ ...l })),
    caso: { ...c.casoCollieApp },
    textos: { ...c.textos },
  };

  /* Qué fotos se pueden reemplazar. La lista sale del contenido, no de
     la base: la base sólo guarda las SUSTITUCIONES, así que preguntándole
     a ella no aparecerían las que aún vienen del repositorio. */
  const subidas = hayBase()
    ? await sql<{ clave: string }>("SELECT clave FROM imagenes")
    : [];
  const claves = new Set(subidas.map((f) => f.clave));

  const ETIQUETAS: Record<string, string> = {
    retrato: "Retrato — Sobre mí y CV",
    operacion: "Operación — foto de apoyo",
  };

  const ficha = (clave: string, etiqueta: string) => {
    const img = c.imagenes[clave];
    return {
      clave,
      etiqueta,
      // Sin subir y sin archivo en el repositorio: se muestra un hueco.
      src: img?.src ?? "",
      alt: img?.alt ?? "",
      pie: img?.pie ?? "",
      foco: img?.foco ?? "50% 50%",
      subida: claves.has(clave),
    };
  };

  /* Dos huecos por proyecto —escritorio y móvil— derivados del slug, para
     que añadir un proyecto añada sus imágenes sin registrar nada a mano.
     La maqueta los compone: la web de base y el móvil encima a un lado. */
  const imagenes = [
    ...Object.keys(c.imagenes)
      .filter((k) => !k.startsWith("p-"))
      .map((k) => ficha(k, ETIQUETAS[k] ?? k)),
    ...c.proyectos.flatMap((p) => [
      ficha(claveCaptura(p.slug, "web"), `${p.nombre} — escritorio`),
      ficha(claveCaptura(p.slug, "movil"), `${p.nombre} — móvil`),
    ]),
  ];

  /* Lo que ha llegado por el formulario de contacto. El límite es alto
     pero existe: un formulario público es un formulario que alguien
     acabará llenando con un script, y sin tope la página cargaría hasta
     el último intento. */
  const filasMensajes = hayBase()
    ? await sql<Omit<Mensaje, "recibido_en"> & { recibido_en: Date }>(
        `SELECT id, recibido_en, nombre, email, empresa, interes, mensaje
           FROM mensajes ORDER BY recibido_en DESC LIMIT 200`,
      )
    : [];

  /* `pg` devuelve un Date; el componente es de cliente y necesita algo que
     valga tal cual en el atributo `datetime`. La conversión se hace aquí
     y no en la consulta para que sea evidente al leer el componente por
     qué el campo es una cadena. */
  const mensajes: Mensaje[] = filasMensajes.map((m) => ({
    ...m,
    recibido_en: m.recibido_en.toISOString(),
  }));

  return (
    <PanelAdmin
      inicial={inicial}
      idioma={idioma}
      imagenes={imagenes}
      mensajes={mensajes}
      escritura={hayBase()}
    />
  );
}
