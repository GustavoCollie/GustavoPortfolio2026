/**
 * ─────────────────────────────────────────────────────────────
 *  IDIOMA
 *
 *  Dos piezas:
 *
 *  1. `contenido(idioma)` elige entre `content.ts` y `content.en.ts`.
 *     Los dos módulos tienen la MISMA forma, así que los componentes
 *     no saben en qué idioma están: piden `c.perfil.rol` y ya.
 *
 *  2. `UI` es el microcopy que vive en los componentes y no en los
 *     datos — títulos de sección, etiquetas de campo, textos de
 *     botón. Antes estaba escrito en duro dentro del JSX, que es lo
 *     que hacía imposible traducir el sitio sin tocar cada archivo.
 *
 *  El español no lleva prefijo de ruta (`/proyectos`) y el inglés sí
 *  (`/en/work`). Es deliberado: el público principal es
 *  hispanohablante y su versión debe tener las URL limpias. `RUTAS`
 *  empareja las dos para que el conmutador te deje en la MISMA
 *  página del otro idioma y no en la portada.
 * ─────────────────────────────────────────────────────────────
 */

import * as es from "./content";
import * as en from "./content.en";

export type Idioma = "es" | "en";

export function contenido(idioma: Idioma) {
  return idioma === "en" ? en : es;
}

/** Pares de rutas equivalentes, en orden de especificidad descendente. */
export const RUTAS: { es: string; en: string }[] = [
  { es: "/proyectos/collie-app", en: "/en/work/collie-app" },
  { es: "/proyectos", en: "/en/work" },
  { es: "/sobre-mi", en: "/en/about" },
  { es: "/contacto", en: "/en/contact" },
  { es: "/cv", en: "/en/cv" },
  { es: "/", en: "/en" },
];

export function idiomaDeRuta(pathname: string): Idioma {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "es";
}

/**
 * La misma página en el otro idioma.
 *
 * Se busca por el par más específico primero: si se comparase con `/`
 * al principio, cualquier ruta empezaría por ahí y todo el mundo
 * acabaría en la portada — que es exactamente lo que hacía el
 * conmutador anterior.
 */
export function rutaEquivalente(pathname: string): string {
  const desde = idiomaDeRuta(pathname);
  const hacia: Idioma = desde === "es" ? "en" : "es";
  const par = RUTAS.find((r) => r[desde] === pathname);
  return par ? par[hacia] : hacia === "en" ? "/en" : "/";
}

/** Ruta de un destino conocido en el idioma pedido. */
export function ruta(
  clave: "home" | "trabajo" | "caso" | "perfil" | "contacto" | "cv",
  idioma: Idioma,
) {
  const mapa = {
    home: "/",
    trabajo: "/proyectos",
    caso: "/proyectos/collie-app",
    perfil: "/sobre-mi",
    contacto: "/contacto",
    cv: "/cv",
  } as const;
  const par = RUTAS.find((r) => r.es === mapa[clave]);
  return par ? par[idioma] : "/";
}

