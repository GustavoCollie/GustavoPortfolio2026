"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Contenido } from "@/db/consultas";
import { EASE_CINEMA, useScrollOpacity } from "../kinetics";
import { useCarga } from "../Carga";

/**
 * Plano de apertura.
 *
 * Tres palabras. Son el puesto entero: estrategia de negocio, datos y
 * producto digital. El diseño anterior abría con una frase de tres
 * líneas, una foto y dos botones; a tamaño display eso es un párrafo, y
 * un párrafo no es una apertura.
 *
 * El resto de la información (quién, dónde, qué hace, si está
 * disponible) se reparte por las esquinas en cuerpo pequeño: se lee si
 * se busca y no compite con el titular si no.
 *
 * La sección mide 190vh con el contenido anclado: al hacer scroll la
 * cámara atraviesa el plano —escala y se desvanece— en lugar de
 * empujarlo hacia arriba.
 *
 * El fondo lo pone el planisferio de `MapaFondo`, que vive en el layout
 * y acompaña a toda la página.
 */

export default function Hero({ c }: { c: Contenido }) {
  const { perfil, textos: t } = c;
  const listo = useCarga();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const opacidad = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // `opacity` necesita aplicarse a mano (ver useScrollOpacity)
  const planoRef = useScrollOpacity(opacidad);

  return (
    <section ref={ref} className="relative h-[190vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          ref={planoRef}
          style={{ scale, y }}
          className="relative flex h-full flex-col justify-between py-20 will-change-transform md:py-28"
        >
          {/* ── Meta superior ───────────────────────────────── */}
          <Fila retraso={0.1} activo={listo}>
            <div className="shell flex items-baseline justify-between gap-6">
              <span className="label-mono">{perfil.rol}</span>
              <span className="label-mono hidden sm:block">
                {t.hero.portafolio} · {new Date().getFullYear()}
              </span>
            </div>
          </Fila>

          {/* ── Titular ─────────────────────────────────────── */}
          {/* 13vw y no 17: a 390 px de ancho, «ESTRATEGIA» son diez
              caracteres y a 17vw se salía del encuadre. El máximo se
              mantiene, así que en escritorio no cambia nada. */}
          <h1 className="shell display relative text-[clamp(2.25rem,13vw,15rem)]">
            <span className="sr-only">
              {perfil.nombreCorto} — {t.hero.palabras.join(", ")}
            </span>
            {t.hero.palabras.map((palabra, i) => (
              <span
                key={palabra}
                aria-hidden
                className="block overflow-hidden pb-[0.045em]"
              >
                <motion.span
                  className="block will-change-transform"
                  initial={{ y: "112%" }}
                  animate={{ y: listo ? "0%" : "112%" }}
                  transition={{
                    delay: 0.18 + i * 0.11,
                    duration: 1.3,
                    ease: EASE_CINEMA,
                  }}
                >
                  {palabra}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* ── Meta inferior ───────────────────────────────── */}
          <Fila retraso={0.62} activo={listo}>
            <div className="shell grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <p className="max-w-sm text-[0.9375rem] leading-relaxed text-ink-300">
                {perfil.subtitular}
              </p>

              <span className="label-mono hidden justify-self-center md:block">
                {t.hero.explorar}
              </span>

              <div className="flex items-center gap-3 md:justify-self-end">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-ink-100/50 [animation:ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink-100" />
                </span>
                <span className="label-mono">{perfil.disponibilidad}</span>
              </div>
            </div>
          </Fila>
        </motion.div>

      </div>
    </section>
  );
}

/** Bloque de meta que entra cuando el telón de carga se levanta. */
function Fila({
  children,
  retraso,
  activo,
}: {
  children: React.ReactNode;
  retraso: number;
  activo: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={activo ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ delay: retraso, duration: 1, ease: EASE_CINEMA }}
    >
      {children}
    </motion.div>
  );
}
