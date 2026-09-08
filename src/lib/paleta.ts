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
    nombre: "Azul",
    nota: "Azul claro arriba y azul oscuro en la sección invertida. El mismo tono a los dos lados del cambio de color.",
    light: {
      "ink-950": "#eef3fb",
      "ink-900": "#f8fbff",
      "ink-100": "#0b1220",
      accent: "#1d4ed8",
      "accent-contra": "#f8fbff",
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
    nombre: "Azul noche",
    nota: "El mismo par, más contrastado: casi negro azulado contra azul eléctrico. El más técnico de los tres.",
    dark: {
      "ink-950": "#05070d",
      "ink-900": "#0b101c",
      "ink-100": "#e8eefc",
      accent: "#3b82f6",
      "accent-contra": "#05070d",
    },
    light: {
      "ink-950": "#e6ecf7",
      "ink-900": "#f4f7fc",
      "ink-100": "#05070d",
      accent: "#1e40af",
      "accent-contra": "#f4f7fc",
    },
  },
];

export type PaletaGuardada = Partial<Record<Tema, Record<string, string>>>;

/** Fusiona lo guardado sobre los valores por defecto. */
export function resolverPaleta(guardada: PaletaGuardada | undefined, tema: Tema) {
  return { ...PALETA_BASE[tema], ...(guardada?.[tema] ?? {}) };
}

/**
 * ─────────────────────────────────────────────────────────────
 *  DERIVACIÓN DE LA ESCALA
 *
 *  El panel edita cinco colores, pero la página usa veinte variables:
 *  la escala intermedia (`ink-800`…`ink-200`), los filetes, las
 *  superficies translúcidas y la sombra de tarjeta. Antes sólo se
 *  inyectaban los cinco editables, así que elegir una paleta azul
 *  cambiaba el fondo y los botones y dejaba TODO lo demás —texto
 *  secundario, bordes, separadores— en el gris cálido de `globals.css`.
 *  El resultado era una página que seguía pareciendo la misma.
 *
 *  Ahora los cinco colores base generan las veinte. Las proporciones
 *  salen del propio sistema «Papel»: son las que separan cada peldaño
 *  del fondo respecto de la tinta en `globals.css`, medidas una vez y
 *  reutilizadas. Aplicadas a los colores por defecto devuelven la
 *  escala original; aplicadas a un azul, devuelven el mismo diseño en
 *  azul.
 *
 *  Se derivan los DOS temas, siempre. Es lo que exige la <Escena>
 *  invertida: a mitad del recorrido la página pinta el tema contrario,
 *  y si sólo estuviera resuelto uno, la mitad del sitio se quedaría con
 *  la escala vieja.
 * ─────────────────────────────────────────────────────────────
 */

/** Cuánto se acerca cada peldaño a la tinta, de 0 (fondo) a 1 (tinta). */
const RAMPA: Record<Tema, Record<string, number>> = {
  light: {
    "ink-800": 0.048,
    "ink-700": 0.147,
    "ink-600": 0.279,
    "ink-500": 0.442,
    "ink-400": 0.584,
    "ink-300": 0.736,
    "ink-200": 0.884,
  },
  dark: {
    "ink-800": 0.09,
    "ink-700": 0.142,
    "ink-600": 0.238,
    "ink-500": 0.398,
    "ink-400": 0.555,
    "ink-300": 0.704,
    "ink-200": 0.863,
  },
};

/** Opacidades de filetes y superficies, tomadas de `globals.css`. */
const ALFAS: Record<Tema, Record<string, number>> = {
  light: { line: 0.12, "line-2": 0.22, "line-3": 0.45, surface: 0.03, "surface-2": 0.06 },
  dark: { line: 0.12, "line-2": 0.22, "line-3": 0.45, surface: 0.035, "surface-2": 0.07 },
};

type RGB = [number, number, number];

function aRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

const aHex = (c: RGB) =>
  "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/** Interpola dos colores canal a canal. `t` = 0 devuelve `a`, 1 devuelve `b`. */
function mezcla(a: string, b: string, t: number): string {
  const [ar, ag, ab] = aRgb(a);
  const [br, bg, bb] = aRgb(b);
  return aHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

/** Color con alfa, en la sintaxis que ya usa el sistema. */
function conAlfa(hex: string, alfa: number): string {
  const [r, g, b] = aRgb(hex);
  return `rgb(${r} ${g} ${b} / ${alfa})`;
}

/**
 * Las veinte variables CSS de un tema a partir de los cinco editables.
 *
 * La consumen el sitio (para inyectarlas) y el panel (para la vista
 * previa en vivo), de modo que lo que se ve al elegir un color es
 * exactamente lo que se guarda.
 */
export function variablesDePaleta(
  valores: Record<string, string>,
  tema: Tema,
): Record<string, string> {
  const v = { ...PALETA_BASE[tema], ...valores };
  const fondo = v["ink-950"];
  const superficie = v["ink-900"];
  const tinta = v["ink-100"];

  const salida: Record<string, string> = {
    "ink-950": fondo,
    "ink-900": superficie,
    "ink-100": tinta,
    accent: v.accent,
    "accent-contra": v["accent-contra"],
    // La superficie más alta. En claro es papel puro —una tarjeta que
    // flota sobre el fondo—; en oscuro, la superficie un punto más cerca
    // de la tinta, que es como se levanta un plano sin luz.
    "ink-850": tema === "light" ? "#ffffff" : mezcla(superficie, tinta, 0.03),
  };

  for (const [clave, t] of Object.entries(RAMPA[tema])) {
    salida[clave] = mezcla(fondo, tinta, t);
  }
  for (const [clave, alfa] of Object.entries(ALFAS[tema])) {
    salida[clave] = conAlfa(tinta, alfa);
  }

  // En oscuro la sombra es negra de verdad, no tinta clara: teñirla con
  // el color del texto la volvería un halo.
  salida["shadow-card"] =
    tema === "light"
      ? `0 30px 70px -40px ${conAlfa(tinta, 0.35)}`
      : "0 30px 70px -40px rgb(0 0 0 / 0.9)";

  return salida;
}

/** ¿Se ha tocado algún color base de este tema? */
export function temaEditado(
  guardada: PaletaGuardada | undefined,
  tema: Tema,
): boolean {
  const g = guardada?.[tema] ?? {};
  return CLAVES.some((c) => g[c] && g[c] !== PALETA_BASE[tema][c]);
}

/**
 * CSS de las variables sobrescritas.
 *
 * Sólo emite el tema que se haya tocado: si no se ha cambiado nada, no
 * se inyecta ni un byte y manda `globals.css` tal cual. Pero en cuanto
 * un tema cambia se emite su escala COMPLETA, no sólo los cinco
 * editables — mezclar un fondo azul con unos grises heredados es
 * justamente lo que hacía que la paleta no se notara.
 *
 * El selector del tema claro incluye `:root` a secas porque el claro es
 * ahora el tema por defecto del sistema.
 */
export function cssDePaleta(guardada: PaletaGuardada | undefined): string {
  if (!guardada) return "";

  const bloque = (tema: Tema, selector: string) => {
    if (!temaEditado(guardada, tema)) return "";
    const vars = variablesDePaleta(guardada[tema] ?? {}, tema);
    const decl = Object.entries(vars)
      .map(([c, valor]) => `--${c}:${valor}`)
      .join(";");
    return `${selector}{${decl}}`;
  };

  return [
    bloque("light", ':root,:root[data-theme="light"]'),
    bloque("dark", ':root[data-theme="dark"]'),
  ]
    .filter(Boolean)
    .join("");
}