export const UI = {
  es: {
    nav: {
      inicio: "Inicio",
      abrirMenu: "Abrir menú",
      cerrarMenu: "Cerrar menú",
      cambiarIdioma: "View this site in English",
      pie: "Pie de página",
      otroIdioma: "EN",
    },
    carga: { cargando: "Cargando experiencia" },
    hero: {
      palabras: ["Estrategia", "Datos", "Producto"],
      portafolio: "Portafolio",
      explorar: "Desplázate para explorar ↓",
    },
    actos: {
      perfil: "Perfil",
      trabajo: "Trabajo seleccionado",
      contacto: "Contacto",
    },
    comun: {
      proyectos: "Proyectos",
      problema: "Problema",
      solucion: "Solución",
      impacto: "Impacto",
      alcance: "Alcance",
      proceso: "Proceso",
      rol: "Rol",
      plataformas: "Plataformas",
      verCaso: "Ver caso",
      verCasoDe: "Ver el caso de",
      verTodos: "Ver todos los proyectos",
      abrirArchivo: "Abrir archivo",
      perfilCompleto: "Perfil completo",
      leerCaso: "Leer el caso completo",
      volverProyectos: "Volver a proyectos",
      cuenta: "proyectos",
    },
    cierre: {
      ultimaCosa: "Una última cosa",
      cuentame: ["Cuéntame", "qué sigue."],
      sigueBajando: "Sigue bajando ↓",
      pregunta: "¿Tienes un proyecto en mente?",
      titulo: ["Hagamos algo", "que se pueda", "medir."],
      empecemos: "Empecemos una conversación",
      escribir: "Escribir",
      formulario: "Formulario de contacto",
      volverArriba: "Volver arriba ↑",
    },
    perfil: {
      seccion: "Perfil",
      titulo: "Sobre mí",
      base: "Base",
      rol: "Rol",
      disponibilidad: "Disponibilidad",
      idiomas: "Idiomas",
      idiomasValor: "Español · Inglés B2",
      dominios: "Dominios",
      comoTrabajo: "Cómo trabajo",
      trayectoria: "Trayectoria · pulsa para desplegar",
      verProyectos: "Ver los proyectos",
      formacion: "Formación",
      descargarCv: "Ver CV",
      cv: {
        titulo: "Currículum",
        imprimir: "Descargar PDF",
        volver: "Volver al sitio",
        perfil: "Perfil",
        experiencia: "Experiencia",
        proyectos: "Proyectos",
        competencias: "Competencias",
        formacion: "Formación",
        idiomas: "Idiomas",
        generado: "Generado desde gustavomarquez.dev",
        nota: "Usa «Guardar como PDF» en el destino de impresión.",
      },
      loQueHice: "Lo que hice",
      herramientas: "Herramientas",
    },
    trabajo: {
      seccion: "Archivo",
      titulo: "Proyectos",
      entrada:
        "Producto digital, inteligencia de negocio y procesos. Cada uno nació de un problema medible y terminó en algo que alguien usa todos los días.",
      total: "Total",
      periodo: "Periodo",
      roles: "Roles",
      sectores: "Sectores",
      rolesValor: "PM · PO · Analista de negocio",
      sectoresValor: "Agroexportación · Minería",
    },
    caso: {
      seccion: "Caso de estudio",
      duracion: "Duración",
      bloques: {
        contexto: "Contexto",
        restricciones: "Restricciones",
        decisiones: "Decisiones",
        proceso: "Proceso",
        resultados: "Resultados",
        aprendizajes: "Aprendizajes",
      },
      decisionesEntrada:
        "Cada una con la alternativa que se descartó. Sin ella, una decisión es sólo una descripción de lo que se hizo.",
      alternativa: "Alternativa descartada",
      eleccion: "Elección",
      porque: "Por qué",
    },
    contacto: {
      seccion: "Contacto",
      titulo: "Hablemos",
      entrada:
        "Si tienes un problema de negocio que huele a producto digital, o un producto que necesita defenderse con números, escribe. La primera conversación es para entender el contexto, no para vender nada.",
      ubicacion: "Ubicación",
      zona: "Zona horaria",
      zonaValor: "GMT-5 (Perú)",
      modalidad: "Modalidad",
      modalidadValor: "Presencial · Remoto",
      estado: "Estado",
      canales: "Canales directos",
      trabajemos: "Trabajemos juntos si…",
      etiquetas: {
        correo: "Correo",
        telefono: "Teléfono / WhatsApp",
        linkedin: "LinkedIn",
        cv: "Currículum",
      },
      notas: {
        correo: "Respuesta en menos de 24 h hábiles",
        telefono: "Lun a Vie, 9:00 – 19:00 (GMT-5)",
        linkedin: "Perfil profesional y actualizaciones",
        cv: "Versión completa para procesos de selección",
      },
      cvValor: "Descargar CV en PDF",
      lista: [
        "Necesitas convertir una operación que vive en Excel en un producto digital usable.",
        "Tienes datos pero no indicadores: nadie sabe si el mes va bien antes de que termine.",
        "Un equipo entrega por urgencias y hace falta cadencia, backlog y visibilidad.",
        "Buscas evaluar la apertura de un mercado internacional con números, no con intuición.",
      ],
    },
  },

  en: {
    nav: {
      inicio: "Home",
      abrirMenu: "Open menu",
      cerrarMenu: "Close menu",
      cambiarIdioma: "Ver el sitio en español",
      pie: "Footer",
      otroIdioma: "ES",
    },
    carga: { cargando: "Loading experience" },
    hero: {
      palabras: ["Strategy", "Data", "Product"],
      portafolio: "Portfolio",
      explorar: "Scroll to explore ↓",
    },
    actos: {
      perfil: "Profile",
      trabajo: "Selected work",
      contacto: "Contact",
    },
    comun: {
      proyectos: "Work",
      problema: "The problem",
      solucion: "The solution",
      impacto: "Impact",
      alcance: "Scope",
      proceso: "Process",
      rol: "Role",
      plataformas: "Platforms",
      verCaso: "View case",
      verCasoDe: "View the case study for",
      verTodos: "See all projects",
      abrirArchivo: "Open archive",
      perfilCompleto: "Full profile",
      leerCaso: "Read the full case study",
      volverProyectos: "Back to work",
      cuenta: "projects",
    },
    cierre: {
      ultimaCosa: "One last thing",
      cuentame: ["Tell me", "what's next."],
      sigueBajando: "Keep scrolling ↓",
      pregunta: "Have a project in mind?",
      titulo: ["Let's build", "something you", "can measure."],
      empecemos: "Start a conversation",
      escribir: "Write",
      formulario: "Contact form",
      volverArriba: "Back to top ↑",
    },
    perfil: {
      seccion: "Profile",
      titulo: "About",
      base: "Based in",
      rol: "Role",
      disponibilidad: "Availability",
      idiomas: "Languages",
      idiomasValor: "Spanish · English B2",
      dominios: "Domains",
      comoTrabajo: "How I work",
      trayectoria: "Career · tap to expand",
      verProyectos: "See the work",
      formacion: "Education",
      descargarCv: "View CV",
      cv: {
        titulo: "Résumé",
        imprimir: "Download PDF",
        volver: "Back to the site",
        perfil: "Profile",
        experiencia: "Experience",
        proyectos: "Work",
        competencias: "Capabilities",
        formacion: "Education",
        idiomas: "Languages",
        generado: "Generated from gustavomarquez.dev",
        nota: "Choose «Save as PDF» as the print destination.",
      },
      loQueHice: "What I did",
      herramientas: "Tools",
    },
    trabajo: {
      seccion: "Archive",
      titulo: "Work",
      entrada:
        "Digital product, business intelligence and process. Each one started from a measurable problem and ended in something somebody uses every day.",
      total: "Total",
      periodo: "Period",
      roles: "Roles",
      sectores: "Sectors",
      rolesValor: "PM · PO · Business analyst",
      sectoresValor: "Agri-export · Mining",
    },
    caso: {
      seccion: "Case study",
      duracion: "Duration",
      bloques: {
        contexto: "Context",
        restricciones: "Constraints",
        decisiones: "Decisions",
        proceso: "Process",
        resultados: "Results",
        aprendizajes: "Lessons",
      },
      decisionesEntrada:
        "Each one with the alternative that was discarded. Without it, a decision is just a description of what was done.",
      alternativa: "Discarded alternative",
      eleccion: "Choice",
      porque: "Why",
    },
    contacto: {
      seccion: "Contact",
      titulo: "Let's talk",
      entrada:
        "If you have a business problem that smells like a digital product, or a product that needs to defend itself with numbers, write to me. The first conversation is to understand the context, not to sell anything.",
      ubicacion: "Location",
      zona: "Time zone",
      zonaValor: "GMT-5 (Peru)",
      modalidad: "Mode",
      modalidadValor: "On-site · Remote",
      estado: "Status",
      canales: "Direct channels",
      trabajemos: "Let's work together if…",
      etiquetas: {
        correo: "Email",
        telefono: "Phone / WhatsApp",
        linkedin: "LinkedIn",
        cv: "Résumé",
      },
      notas: {
        correo: "Reply within 24 working hours",
        telefono: "Mon to Fri, 9:00 – 19:00 (GMT-5)",
        linkedin: "Professional profile and updates",
        cv: "Full version for hiring processes",
      },
      cvValor: "Download CV as PDF",
      lista: [
        "You need to turn an operation that lives in spreadsheets into a usable digital product.",
        "You have data but no indicators: nobody knows whether the month is going well before it ends.",
        "A team delivers on urgency and needs cadence, a backlog and visibility.",
        "You want to assess entry into an international market with numbers, not instinct.",
      ],
    },
  },
};

export type Textos = (typeof UI)["es"];

/**
 * Sin `as const` a propósito: con él, cada idioma se infiere como un tipo
 * de literales distinto («Inicio» no es asignable a «Home») y `UI[idioma]`
 * deja de ser legible. Las dos ramas tienen que compartir forma, no valores.
 *
 * Todo lo que UI contiene es serializable a propósito: cadenas y listas,
 * ni una función. Los textos viajan del servidor al cliente como props, y
 * React rechaza las funciones en ese salto. Cuando un texto necesita un
 * dato variable se compone donde está el dato, no aquí.
 */
