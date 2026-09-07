"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Experiencia } from "@/data/content";
import { EASE_CINEMA } from "./kinetics";

/**
 * ─────────────────────────────────────────────────────────────
 *  TRAYECTORIA
 *
 *  Una lista de puestos que se despliega, no un currículum abierto.
 *
 *  Por defecto cada puesto ocupa una línea: periodo, cargo, empresa y
 *  sector. Es lo único que se necesita para hacerse una idea, y permite
 *  recorrer seis años en un vistazo. Lo que se hizo en cada uno está
 *  detrás de un clic, porque el detalle interesa a quien lo busca y
 *  estorba a quien no.
 *
 *  Al pasar por encima, la fila invierte el color: un relleno de tinta
 *  sube desde abajo y el texto pasa a color papel. Es el mismo gesto
 *  que hace la <Escena> con la página entera y la banda de correo con
 *  su bloque — el sitio tiene un solo recurso de énfasis y lo repite a
 *  tres escalas distintas.
 *
 *  El relleno se retira al abrir: sobre tinta plena, un párrafo de
 *  cinco líneas y una lista de logros dejan de leerse.
 * ─────────────────────────────────────────────────────────────
 */

export type TextosTrayectoria = {
  logros: string;
  herramientas: string;
};

export default function Trayectoria({
  items,
  textos,
}: {
  items: readonly Experiencia[];
  textos: TextosTrayectoria;
}) {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <ul>
      {items.map((e) => {
        const id = `${e.empresa}-${e.periodo}`;
        const activo = abierto === id;

        return (
          <li key={id} className="group relative isolate border-t border-line">
            <button
              type="button"
              onClick={() => setAbierto(activo ? null : id)}
              aria-expanded={activo}
              aria-controls={`detalle-${id}`}
              /* En móvil se apila: la fila de escritorio reservaba el ancho
                 natural de «ENE. 2025 — ENE. 2026» a la izquierda y dejaba al
                 cargo tan poco sitio que caía una palabra por línea. El
                 símbolo se ancla arriba a la derecha para no robar más. */
              className="relative flex w-full flex-col items-start gap-1 px-4 py-5 pr-12 text-left md:flex-row md:items-baseline md:gap-8 md:pr-4"
            >
              {/* El relleno sólo sube si la fila está cerrada: ver cabecera. */}
              <span
                aria-hidden
                className={`absolute inset-0 -z-10 origin-bottom bg-ink-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  activo ? "scale-y-0" : "scale-y-0 group-hover:scale-y-100"
                }`}
              />

              <span
                className={`label-mono shrink-0 transition-colors duration-500 md:w-36 ${
                  activo ? "" : "group-hover:text-ink-950"
                }`}
              >
                {e.periodo}
              </span>

              {/* El sector va bajo la fecha en móvil, donde la columna
                  derecha de escritorio no existe. */}
              <span
                className={`label-mono transition-colors duration-500 md:hidden ${
                  activo ? "" : "group-hover:text-ink-950"
                }`}
              >
                {e.sector}
              </span>

              <span className="mt-2 w-full flex-1 md:mt-0 md:w-auto">
                <span
                  className={`block text-[1rem] text-ink-100 transition-colors duration-500 md:text-[1.0625rem] ${
                    activo ? "" : "group-hover:text-ink-950"
                  }`}
                >
                  {e.cargo}
                </span>
                <span
                  className={`block text-[0.875rem] text-ink-400 transition-colors duration-500 ${
                    activo ? "" : "group-hover:text-ink-950/70"
                  }`}
                >
                  {e.empresa}
                </span>
              </span>

              <span
                className={`label-mono hidden shrink-0 transition-colors duration-500 md:block ${
                  activo ? "" : "group-hover:text-ink-950"
                }`}
              >
                {e.sector}
              </span>

              {/* Cruz que gira a «−»: dos filetes, sin icono importado. */}
              <span
                aria-hidden
                className={`absolute top-6 right-4 block h-3 w-3 shrink-0 transition-colors duration-500 md:static md:ml-2 ${
                  activo ? "" : "group-hover:text-ink-950"
                }`}
              >
                <span className="absolute top-1/2 left-0 block h-px w-3 -translate-y-1/2 bg-current" />
                <span
                  className={`absolute top-0 left-1/2 block h-3 w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activo ? "scale-y-0" : "scale-y-100"
                  }`}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {activo && (
                <motion.div
                  id={`detalle-${id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: EASE_CINEMA }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-8 px-4 pt-2 pb-8 md:grid-cols-[1fr_1fr] md:gap-16 md:pl-40">
                    <div>
                      <p className="text-[0.9375rem] leading-relaxed text-ink-300">
                        {e.resumen}
                      </p>
                      <p className="label-mono mt-6 mb-3">
                        {textos.herramientas}
                      </p>
                      <p className="text-[0.875rem] text-ink-400">
                        {e.stack.join(" · ")}
                      </p>
                    </div>

                    <div>
                      <p className="label-mono mb-3">{textos.logros}</p>
                      <ul className="space-y-2.5">
                        {e.logros.map((l) => (
                          <li
                            key={l}
                            className="flex gap-3 text-[0.875rem] leading-relaxed text-ink-300"
                          >
                            <span
                              aria-hidden
                              className="mt-[0.6em] h-px w-3 shrink-0 bg-ink-500"
                            />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
