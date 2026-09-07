import "server-only";
import { cookies } from "next/headers";
import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { sql } from "./cliente";

/**
 * ─────────────────────────────────────────────────────────────
 *  SESIÓN DEL PANEL
 *
 *  Lo que había antes era una cookie con el valor «1»: cualquiera que
 *  supiera su nombre entraba escribiéndola en la consola del
 *  navegador. Daba igual mientras el panel no podía guardar nada; con
 *  una base de datos detrás, deja de dar igual.
 *
 *  Dos piezas:
 *
 *  · La CONTRASEÑA se guarda como scrypt con sal (tabla `admin`),
 *    nunca en claro y nunca en una variable de entorno que acabe en
 *    los registros de despliegue. Se compara con `timingSafeEqual`
 *    para no filtrar el prefijo correcto por diferencia de tiempo.
 *
 *  · La COOKIE lleva su propia caducidad y una firma HMAC con
 *    `ADMIN_SECRET`. El servidor no guarda sesiones: si la firma
 *    cuadra y la fecha no ha pasado, la cookie es válida. Sin el
 *    secreto no se puede fabricar una.
 *
 *  Sin `ADMIN_SECRET` no se emite ninguna sesión. Es deliberado:
 *  preferible un panel que no deja entrar a uno que deja entrar a
 *  cualquiera.
 * ─────────────────────────────────────────────────────────────
 */

const scrypt = promisify(scryptCb) as (
  clave: string,
  sal: string,
  largo: number,
) => Promise<Buffer>;

const COOKIE = "admin_sesion";
const DURACION = 60 * 60 * 8; // 8 horas

function secreto() {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 32) return null;
  return s;
}

const firmar = (carga: string, s: string) =>
  createHmac("sha256", s).update(carga).digest("hex");

/** Compara dos cadenas sin filtrar en cuánto se parecen. */
function igual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  // `timingSafeEqual` exige la misma longitud; comparar longitudes ya
  // filtra un bit, pero no el contenido, que es lo que importa.
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** ¿Es esta la contraseña del panel? */
export async function claveValida(enviada: string): Promise<boolean> {
  const filas = await sql<{ hash: string }>("SELECT hash FROM admin WHERE id = 1");
  const guardado = filas[0]?.hash;
  if (!guardado) return false;

  const [sal, esperado] = guardado.split(":");
  if (!sal || !esperado) return false;

  const calculado = (await scrypt(enviada, sal, 64)).toString("hex");
  return igual(calculado, esperado);
}

/** Cambia la contraseña. La usa el propio panel. */
export async function fijarClave(nueva: string) {
  const sal = randomBytes(16).toString("hex");
  const hash = (await scrypt(nueva, sal, 64)).toString("hex");
  await sql(
    `INSERT INTO admin (id, hash) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET hash = $1, actualizado_en = now()`,
    [`${sal}:${hash}`],
  );
}

export async function abrirSesion(): Promise<boolean> {
  const s = secreto();
  if (!s) return false;

  const expira = Date.now() + DURACION * 1000;
  const carga = String(expira);
  const jar = await cookies();
  jar.set(COOKIE, `${carga}.${firmar(carga, s)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: DURACION,
  });
  return true;
}

export async function cerrarSesion() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function haySesion(): Promise<boolean> {
  const s = secreto();
  if (!s) return false;

  const valor = (await cookies()).get(COOKIE)?.value;
  if (!valor) return false;

  const [carga, firma] = valor.split(".");
  if (!carga || !firma) return false;
  if (!igual(firma, firmar(carga, s))) return false;

  const expira = Number(carga);
  return Number.isFinite(expira) && expira > Date.now();
}
