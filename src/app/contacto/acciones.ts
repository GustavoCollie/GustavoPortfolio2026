"use server";

import { perfil } from "@/data/content";
import type { EstadoEnvio } from "./tipos";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Quita caracteres de control y recorta.
 *
 * Se filtra por punto de código en vez de con un rango en la expresión
 * regular: un rango de caracteres invisibles en el código fuente es
 * imposible de revisar y fácil de romper al editarlo.
 */
function limpiar(valor: FormDataEntryValue | null, max: number) {
  return Array.from(String(valor ?? ""))
    .filter((c) => {
      const n = c.codePointAt(0) ?? 0;
      return n >= 32 && n !== 127;
    })
    .join("")
    .trim()
    .slice(0, max);
}

/** Igual, pero conservando los saltos de línea del cuerpo del mensaje. */
function limpiarTexto(valor: FormDataEntryValue | null, max: number) {
  return Array.from(String(valor ?? ""))
    .filter((c) => {
      const n = c.codePointAt(0) ?? 0;
      return n === 10 || (n >= 32 && n !== 127);
    })
    .join("")
    .trim()
    .slice(0, max);
}

/**
 * Envía el mensaje del formulario de contacto.
 *
 * Usa la API REST de Resend con `fetch` en lugar del SDK: una dependencia
 * menos, y cambiar de proveedor es reescribir sólo esta función.
 *
 * Si no hay `RESEND_API_KEY` configurada —en local, por ejemplo— devuelve
 * el estado `sin-configurar` y el formulario ofrece el envío por correo
 * normal. Nunca se pierde un mensaje por falta de configuración.
 */
export async function enviarMensaje(
  _previo: EstadoEnvio,
  datos: FormData,
): Promise<EstadoEnvio> {
  // Trampa para bots: campo invisible que una persona nunca rellena.
  if (limpiar(datos.get("web"), 100)) {
    return { estado: "ok", mensaje: "Mensaje enviado. Te respondo pronto." };
  }

  const nombre = limpiar(datos.get("nombre"), 120);
  const email = limpiar(datos.get("email"), 160);
  const empresa = limpiar(datos.get("empresa"), 120);
  const interes = limpiar(datos.get("interes"), 60) || "Consulta";
  const mensaje = limpiarTexto(datos.get("mensaje"), 4000);

  const errores: NonNullable<EstadoEnvio["errores"]> = {};
  if (nombre.length < 2) errores.nombre = "Escribe tu nombre.";
  if (!EMAIL_RE.test(email)) errores.email = "Revisa el correo.";
  if (mensaje.length < 10) errores.mensaje = "Cuéntame un poco más de contexto.";

  if (Object.keys(errores).length > 0) {
    return { estado: "error", mensaje: "Faltan datos por corregir.", errores };
  }

  const clave = process.env.RESEND_API_KEY;
  const remitente = process.env.RESEND_FROM;

  if (!clave || !remitente) {
    return {
      estado: "sin-configurar",
      mensaje:
        "El envío automático aún no está configurado en este entorno. Usa el botón de correo y llega igual.",
    };
  }

  const asunto = `[Portafolio] ${interes}${empresa ? ` — ${empresa}` : ""}`;
  const cuerpo = [
    `Nombre:  ${nombre}`,
    `Correo:  ${email}`,
    empresa ? `Empresa: ${empresa}` : null,
    `Motivo:  ${interes}`,
    "",
    mensaje,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remitente,
        to: [perfil.email],
        reply_to: email,
        subject: asunto,
        text: cuerpo,
      }),
      // Si el proveedor se cuelga, no dejamos al visitante esperando.
      signal: AbortSignal.timeout(10_000),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => "");
      console.error("Resend respondió", respuesta.status, detalle);
      return {
        estado: "error",
        mensaje:
          "No pude enviarlo desde aquí. Escríbeme directo al correo y lo vemos.",
      };
    }

    return {
      estado: "ok",
      mensaje: `Mensaje enviado, ${nombre.split(" ")[0]}. Te respondo en menos de 24 h hábiles.`,
    };
  } catch (e) {
    console.error("Fallo enviando el correo de contacto:", e);
    return {
      estado: "error",
      mensaje:
        "No pude enviarlo desde aquí. Escríbeme directo al correo y lo vemos.",
    };
  }
}
