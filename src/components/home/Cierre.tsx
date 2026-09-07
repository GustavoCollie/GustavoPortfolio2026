"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ruta, type Idioma } from "@/data/idioma";
import type { Contenido } from "@/db/consultas";
import { CurtainText, useScrollOpacity } from "../kinetics";

/**
 * ─────────────────────────────────────────────────────────────
 *  Acto 03 — Cierre
 *
 *  Dos pantallas en una. La sección mide 240vh y su contenido va
 *  anclado, así que el scroll no la recorre: la revela.
 *
 *  1. TELÓN. Ocupa la pantalla entera y sólo dice tres cosas: que
 *     queda una última, qué se pregunta y que hay que seguir bajando.
 *     Es una pausa deliberada — el resto del sitio va lleno de texto y
 *     aquí no hay nada que leer.
 *  2. CIERRE. El telón sube y debajo estaba, ya montado, el contacto.
 *     No entra: estaba ahí. Por eso el telón se mueve y el fondo no.
 *
 *  El correo son dos líneas apiladas dentro de una máscara de una línea
 *  de alto: al pasar por encima, el bloque sube y la etiqueta se
 *  convierte en la dirección. Es un solo `translate`, sin JavaScript.
 * ─────────────────────────────────────────────────────────────
 */
export default function Cierre({ c, idioma }: { c: Contenido; idioma: Idioma }) {
  const { perfil, textos: t } = c;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // El telón sube entre el 32% y el 58% del recorrido: antes hay tiempo
  // de leerlo, después hay tiempo de usar el contacto sin prisa.
  const telonY = useTransform(scrollYProgress, [0.32, 0.58], ["0%", "-100%"]);
  const introOpacidad = useTransform(scrollYProgress, [0.2, 0.42], [1, 0]);
  const introRef = useScrollOpacity(introOpacidad);

  return (
    <section
      ref={ref}
      id="contacto"
      className="relative h-[240vh]"
      aria-labelledby="cierre-titulo"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ── Cierre (debajo del telón, ya montado) ───────── */}
        <div className="flex h-full flex-col justify-between pt-32 pb-24 md:pt-36 md:pb-28">
          <div className="shell flex items-baseline justify-between gap-6">
            <span className="label-mono text-ink-100">03</span>
            <span className="label-mono">{t.actos.contacto}</span>
          </div>

          <div className="shell">
            <p className="label-mono mb-8">{t.cierre.pregunta}</p>

            <h2
              id="cierre-titulo"
              className="display text-[clamp(2.5rem,10vw,8rem)]"
            >
              {t.cierre.titulo.map((linea, i) => (
                <CurtainText key={linea} delay={i * 0.08}>
                  {linea}
                </CurtainText>
              ))}
            </h2>

            {/* ── Correo ─────────────────────────────────────
                `leading-[1.15]` y la máscara de `1.15em` van juntos: la
                altura de la ventana ES la altura de una línea, así que
                el desplazamiento de media altura deja la segunda
                exactamente donde estaba la primera.

                Al pasar por encima, la banda entera se invierte: un relleno
                de tinta sube desde abajo y el texto pasa a color papel. Es
                el mismo gesto que hace la <Escena> con la página, aplicado
                a un solo elemento — y es lo que convierte una fila de
                contacto en un botón del tamaño de la pantalla.

                `isolate` crea el contexto de apilamiento para que el `-z-10`
                del relleno se quede DENTRO del enlace: sin él, el relleno se
                iría detrás de la sección y no se vería nunca. */}
            <a
              href={`mailto:${perfil.email}`}
              data-cursor={t.cierre.escribir}
              className="group relative isolate mt-12 flex items-center justify-between gap-6 overflow-hidden border-y border-line-2 px-5 py-7 transition-colors duration-500 md:mt-16 md:py-9"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-ink-100 transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
              />

              <span className="block h-[1.15em] overflow-hidden text-[clamp(1.125rem,3.2vw,2.25rem)] leading-[1.15]">
                <span className="flex flex-col transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1/2">
                  <span className="text-ink-400">{t.cierre.empecemos}</span>
                  <span className="text-ink-100 transition-colors duration-500 group-hover:text-ink-950">
                    {perfil.email}
                  </span>
                </span>
              </span>

              <span
                aria-hidden
                className="shrink-0 text-2xl transition-[transform,color] duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-ink-950 md:text-3xl"
              >
                ↗
              </span>
            </a>

            <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3">
              <a
                href={`tel:${perfil.telefonoRaw}`}
                className="subrayado text-[0.9375rem] text-ink-300"
              >
                {perfil.telefono}
              </a>
              <a
                href={perfil.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="subrayado text-[0.9375rem] text-ink-300"
              >
                {perfil.linkedinLabel} <span aria-hidden>↗</span>
              </a>
              <Link
                href={ruta("contacto", idioma)}
                className="subrayado text-[0.9375rem] text-ink-300"
              >
                {t.cierre.formulario}
              </Link>
            </div>
          </div>

          <div className="shell flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <span className="label-mono">{perfil.nombreCorto}</span>
            <span className="label-mono">{perfil.ubicacion}</span>
            <a href="#contenido" className="label-mono hover:text-ink-100">
              {t.cierre.volverArriba}
            </a>
          </div>
        </div>

        {/* ── Telón (encima, se retira) ───────────────────── */}
        <motion.div
          style={{ y: telonY }}
          className="absolute inset-0 z-20 flex flex-col justify-between bg-ink-950 pt-32 pb-24 will-change-transform md:pt-36 md:pb-28"
        >
          <div ref={introRef} className="flex h-full flex-col justify-between">
            <div className="shell">
              <span className="label-mono">{t.cierre.ultimaCosa}</span>
            </div>

            <div className="shell">
              <p className="display text-[clamp(2.5rem,10vw,8rem)]">
                {t.cierre.cuentame.map((linea, i) => (
                  <CurtainText key={linea} delay={i * 0.08}>
                    {linea}
                  </CurtainText>
                ))}
              </p>
            </div>

            <div className="shell">
              <span className="label-mono">{t.cierre.sigueBajando}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

