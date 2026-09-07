/**
 * ─────────────────────────────────────────────────────────────
 *  SEMILLA
 *
 *  Crea el esquema y vuelca en la base el contenido que hoy vive en
 *  `src/data/content.ts` y `content.en.ts`, en los dos idiomas.
 *
 *  Es IDEMPOTENTE: todo va con `ON CONFLICT DO UPDATE` y las listas se
 *  podan al final, así que la base queda EXACTAMENTE como el repositorio
 *  —incluido lo que se haya eliminado—. Se puede ejecutar tantas veces
 *  como haga falta, y es también la vía para volver al contenido de
 *  partida si el panel deja algo en mal estado.
 *
 *  Ojo: sembrar SOBRESCRIBE lo editado desde el panel para las claves
 *  que toca. Es deliberado —«volver al contenido del repositorio» es
 *  justo lo que se quiere de un seed— pero conviene saberlo antes de
 *  lanzarlo sobre producción.
 *
 *      npm run db:seed
 * ─────────────────────────────────────────────────────────────
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { pool, sql } from "../src/db/cliente";
import * as es from "../src/data/content";
import * as en from "../src/data/content.en";
import { UI } from "../src/data/idioma";
import { PALETA_BASE } from "../src/lib/paleta";

/** Clave estable a partir de un texto: es lo que hace repetible el seed. */
const clave = (s: string) =>
  s
    .normalize("NFD")
    // Diacríticos por punto de código: escritos como caracteres literales,
    // el rango depende de cómo se guarde este archivo.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/**
 * Borra de una tabla las filas que ya no están en el contenido.
 *
 * Sin esto, quitar un puesto del CV lo dejaba vivo en la base para
 * siempre: `ON CONFLICT DO UPDATE` sólo sabe insertar y actualizar, no
 * echar de menos. El seed representa el estado completo del repositorio,
 * así que lo que no viene, sobra.
 */
async function podar(tabla: string, columna: string, idioma: string, vivas: string[]) {
  const { rowCount } = await pool().query(
    `DELETE FROM ${tabla} WHERE idioma = $1 AND ${columna} <> ALL($2)`,
    [idioma, vivas],
  );
  if (rowCount) console.log(`  ${idioma}: ${rowCount} fila(s) obsoleta(s) en ${tabla}`);
}

