/**
 * Fija el correo y la contraseña del panel.
 *
 *   npx tsx --env-file=.env.local scripts/credenciales.ts <correo> <clave>
 *
 * Existe porque la semilla, a propósito, no toca una contraseña que ya
 * está puesta: sembrar de nuevo no debe revertir un cambio hecho desde el
 * panel. Cuando hay que forzarla —se olvidó, o se rota— este es el
 * camino, y que sea otro comando deja claro que es otra intención.
 *
 * La clave llega por argumento y no por variable de entorno para que no
 * quede en el `.env.local` de nadie; sí queda en el historial del
 * terminal, que es un sitio bastante peor, así que conviene rotarla si la
 * máquina es compartida.
 */
import { pool, sql } from "../src/db/cliente";
import { hashear, normalizarEmail } from "../src/db/clave";

/* No se importa `fijarCredenciales` de `sesion.ts`: ese módulo carga
   `server-only`, que revienta fuera de Next antes de ejecutar nada. La
   consulta es de tres líneas y el hasheo sí es compartido, que era lo
   que importaba no duplicar. */
async function fijarCredenciales(email: string, clave: string) {
  await sql(
    `INSERT INTO admin (id, email, hash) VALUES (1, $1, $2)
     ON CONFLICT (id) DO UPDATE
       SET email = $1, hash = $2, actualizado_en = now()`,
    [normalizarEmail(email), await hashear(clave)],
  );
}

const [correo, clave] = process.argv.slice(2);

if (!correo || !clave) {
  console.error(
    "Uso: npx tsx --env-file=.env.local scripts/credenciales.ts <correo> <clave>",
  );
  process.exit(1);
}

if (clave.length < 12) {
  console.error("La contraseña debe tener al menos 12 caracteres.");
  process.exit(1);
}

fijarCredenciales(correo, clave)
  .then(async () => {
    console.log(`Acceso al panel actualizado para ${correo.toLowerCase()}.`);
    await pool().end();
  })
  .catch(async (e) => {
    console.error("No se pudo actualizar:", e instanceof Error ? e.message : e);
    await pool().end();
    process.exit(1);
  });
