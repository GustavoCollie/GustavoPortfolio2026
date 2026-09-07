import "server-only";
import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
import { sql } from "./cliente";
import { hashear, igual, normalizarEmail, verificar } from "./clave";

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

const COOKIE = "admin_sesion";
const DURACION = 60 * 60 * 8; // 8 horas

function secreto() {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 32) return null;
  return s;
}

const firmar = (carga: string, s: string) =>
  createHmac("sha256", s).update(carga).digest("hex");

/** ¿Son estas las credenciales del panel? */
export async function credencialesValidas(
  email: string,
  enviada: string,
): Promise<boolean> {
  const filas = await sql<{ email: string; hash: string }>(
    "SELECT email, hash FROM admin WHERE id = 1",
  );
  const fila = filas[0];
  if (!fila?.hash) return false;

  /* La contraseña se comprueba SIEMPRE, aunque el correo ya no cuadre.
     Si se saliera antes, un correo equivocado respondería en un
     milisegundo y el correcto en cien: el tiempo de respuesta diría cuál
     de los dos campos hay que seguir probando. */
  const claveOk = await verificar(enviada, fila.hash);
  const correoOk = igual(normalizarEmail(email), normalizarEmail(fila.email));

  return claveOk && correoOk;
}

/** Fija correo y contraseña. La usan los scripts y el propio panel. */
export async function fijarCredenciales(email: string, nueva: string) {
  await sql(
    `INSERT INTO admin (id, email, hash) VALUES (1, $1, $2)
     ON CONFLICT (id) DO UPDATE
       SET email = $1, hash = $2, actualizado_en = now()`,
    [normalizarEmail(email), await hashear(nueva)],
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
