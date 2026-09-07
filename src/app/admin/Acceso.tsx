"use client";

import { useActionState } from "react";
import { iniciarSesion } from "./acciones";
import { SESION_INICIAL, type EstadoSesion } from "./tipos";

/**
 * Puerta del panel.
 *
 * Correo y contraseña, ambos comprobados contra la tabla `admin`. El
 * correo no añade seguridad criptográfica —la contraseña es lo que
 * protege— pero sí evita el ataque más común contra un panel conocido:
 * probar contraseñas sabiendo que el único campo que hay que acertar es
 * ese. Y deja que el navegador guarde la credencial como lo que es.
 *
 * El error es siempre el mismo para los dos campos. Decir «ese correo no
 * es» confirmaría cuáles existen.
 */
/* Los dos campos son idénticos; que lo sean por compartir la constante y
   no por copiarla evita que dentro de un mes uno tenga el foco azul y el
   otro no. */
const CAMPO =
  "w-full rounded-xl border border-line-2 bg-ink-950/60 px-4 py-3.5 text-[16px] text-ink-100 outline-none transition focus:border-ink-100 focus:ring-2";

export default function Acceso() {
  const [estado, accion, enviando] = useActionState<EstadoSesion, FormData>(
    iniciarSesion,
    SESION_INICIAL,
  );

  return (
    <section className="shell flex min-h-[80vh] flex-col justify-center py-32">
      <div className="w-full max-w-md">
        <p className="label-mono mb-4 text-ink-100">Panel</p>
        <h1 className="display text-[clamp(2rem,5vw,3.25rem)] text-ink-100">
          Área privada
        </h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-400">
          Entra con tu correo y contraseña para administrar el contenido y la
          paleta.
        </p>

        <form action={accion} className="mt-8">
          <label htmlFor="email" className="label-mono mb-2 block">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            className={CAMPO}
          />

          <label htmlFor="clave" className="label-mono mt-5 mb-2 block">
            Contraseña
          </label>
          <input
            id="clave"
            name="clave"
            type="password"
            autoComplete="current-password"
            required
            className={CAMPO}
          />
          <button
            type="submit"
            disabled={enviando}
            className="mt-5 rounded-full bg-ink-100 px-7 py-3.5 text-[0.875rem] font-medium text-ink-950 transition hover:bg-accent hover:text-accent-contra disabled:opacity-60"
          >
            {enviando ? "Comprobando…" : "Entrar"}
          </button>
        </form>

        {estado.estado === "error" && (
          <p className="mt-5 text-[0.875rem] text-ink-100">{estado.mensaje}</p>
        )}
      </div>
    </section>
  );
}
