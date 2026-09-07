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
