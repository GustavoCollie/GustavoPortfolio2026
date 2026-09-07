import { hayBase, sql } from "@/db/cliente";

/**
 * Sirve una imagen guardada en la base: `/api/imagen/<clave>/<versión>`.
 *
 * La VERSIÓN va en la ruta y no en un `?v=`, aunque como parámetro sería
 * más natural: `next/image` rechaza las URL locales con query string
 * («is using a query string which is not configured in
 * images.localPatterns») y la foto no llega a renderizarse. En la ruta
 * cumple lo mismo sin pedir configuración.
 *
 * Y hace falta alguna forma de versión porque la respuesta se cachea un
 * año como inmutable: sin ella, quien ya hubiera visitado el sitio
 * seguiría viendo la foto anterior después de reemplazarla. La versión
 * es la marca de tiempo de la fila, así que cambia justo cuando cambia
 * la imagen.
 *
 * El segmento sobra para servir —la clave basta— y se ignora. `ETag`
 * cubre las peticiones sin versión.
 */
export async function GET(
  peticion: Request,
  { params }: { params: Promise<{ ruta: string[] }> },
) {
  const { ruta } = await params;
  const clave = ruta?.[0];
  if (!clave) return new Response("Falta la clave", { status: 400 });
  if (!hayBase()) return new Response("Sin base de datos", { status: 404 });

  const filas = await sql<{
    mime: string;
    bytes: Buffer;
    actualizado_en: Date;
  }>("SELECT mime, bytes, actualizado_en FROM imagenes WHERE clave = $1", [clave]);

  const img = filas[0];
  if (!img) return new Response("No encontrada", { status: 404 });

  const etag = `"${clave}-${img.actualizado_en.getTime()}"`;
  if (peticion.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  return new Response(new Uint8Array(img.bytes), {
    headers: {
      "Content-Type": img.mime,
      "Content-Length": String(img.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
    },
  });
}