async function sembrarIdioma(idioma: "es" | "en", c: typeof es | typeof en) {
  await sql(
    `INSERT INTO perfil (idioma, datos) VALUES ($1, $2)
     ON CONFLICT (idioma) DO UPDATE SET datos = $2, actualizado_en = now()`,
    [idioma, JSON.stringify(c.perfil)],
  );

  await sql(
    `INSERT INTO manifiesto (idioma, kicker, texto, cierre) VALUES ($1,$2,$3,$4)
     ON CONFLICT (idioma) DO UPDATE SET kicker=$2, texto=$3, cierre=$4, actualizado_en = now()`,
    [idioma, c.manifiesto.kicker, c.manifiesto.texto, c.manifiesto.cierre],
  );

  const clavesMetricas: string[] = [];
  for (const [i, m] of c.metricas.entries()) {
    clavesMetricas.push(clave(m.titulo));
    await sql(
      `INSERT INTO metricas (idioma, clave, orden, valor, prefijo, sufijo, titulo, detalle)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (idioma, clave) DO UPDATE SET
         orden=$3, valor=$4, prefijo=$5, sufijo=$6, titulo=$7, detalle=$8`,
      [idioma, clave(m.titulo), i, m.valor, m.prefijo, m.sufijo, m.titulo, m.detalle],
    );
  }

  await podar("metricas", "clave", idioma, clavesMetricas);

  const clavesExp: string[] = [];
  for (const [i, e] of c.experiencias.entries()) {
    clavesExp.push(clave(`${e.empresa}-${e.desde}`));
    await sql(
      `INSERT INTO experiencias
         (idioma, clave, orden, empresa, cargo, periodo, desde, hasta, sector, modalidad, resumen, logros, stack)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (idioma, clave) DO UPDATE SET
         orden=$3, empresa=$4, cargo=$5, periodo=$6, desde=$7, hasta=$8,
         sector=$9, modalidad=$10, resumen=$11, logros=$12, stack=$13`,
      [
        idioma,
        clave(`${e.empresa}-${e.desde}`),
        i,
        e.empresa,
        e.cargo,
        e.periodo,
        e.desde,
        e.hasta,
        e.sector,
        e.modalidad ?? null,
        e.resumen,
        e.logros,
        e.stack,
      ],
    );
  }

  await podar("experiencias", "clave", idioma, clavesExp);

  for (const [i, p] of c.proyectos.entries()) {
    await sql(
      `INSERT INTO proyectos
         (idioma, slug, orden, nombre, tagline, categoria, plataformas, anio, rol,
          problema, solucion, impacto, stack, proceso, destacado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (idioma, slug) DO UPDATE SET
         orden=$3, nombre=$4, tagline=$5, categoria=$6, plataformas=$7, anio=$8,
         rol=$9, problema=$10, solucion=$11, impacto=$12, stack=$13, proceso=$14, destacado=$15`,
      [
        idioma, p.slug, i, p.nombre, p.tagline, p.categoria, p.plataformas,
        p.anio, p.rol, p.problema, p.solucion, p.impacto, p.stack, p.proceso, p.destacado,
      ],
    );
  }

  await podar("proyectos", "slug", idioma, c.proyectos.map((p) => p.slug));

  const clavesComp: string[] = [];
  for (const [i, k] of c.competencias.entries()) {
    clavesComp.push(clave(k.grupo));
    await sql(
      `INSERT INTO competencias (idioma, clave, orden, grupo, icono, claim, detalle, items)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (idioma, clave) DO UPDATE SET
         orden=$3, grupo=$4, icono=$5, claim=$6, detalle=$7, items=$8`,
      [idioma, clave(k.grupo), i, k.grupo, k.icono, k.claim, k.detalle, k.items],
    );
  }

  await podar("competencias", "clave", idioma, clavesComp);

  await sql(
    `INSERT INTO metodologia (idioma, kicker, titulo, intro, fases) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (idioma) DO UPDATE SET kicker=$2, titulo=$3, intro=$4, fases=$5`,
    [
      idioma,
      c.metodologia.kicker,
      c.metodologia.titulo,
      c.metodologia.intro,
      JSON.stringify(c.metodologia.fases),
    ],
  );

  const clavesEdu: string[] = [];
  for (const [i, e] of c.educacion.entries()) {
    clavesEdu.push(clave(e.titulo));
    await sql(
      `INSERT INTO educacion (idioma, clave, orden, titulo, institucion, anio, tipo)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (idioma, clave) DO UPDATE SET
         orden=$3, titulo=$4, institucion=$5, anio=$6, tipo=$7`,
      [idioma, clave(e.titulo), i, e.titulo, e.institucion, e.anio, e.tipo],
    );
  }

  await podar("educacion", "clave", idioma, clavesEdu);

  const clavesLang: string[] = [];
  for (const [i, l] of c.idiomas.entries()) {
    clavesLang.push(clave(l.idioma));
    await sql(
      `INSERT INTO idiomas_hablados (idioma, clave, orden, nombre, nivel, pct)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (idioma, clave) DO UPDATE SET orden=$3, nombre=$4, nivel=$5, pct=$6`,
      [idioma, clave(l.idioma), i, l.idioma, l.nivel, l.pct],
    );
  }

  await podar("idiomas_hablados", "clave", idioma, clavesLang);

  await sql(
    `INSERT INTO caso_estudio (idioma, slug, datos) VALUES ($1,$2,$3)
     ON CONFLICT (idioma, slug) DO UPDATE SET datos=$3, actualizado_en = now()`,
    [idioma, c.casoCollieApp.slug, JSON.stringify(c.casoCollieApp)],
  );

  await sql(
    `INSERT INTO textos_ui (idioma, datos) VALUES ($1,$2)
     ON CONFLICT (idioma) DO UPDATE SET datos=$2, actualizado_en = now()`,
    [idioma, JSON.stringify(UI[idioma])],
  );

  console.log(`  ${idioma}: perfil, manifiesto, ${c.metricas.length} métricas, ` +
    `${c.experiencias.length} experiencias, ${c.proyectos.length} proyectos, ` +
    `${c.competencias.length} competencias, metodología, ${c.educacion.length} formación, ` +
    `${c.idiomas.length} idiomas, caso y textos.`);
}

async function main() {
  console.log("Creando el esquema…");
  const esquema = await readFile(
    path.join(process.cwd(), "src", "db", "esquema.sql"),
    "utf8",
  );
  await pool().query(esquema);

  console.log("Sembrando contenido…");
  await sembrarIdioma("es", es);
  await sembrarIdioma("en", en);

  for (const tema of ["light", "dark"] as const) {
    await sql(
      `INSERT INTO paleta (tema, datos) VALUES ($1,$2)
       ON CONFLICT (tema) DO UPDATE SET datos=$2, actualizado_en = now()`,
      [tema, JSON.stringify(PALETA_BASE[tema])],
    );
  }
  console.log("  paleta: light y dark.");

  // La contraseña sólo se fija si aún no hay ninguna: volver a sembrar no
  // debe revertir una contraseña que se haya cambiado desde el panel.
  const clave_ = process.env.ADMIN_PASSWORD;
  const [ya] = await sql<{ n: string }>("SELECT count(*) AS n FROM admin");
  if (clave_ && ya.n === "0") {
    const sal = randomBytes(16).toString("hex");
    const hash = scryptSync(clave_, sal, 64).toString("hex");
    await sql("INSERT INTO admin (id, hash) VALUES (1, $1)", [`${sal}:${hash}`]);
    console.log("  admin: contraseña fijada desde ADMIN_PASSWORD.");
  } else if (ya.n !== "0") {
    console.log("  admin: ya había contraseña, no se toca.");
  } else {
    console.log("  admin: sin ADMIN_PASSWORD, el panel no dejará entrar.");
  }

  const [{ n }] = await sql<{ n: string }>("SELECT count(*) AS n FROM proyectos");
  console.log(`\nListo. ${n} filas en proyectos (los dos idiomas).`);
  await pool().end();
}

main().catch((e) => {
  console.error("\nLa semilla falló:", e instanceof Error ? e.message : e);
  process.exit(1);
});
