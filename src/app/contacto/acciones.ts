"use server";

import { perfil } from "@/data/content";
import { hayBase, sql } from "@/db/cliente";
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
 * Deja el mensaje en la tabla `mensajes`. Devuelve si lo consiguió.
 *
 * No lanza nunca: que la base falle no puede tumbar el formulario, sólo
 * quitarle el respaldo. El rol del sitio público tiene INSERT aquí y no
 * SELECT, así que puede dejar mensajes pero no leer los de nadie.
 */
async function guardar(m: {
  nombre: string;
  email: string;
  empresa: string;
  interes: string;
  mensaje: string;
}): Promise<boolean> {
  if (!hayBase()) return false;
  try {
    await sql(
      `INSERT INTO mensajes (nombre, email, empresa, interes, mensaje)
       VALUES ($1, $2, $3, $4, $5)`,
      [m.nombre, m.email, m.empresa || null, m.interes, m.mensaje],
    );
    return true;
  } catch (e) {
    console.error("No se pudo guardar el mensaje de contacto:", e);
    return false;
  }
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

  /* Lo primero es GUARDARLO. El correo puede fallar —una clave caducada,
     el proveedor caído, el dominio sin verificar— y hasta ahora un fallo
     así significaba perder el mensaje: la persona veía «escríbeme
     directo» y casi nadie lo hace. En la base queda pase lo que pase, y
     el panel lo enseña.

     Si la base tampoco está, se sigue: el correo aún puede salir. */
  const guardado = await guardar({ nombre, email, empresa, interes, mensaje });

  const clave = process.env.RESEND_API_KEY;
  const remitente = process.env.RESEND_FROM;

  if (!clave || !remitente) {
    // Guardado pero sin avisar por correo: para quien escribe el mensaje
    // ha llegado, que es la verdad. El aviso es problema del dueño.
    if (guardado) {
      return {
        estado: "ok",
        mensaje: `Mensaje recibido, ${nombre.split(" ")[0]}. Te respondo en menos de 24 h hábiles.`,
      };
    }
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
      return falloDeCorreo(guardado, nombre);
    }

    return {
      estado: "ok",
      mensaje: `Mensaje enviado, ${nombre.split(" ")[0]}. Te respondo en menos de 24 h hábiles.`,
    };
  } catch (e) {
    console.error("Fallo enviando el correo de contacto:", e);
    return falloDeCorreo(guardado, nombre);
  }
}

/**
 * Qué contestar cuando el correo no sale.
 *
 * Si el mensaje quedó guardado, no hay nada que lamentar: llegó. Sólo
 * llegará por el panel en vez de por la bandeja de entrada, y eso a quien
 * escribe ni le va ni le viene. Decirle «no pude enviarlo» cuando sí está
 * guardado lo empujaría a escribir otra vez.
 */
function falloDeCorreo(guardado: boolean, nombre: string): EstadoEnvio {
  if (guardado) {
    return {
      estado: "ok",
      mensaje: `Mensaje recibido, ${nombre.split(" ")[0]}. Te respondo en menos de 24 h hábiles.`,
    };
  }
  return {
    estado: "error",
    mensaje:
      "No pude enviarlo desde aquí. Escríbeme directo al correo y lo vemos.",
  };
}
