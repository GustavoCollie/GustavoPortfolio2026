/**
 * ─────────────────────────────────────────────────────────────
 *  SUPERFICIE: front o backend
 *
 *  El mismo repositorio se despliega dos veces:
 *
 *    FRONT    gustavo-portfolio2026.vercel.app
 *             El sitio público. `/admin` no existe: devuelve 404.
 *             Su DATABASE_URL apunta a un rol de Postgres que sólo
 *             puede leer, así que aunque alguien encontrara una
 *             inyección no habría nada que escribir.
 *
 *    BACKEND  su propia URL, sin dominio propio ni indexación.
 *             El panel de administración. Es la única superficie con
 *             credenciales de escritura.
 *
 *  Se separan porque tienen amenazas y públicos distintos: el front lo
 *  visita cualquiera y sólo necesita leer; el backend lo visita una
 *  persona y necesita escribirlo todo. Juntos, el sitio público carga
 *  con las credenciales de escritura sin usarlas nunca.
 *
 *  Una sola variable las distingue. Sin ella se asume FRONT: si algún
 *  día se despliega sin configurar nada, lo que sale es el sitio
 *  público sin panel — nunca un panel abierto por descuido.
 * ─────────────────────────────────────────────────────────────
 */

export type Superficie = "front" | "backend";

export const SUPERFICIE: Superficie =
  process.env.SUPERFICIE === "backend" ? "backend" : "front";

export const esBackend = SUPERFICIE === "backend";
export const esFront = SUPERFICIE === "front";
