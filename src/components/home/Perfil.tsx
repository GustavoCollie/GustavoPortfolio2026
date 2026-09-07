"use client";

import Link from "next/link";
import { ruta, type Idioma } from "@/data/idioma";
import type { Contenido } from "@/db/consultas";
import {
  ActoBarra,
  Counter,
  Reveal,
  ScrollLitText,
  staggerChild,
  staggerParent,
} from "../kinetics";
import { motion } from "motion/react";

/**
 * Acto 01 — Perfil.
 *
 * Un solo párrafo que se enciende palabra por palabra con el scroll: el
 * lector avanza a la velocidad de la frase. Debajo, lo que sostiene esa
 * frase — tres dominios y cuatro cifras — en cuerpo pequeño y sobre
 * filetes, sin tarjetas ni fondos.
 */
export default function Perfil({ c, idioma }: { c: Contenido; idioma: Idioma }) {
  const { competencias, manifiesto, metricas, textos: t } = c;

  return (
    <section id="perfil" className="py-28 md:py-40">
      <div className="shell">
      <ActoBarra index="01" nombre={t.actos.perfil} extra={manifiesto.kicker} />

      <div className="mt-16 md:mt-24">
        <ScrollLitText
          text={manifiesto.texto}
          className="display-suave max-w-[22ch] text-[clamp(1.75rem,4.6vw,3.75rem)]"
        />
      </div>

      <div className="mt-16 grid gap-10 border-t border-line pt-10 md:mt-24 md:grid-cols-[1fr_auto] md:items-end">
        <Reveal>
          <p className="max-w-lg text-[1.0625rem] leading-relaxed text-ink-300">
            {manifiesto.cierre}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href={ruta("perfil", idioma)}
            className="subrayado inline-flex items-center gap-3 text-[0.9375rem] text-ink-100"
          >
            {t.comun.perfilCompleto}
            <span aria-hidden>↗</span>
          </Link>
        </Reveal>
      </div>

      {/* ── Cifras ────────────────────────────────────────────
          Sin fondos de color ni degradados: sólo el filete superior y
          el salto de escala entre la cifra y su explicación. */}
      <motion.ul
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15% 0px" }}
        className="mt-20 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metricas.map((m) => (
          <motion.li key={m.titulo} variants={staggerChild} className="border-t border-line-2 pt-5">
            <p className="display text-[clamp(2.75rem,6vw,4.5rem)] text-ink-100">
              <Counter to={m.valor} prefix={m.prefijo} suffix={m.sufijo} />
            </p>
            <p className="mt-3 text-[0.9375rem] font-medium text-ink-100">
              {m.titulo}
            </p>
            <p className="mt-2 max-w-[34ch] text-[0.8125rem] leading-relaxed text-ink-400">
              {m.detalle}
            </p>
          </motion.li>
        ))}
      </motion.ul>

      {/* ── Dominios ──────────────────────────────────────── */}
      <div className="mt-24 grid gap-12 md:grid-cols-3 md:gap-8">
        {competencias.map((c, i) => (
          <Reveal key={c.grupo} delay={i * 0.08} className="border-t border-line pt-5">
            <p className="label-mono mb-4">
              {String(i + 1).padStart(2, "0")} · {c.grupo}
            </p>
            <p className="display-suave mb-3 text-[1.375rem] text-ink-100">
              {c.claim}
            </p>
            <p className="mb-6 max-w-[38ch] text-[0.875rem] leading-relaxed text-ink-400">
              {c.detalle}
            </p>
            <ul className="space-y-1.5">
              {c.items.map((item) => (
                <li key={item} className="text-[0.875rem] text-ink-300">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
      </div>
    </section>
  );
}
