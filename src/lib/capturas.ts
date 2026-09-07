/**
 * Claves de las capturas de proyecto en la tabla `imagenes`.
 *
 * Cada proyecto admite dos: la de escritorio y la de móvil. La clave se
 * deriva del slug para que el panel pueda ofrecer un hueco por proyecto
 * sin que nadie tenga que registrar nada a mano — añadir un proyecto ya
 * añade sus dos huecos de imagen.
 *
 * El prefijo `p-` evita chocar con las claves sueltas (`retrato`,
 * `operacion`) si algún día un proyecto se llamara igual que una.
 */
export const claveCaptura = (slug: string, cara: "web" | "movil") =>
  `p-${slug}-${cara}`;

/**
 * La proporción del hueco donde va cada imagen.
 *
 * Vive aquí y no suelta en cada componente porque el panel recorta
 * contra ella: si el recortador y el marco no coincidieran, recortar
 * sería peor que no hacerlo — la foto saldría bien encuadrada en el
 * panel y mal en la página, que es el peor de los dos mundos.
 */
export const PROPORCIONES = {
  /** El retrato de «Sobre mí» y del currículum. */
  retrato: 4 / 5,
  /** Plano de apoyo, horizontal. */
  operacion: 3 / 2,
  /** Captura de escritorio dentro de la maqueta. */
  web: 16 / 10,
  /** Captura de móvil: la forma de un teléfono actual. */
  movil: 9 / 19.5,
} as const;

/** Qué proporción le toca a una clave de imagen. */
export function proporcionDe(clave: string): number {
  if (clave.startsWith("p-")) {
    return clave.endsWith("-movil") ? PROPORCIONES.movil : PROPORCIONES.web;
  }
  // Una clave suelta que no esté en la tabla se recorta en horizontal
  // suave, que es lo que menos estorba en un sitio que aún no la usa.
  return (PROPORCIONES as Record<string, number>)[clave] ?? PROPORCIONES.operacion;
}

/** Las dos capturas de un proyecto, si están subidas. */
export function capturasDe(
  imagenes: Record<string, { src: string }>,
  slug: string,
) {
  return {
    web: imagenes[claveCaptura(slug, "web")]?.src,
    movil: imagenes[claveCaptura(slug, "movil")]?.src,
  };
}
