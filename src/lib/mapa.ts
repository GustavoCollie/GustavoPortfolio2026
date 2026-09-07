import { TIERRA } from "@/data/mundo";

/**
 * Trazado SVG del planisferio en proyección equirectangular:
 * x = longitud + 180, y = 90 − latitud.
 *
 * Vive aquí y no dentro de un componente porque lo usan dos: el fondo
 * fijo del sitio y la franja que remata el currículum. Se calcula una
 * sola vez al cargar el módulo, en el servidor.
 */
export const TRAZADO_MUNDO = TIERRA.map((anillo) => {
  let d = "";
  for (let i = 0; i < anillo.length; i += 2) {
    const x = (anillo[i] + 180).toFixed(1);
    const y = (90 - anillo[i + 1]).toFixed(1);
    d += `${i === 0 ? "M" : "L"}${x} ${y}`;
  }
  return d + "Z";
}).join(" ");
