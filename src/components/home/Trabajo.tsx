"use client";

import Link from "next/link";
import type { Proyecto } from "@/data/content";
import { ruta, type Idioma, type Textos } from "@/data/idioma";
import type { Contenido } from "@/db/consultas";
import { ActoBarra, CurtainText, Reveal } from "../kinetics";
import ProjectVisual from "../ProjectVisual";
import { capturasDe } from "@/lib/capturas";

/**
 * Acto 02 — Trabajo seleccionado.
 *
 * Es la sección principal del sitio: lo demás existe para llegar aquí.
 *
 * Una lista vertical, no una baraja apilada. El apilado del diseño
 * anterior era vistoso pero secuestraba el scroll durante cuatro
 * pantallas y obligaba a ver los proyectos en un orden fijo; una lista
 * deja hojear, comparar y saltarse el que no interesa.
 *
 * Cada proyecto se anuncia con su número y su maqueta a tamaño grande, y
 * sólo después con texto. El orden importa: primero se ve qué es, luego
 * se lee qué resolvió.
 */
export default function Trabajo({ c, idioma }: { c: Contenido; idioma: Idioma }) {
  const { proyectos, textos: t, imagenes } = c;
  const destacados = proyectos.filter((p) => p.destacado);

  return (
    <section id="proyectos" className="py-28 md:py-40">
      <div className="shell">
        <ActoBarra
          index="02"
          nombre={t.actos.trabajo}
          extra={`${String(proyectos.length).padStart(2, "0")} ${t.comun.cuenta}`}
        />

        <h2 className="display mt-14 text-[clamp(2.5rem,9vw,7.5rem)] md:mt-20">
          <CurtainText>{t.comun.proyectos}</CurtainText>
        </h2>
      </div>

      <div className="mt-16 md:mt-24">
        {destacados.map((p, i) => (
          <Fila
            key={p.slug}
            proyecto={p}
            index={i}
            idioma={idioma}
            t={t}
            capturas={capturasDe(imagenes, p.slug)}
          />
        ))}
      </div>

      <div className="shell mt-20">
        <Reveal>
          <Link
            href={ruta("trabajo", idioma)}
            data-cursor={t.comun.abrirArchivo}
            className="group flex items-baseline justify-between gap-6 border-t border-line-2 pt-6"
          >
            <span className="display text-[clamp(1.5rem,4vw,2.75rem)] text-ink-100">
              {t.comun.verTodos}
            </span>
            <span className="text-2xl transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-1">
              ↗
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Fila({
  proyecto,
  index,
  idioma,
  t,
  capturas,
}: {
  proyecto: Proyecto;
  index: number;
  idioma: Idioma;
  t: Textos;
  capturas: { web?: string; movil?: string };
}) {
  const numero = String(index + 1).padStart(2, "0");

  // Los proyectos con caso de estudio escrito llevan directo a leerlo:
  // pasar por la lista de proyectos era un salto de más para acabar
  // pulsando otro enlace con el mismo texto. Los que todavía no tienen
  // caso siguen apuntando a su ficha ampliada en /proyectos.
  const tieneCaso = proyecto.slug === "collie-app";
  const destino = tieneCaso
    ? ruta("caso", idioma)
    : `${ruta("trabajo", idioma)}#${proyecto.slug}`;
  const etiqueta = tieneCaso ? t.comun.leerCaso : t.comun.verCaso;

  return (
    <article className="shell border-t border-line py-14 md:py-20">
      <div className="mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <span className="label-mono text-ink-100">{numero}</span>
        <span className="label-mono">{proyecto.categoria}</span>
        <span className="label-mono ml-auto">{proyecto.anio}</span>
      </div>

      <Link
        href={destino}
        data-cursor={etiqueta}
        aria-label={`${t.comun.verCasoDe} ${proyecto.nombre}`}
        className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink-100"
      >
        <ProjectVisual proyecto={proyecto} capturas={capturas} />
      </Link>

      <div className="mt-10 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div>
          <h3 className="display text-[clamp(2rem,5.5vw,4rem)] text-ink-100">
            <CurtainText>{proyecto.nombre}</CurtainText>
          </h3>
          <Reveal delay={0.08}>
            <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-300">
              {proyecto.tagline}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="space-y-6">
          <div className="border-t border-line pt-4">
            <p className="label-mono mb-2">{t.comun.problema}</p>
            <p className="text-[0.9375rem] leading-relaxed text-ink-400">
              {proyecto.problema}
            </p>
          </div>
          <div className="border-t border-line pt-4">
            <p className="label-mono mb-2">{t.comun.solucion}</p>
            <p className="text-[0.9375rem] leading-relaxed text-ink-300">
              {proyecto.solucion}
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal
        delay={0.16}
        className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-line pt-4"
      >
        <span className="label-mono shrink-0">{t.comun.alcance}</span>
        <p className="max-w-2xl text-[0.875rem] text-ink-400">
          {proyecto.stack.join(" · ")}
        </p>
        <Link
          href={destino}
          className="subrayado ml-auto shrink-0 text-[0.875rem] text-ink-100"
        >
          {etiqueta} <span aria-hidden>↗</span>
        </Link>
      </Reveal>
    </article>
  );
}
