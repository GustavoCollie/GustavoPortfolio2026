/**
 * ─────────────────────────────────────────────────────────────
 *  PALETA EDITABLE
 *
 *  Define qué variables de color puede tocar el panel de /admin.
 *  Los valores por defecto son los mismos que hay en globals.css; lo
 *  que se guarda en la tabla `paleta` se inyecta después como un
 *  <style> y gana por orden de cascada.
 *
 *  El sistema tiene UN SOLO acento y una escala neutra. La escala
 *  intermedia de `ink` (700, 600, 500…) se deja fuera a propósito:
 *  tocarla a ojo rompe el contraste de bordes y textos secundarios.
 * ─────────────────────────────────────────────────────────────
 */

export type Tema = "dark" | "light";

export type TokenColor = {
  clave: string;
  etiqueta: string;
  ayuda: string;
};

export type GrupoTokens = {
  grupo: string;
  descripcion: string;
  tokens: TokenColor[];
};

export const GRUPOS: GrupoTokens[] = [
  {
    grupo: "Base",
    descripcion:
      "El papel y la tinta. Son los dos colores que definen el sitio: todo lo demás se deriva de ellos.",
    tokens: [
      { clave: "ink-950", etiqueta: "Fondo", ayuda: "El papel" },
      { clave: "ink-100", etiqueta: "Texto", ayuda: "La tinta" },
      { clave: "ink-900", etiqueta: "Superficie", ayuda: "Tarjetas y bloques elevados" },
    ],
  },
  {
    grupo: "Acento",
    descripcion:
      "Botones sólidos y estados activos. En este sistema el acento es casi tinta pura: si se vuelve un color vivo, el diseño deja de ser el que es.",
    tokens: [
      { clave: "accent", etiqueta: "Acento", ayuda: "Relleno de botones" },
      {
        clave: "accent-contra",
        etiqueta: "Sobre acento",
        ayuda: "Texto encima del acento",
      },
    ],
  },
];

export const CLAVES = GRUPOS.flatMap((g) => g.tokens.map((t) => t.clave));

/** Valores por defecto: deben coincidir con globals.css. */
export const PALETA_BASE: Record<Tema, Record<string, string>> = {
  light: {
    "ink-950": "#e8e8e5",
    "ink-900": "#f0f0ee",
    "ink-100": "#101010",
    accent: "#1a1a1a",
    "accent-contra": "#e8e8e5",
  },
  dark: {
    "ink-950": "#0d0d0c",
    "ink-900": "#141413",
    "ink-100": "#f2f2ef",
    accent: "#f2f2ef",
    "accent-contra": "#0d0d0c",
  },
};

/**
 * Paletas listas para probar de un clic desde el panel.
 *
 * Cada una define los DOS temas, no uno: el sitio tiene conmutador
 * claro/oscuro y una escena que invierte el color a mitad del recorrido,
 * así que una paleta que sólo resolviera un lado dejaría media página sin
 * definir.
 *
 * «Papel» es la principal —la que está aplicada— y aquí lleva sus valores
 * escritos en vez de dos objetos vacíos: antes decía «la actual» y
 * remitía a globals.css, lo que obligaba a abrir el código para saber qué
 * colores eran. Un panel que no muestra lo que tiene puesto sirve de
 * poco.
 *
 * Las otras dos son sugerencias. Los selectores de color siguen ahí para
 * componer cualquier otra combinación.
 */
export const PRESETS: {
  nombre: string;
  nota: string;
  /** La aplicada por defecto. El panel la señala. */
  principal?: boolean;
  dark: Record<string, string>;
  light: Record<string, string>;
}[] = [
  {
    nombre: "Papel",
    nota: "El tema del sitio. Gris cálido y tinta negra, sin más color que el del contenido.",
    principal: true,
    light: {
      "ink-950": "#e8e8e5",
      "ink-900": "#f0f0ee",
      "ink-100": "#101010",
      accent: "#1a1a1a",
      "accent-contra": "#e8e8e5",
    },
    dark: {
      "ink-950": "#0d0d0c",
      "ink-900": "#141413",
      "ink-100": "#f2f2ef",
      accent: "#f2f2ef",
      "accent-contra": "#0d0d0c",
    },
  },
  {
    nombre: "Blanco y azul",
    nota: "Claro: papel blanco y azul de marca. Más corporativo y más convencional.",
    light: {
      "ink-950": "#ffffff",
      "ink-900": "#f5f8fd",
      "ink-100": "#0b1220",
      accent: "#1d4ed8",
      "accent-contra": "#ffffff",
    },
    // Contraparte oscura: el conmutador tiene que seguir funcionando.
    dark: {
      "ink-950": "#0b1220",
      "ink-900": "#131c2e",
      "ink-100": "#eef3fa",
      accent: "#60a5fa",
      "accent-contra": "#0b1220",
    },
  },
  {
    nombre: "Azul y negro",
    nota: "Oscuro: negro azulado y azul eléctrico. El más técnico de los tres.",
    dark: {
      "ink-950": "#05070d",
      "ink-900": "#0b101c",
      "ink-100": "#e8eefc",
      accent: "#3b82f6",
      "accent-contra": "#05070d",
    },
    light: {
      "ink-950": "#eef2f9",
      "ink-900": "#ffffff",
      "ink-100": "#05070d",
      accent: "#1e40af",
      "accent-contra": "#ffffff",
    },
  },
];

export type PaletaGuardada = Partial<Record<Tema, Record<string, string>>>;

/** Fusiona lo guardado sobre los valores por defecto. */
export function resolverPaleta(guardada: PaletaGuardada | undefined, tema: Tema) {
  return { ...PALETA_BASE[tema], ...(guardada?.[tema] ?? {}) };
}

/**
 * CSS de las variables sobrescritas.
 *
 * Sólo emite las que difieren del valor por defecto: si no se ha tocado
 * nada, no se inyecta ni un byte.
 *
 * El selector del tema claro incluye `:root` a secas porque el claro es
 * ahora el tema por defecto del sistema.
 */
export function cssDePaleta(guardada: PaletaGuardada | undefined): string {
  if (!guardada) return "";

  const bloque = (tema: Tema, selector: string) => {
    const cambios = Object.entries(guardada[tema] ?? {}).filter(
      ([clave, valor]) =>
        CLAVES.includes(clave) && valor && valor !== PALETA_BASE[tema][clave],
    );
    if (cambios.length === 0) return "";
    const decl = cambios.map(([c, v]) => `--${c}:${v}`).join(";");
    return `${selector}{${decl}}`;
  };

  return [
    bloque("light", ':root,:root[data-theme="light"]'),
    bloque("dark", ':root[data-theme="dark"]'),
  ]
    .filter(Boolean)
    .join("");
}
