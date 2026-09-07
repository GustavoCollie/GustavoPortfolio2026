import {
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

/**
 * ─────────────────────────────────────────────────────────────
 *  HASHEO DE LA CONTRASEÑA DEL PANEL
 *
 *  Aparte de `sesion.ts` porque este módulo lo necesitan también los
 *  scripts de línea de comandos, y `sesion.ts` importa `server-only`:
 *  cargarlo desde `tsx` revienta antes de ejecutar una sola línea.
 *
 *  Sin este módulo la mezcla de sal y hash estaba escrita tres veces
 *  —sesión, semilla y cambio de contraseña— y bastaba con cambiar el
 *  largo en una para que las otras dos dejaran de validar sin decir por
 *  qué. Aquí está una vez.
 * ─────────────────────────────────────────────────────────────
 */

const scrypt = promisify(scryptCb) as (
  clave: string,
  sal: string,
  largo: number,
) => Promise<Buffer>;

const LARGO = 64;

/** Normaliza un correo para compararlo: nadie escribe su dirección
 *  siempre con las mismas mayúsculas. */
export const normalizarEmail = (email: string) => email.trim().toLowerCase();

/** Devuelve «sal:hash», que es como se guarda en la columna. */
export async function hashear(clave: string): Promise<string> {
  const sal = randomBytes(16).toString("hex");
  const hash = (await scrypt(clave, sal, LARGO)).toString("hex");
  return `${sal}:${hash}`;
}

/** Compara dos cadenas sin filtrar en cuánto se parecen. */
export function igual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  // `timingSafeEqual` exige la misma longitud; comparar longitudes ya
  // filtra un bit, pero no el contenido, que es lo que importa.
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** ¿Corresponde `clave` al «sal:hash» guardado? */
export async function verificar(
  clave: string,
  guardado: string,
): Promise<boolean> {
  const [sal, esperado] = guardado.split(":");
  if (!sal || !esperado) return false;
  const calculado = (await scrypt(clave, sal, LARGO)).toString("hex");
  return igual(calculado, esperado);
}
