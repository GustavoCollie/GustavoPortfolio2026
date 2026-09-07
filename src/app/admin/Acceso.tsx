"use client";

import { useActionState } from "react";
import { iniciarSesion } from "./acciones";
import { SESION_INICIAL, type EstadoSesion } from "./tipos";

/**
 * Puerta del panel.
 *
 * Es una clave compartida en cookie, no autenticación de verdad: suficiente
 * para que /admin no quede abierto, y honesto sobre lo que es. En producción
 * el panel además no puede escribir nada, así que el riesgo se limita a ver
 * contenido que ya es público.
 */
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
          Introduce la clave para administrar el contenido y la paleta.
        </p>

        <form action={accion} className="mt-8">
          <label htmlFor="clave" className="label-mono mb-2 block">
            Clave
          </label>
          <input
            id="clave"
            name="clave"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-line-2 bg-ink-950/60 px-4 py-3.5 text-[0.9375rem] text-ink-100 outline-none transition focus:border-ink-100 focus:ring-2 focus:border-ink-100"
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
