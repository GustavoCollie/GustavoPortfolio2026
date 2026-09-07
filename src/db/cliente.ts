import { Pool } from "pg";

/**
 * ─────────────────────────────────────────────────────────────
 *  CONEXIÓN
 *
 *  Un único pool por proceso. En desarrollo el módulo se recarga en
 *  cada cambio, así que el pool se guarda en `globalThis`: sin eso,
 *  media hora de trabajo deja decenas de pools abiertos y Postgres
 *  acaba rechazando conexiones por «too many clients».
 *
 *  `max: 2` porque el destino es serverless: cada instancia de
 *  función abre su propio pool y son muchas instancias contra el
 *  mismo Postgres. Hay que apuntar SIEMPRE a la cadena del pooler
 *  («pooler.supabase.com:6543»), nunca a la conexión directa.
 *
 *  La espera de conexión es larga —30 s— por la compilación. `next
 *  build` prerenderiza con varios procesos a la vez y entre todos
 *  piden más conexiones de las que el pooler concede de golpe. Con
 *  una espera corta las que sobran fallan, esa página cae al
 *  contenido de respaldo y se publica un sitio con el texto del
 *  repositorio en vez del de la base — sin un solo error en el
 *  registro de despliegue. Esperando, hacen cola y todas leen de
 *  Postgres. Nadie nota 30 s en un servidor; todos notan un sitio
 *  con el contenido de hace tres meses.
 * ─────────────────────────────────────────────────────────────
 */

const global_ = globalThis as unknown as { __pool?: Pool };

function crearPool() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Copia .env.example a .env.local y pon la cadena de conexión de Postgres.",
    );
  }

  return new Pool({
    connectionString: url,
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 30_000,
    // Supabase exige TLS; un Postgres local en Docker no lo tiene. Se
    // decide por la cadena en vez de por una variable aparte, para que
    // no haya dos sitios donde configurar lo mismo.
    ssl: url.includes("localhost") || url.includes("127.0.0.1")
      ? undefined
      : { rejectUnauthorized: false },
  });
}

export function pool(): Pool {
  if (!global_.__pool) global_.__pool = crearPool();
  return global_.__pool;
}

/** Consulta tipada. Devuelve sólo las filas, que es lo único que se usa. */
export async function sql<T = Record<string, unknown>>(
  texto: string,
  valores: unknown[] = [],
): Promise<T[]> {
  const res = await pool().query(texto, valores);
  return res.rows as T[];
}

/** ¿Hay base de datos configurada? Lo usan las lecturas para decidir
 *  si pueden caer al contenido en código. */
export function hayBase() {
  return Boolean(process.env.DATABASE_URL);
}
