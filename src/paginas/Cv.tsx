import Image from "next/image";
import Link from "next/link";
import { ruta, type Idioma } from "@/data/idioma";
import { leerContenido } from "@/db/consultas";
import BotonImprimir from "@/components/BotonImprimir";
import { TRAZADO_MUNDO } from "@/lib/mapa";

/**
 * ─────────────────────────────────────────────────────────────
 *  CURRÍCULUM
 *
 *  El mismo contenido que el sitio, en formato documento — y con el
 *  MISMO diseño. No es una versión reducida en blanco y negro: usa la
 *  grotesca en versalitas, los actos numerados sobre filete y el papel
 *  gris del sistema. Lo que cambia respecto a la web es la densidad,
 *  no el lenguaje.
 *
 *  Se genera de la base en cada visita, así que no puede quedarse
 *  desfasado respecto al sitio — que era lo que pasaba con el PDF
 *  guardado en `public/`.
 *
 *  La hoja de impresión (globals.css) conserva todo eso en papel; la
 *  clave es `print-color-adjust: exact`, sin la cual el navegador
 *  descarta los fondos y el documento sale blanco.
 * ─────────────────────────────────────────────────────────────
 */
export default async function Cv({ idioma }: { idioma: Idioma }) {
  const {
    competencias,
    educacion,
    experiencias,
    idiomas,
    manifiesto,
    perfil,
    proyectos,
    textos: t,
    imagenes,
  } = await leerContenido(idioma);
  const c = t.perfil.cv;
  const palabras = perfil.nombreCorto.split(" ");

  return (
    <div className="cv shell max-w-[1000px] pt-32 pb-24 md:pt-36">
      {/* Barra de acciones: no se imprime. */}
      <div className="no-imprimir mb-14 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="label-mono">{c.titulo}</p>
          <p className="mt-1 text-[0.8125rem] text-ink-400">{c.nota}</p>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href={ruta("perfil", idioma)}
            className="subrayado text-[0.875rem] text-ink-400 hover:text-ink-100"
          >
            ← {c.volver}
          </Link>
          <BotonImprimir etiqueta={c.imprimir} />
        </div>
      </div>

      {/* ── Cabecera: la misma apertura que el sitio ────────── */}
      <header className="cv-bloque">
        <div className="flex items-baseline justify-between gap-6 border-t border-line-2 pt-4">
          <span className="label-mono text-ink-100">{c.titulo}</span>
          <span className="label-mono">{perfil.rol}</span>
        </div>

        {/* ── Titular sobre el planisferio ────────────────────
            El mapa es el FONDO del nombre, no un bloque debajo: va en
            `absolute` centrado y en `-z-10`, con el titular encima.

            `isolate` es lo que lo hace posible: crea un contexto de
            apilamiento en este div, así que el `-z-10` se queda DENTRO
            y no se cuela detrás del documento entero.

            Va aquí y no de fondo de la página porque el mapa del sitio
            es `fixed`, y un elemento fijo sólo se imprime en la PRIMERA
            página — en la segunda desaparecería y parecería un fallo.
            En el flujo cae siempre donde toca.

            El viewBox recorta los casquetes polares, vacíos y sin
            interés, y deja la banda de latitudes donde está todo. */}
        <div className="relative isolate mt-10 py-4">
          <svg
            aria-hidden
            viewBox="0 28 360 98"
            className="absolute top-1/2 left-0 -z-10 block w-full -translate-y-1/2"
          >
            <g stroke="var(--ink-100)" strokeWidth="0.2" opacity="0.12">
              {[-120, -60, 0, 60, 120].map((lon) => (
                <line key={lon} x1={lon + 180} y1="28" x2={lon + 180} y2="126" />
              ))}
              {[-30, 0, 30].map((lat) => (
                <line key={lat} x1="0" y1={90 - lat} x2="360" y2={90 - lat} />
              ))}
            </g>
            <path d={TRAZADO_MUNDO} fill="var(--ink-100)" opacity="0.18" />
          </svg>

          <h1 className="display text-[clamp(2.75rem,9vw,6rem)]">
            {palabras.map((p) => (
              <span key={p} className="block">
                {p}
              </span>
            ))}
          </h1>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-4 text-[0.875rem] text-ink-400">
          <span>{perfil.ubicacion}</span>
          <a href={`mailto:${perfil.email}`}>{perfil.email}</a>
          <a href={`tel:${perfil.telefonoRaw}`}>{perfil.telefono}</a>
          <a href={perfil.linkedin}>{perfil.linkedinLabel}</a>
        </div>
      </header>

      {/* ── 01 Perfil ───────────────────────────────────────── */}
      <Acto numero="01" nombre={c.perfil}>
        {/* El retrato ocupa la columna derecha, que hasta ahora quedaba
            vacía junto al manifiesto. `items-start` lo alinea con la
            primera línea del texto en vez de estirarlo a lo alto de la
            fila. */}
        <div className="grid items-start gap-8 sm:grid-cols-[1fr_auto] sm:gap-12">
          <div>
            <p className="display-suave max-w-[26ch] text-[clamp(1.375rem,3.2vw,2.125rem)] text-ink-100">
              {manifiesto.texto}
            </p>
            <p className="mt-6 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-400">
              {manifiesto.cierre}
            </p>
          </div>

          <figure className="cv-bloque m-0 w-40 shrink-0 sm:w-44">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={imagenes.retrato.src}
                alt={imagenes.retrato.alt}
                fill
                sizes="176px"
                style={{ objectPosition: imagenes.retrato.foco }}
                className="object-cover grayscale"
              />
            </div>
            <figcaption className="label-mono mt-2">
              {imagenes.retrato.pie}
            </figcaption>
          </figure>
        </div>
      </Acto>

      {/* ── 02 Experiencia ──────────────────────────────────── */}
      <Acto numero="02" nombre={c.experiencia}>
        <div className="space-y-9 print:space-y-0">
          {experiencias.map((e) => (
            <article
              key={`${e.empresa}-${e.periodo}`}
              className="cv-bloque border-t border-line pt-5"
            >
              <div className="mb-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <span className="label-mono">{e.periodo}</span>
                <span className="label-mono ml-auto">{e.sector}</span>
              </div>

              <h3 className="display text-[clamp(1.125rem,2.4vw,1.625rem)] text-ink-100">
                {e.cargo}
              </h3>
              <p className="mt-1 text-[0.9375rem] text-ink-400">{e.empresa}</p>

              {/* Sin `resumen`: en la web es la entradilla del puesto, pero
                  aquí dice lo mismo que los logros de debajo y cuesta una
                  línea por puesto. */}
              <ul className="mt-4 space-y-1.5">
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

              <p className="label-mono mt-4">{e.stack.join(" · ")}</p>
            </article>
          ))}
        </div>
      </Acto>

      {/* ── 03 Proyectos ────────────────────────────────────── */}
      <Acto numero="03" nombre={c.proyectos}>
        <div className="space-y-7 print:space-y-0">
          {proyectos.map((p) => (
            <article key={p.slug} className="cv-bloque border-t border-line pt-5">
              <div className="mb-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <span className="label-mono">{p.categoria}</span>
                <span className="label-mono ml-auto">{p.anio}</span>
              </div>

              <h3 className="display text-[clamp(1.125rem,2.4vw,1.625rem)] text-ink-100">
                {p.nombre}
              </h3>
              <p className="mt-1 text-[0.9375rem] text-ink-400">{p.rol}</p>

              <p className="mt-4 max-w-[76ch] text-[0.9375rem] leading-relaxed text-ink-300">
                {p.solucion}
              </p>

              <ul className="mt-3 space-y-1.5">
                {p.impacto.slice(0, 2).map((im) => (
                  <li
                    key={im}
                    className="flex gap-3 text-[0.875rem] leading-relaxed text-ink-300"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.6em] h-px w-3 shrink-0 bg-ink-500"
                    />
                    {im}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Acto>

      {/* ── 04 Competencias ─────────────────────────────────── */}
      <Acto numero="04" nombre={c.competencias}>
        <div className="grid gap-8 sm:grid-cols-3">
          {competencias.map((k, i) => (
            <div key={k.grupo} className="cv-bloque border-t border-line-2 pt-4">
              <p className="label-mono mb-3">
                {String(i + 1).padStart(2, "0")} · {k.grupo}
              </p>
              <ul className="space-y-1">
                {k.items.map((item) => (
                  <li key={item} className="text-[0.875rem] text-ink-300">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Acto>

      {/* ── 05 Formación e idiomas ──────────────────────────── */}
      <Acto numero="05" nombre={`${c.formacion} · ${c.idiomas}`}>
        <div className="grid gap-10 sm:grid-cols-2">
          <ul>
            {educacion.map((e) => (
              <li key={e.titulo} className="cv-bloque border-t border-line py-4">
                <p className="text-[1rem] text-ink-100">{e.titulo}</p>
                <p className="mt-1 text-[0.875rem] text-ink-400">
                  {e.institucion} · {e.anio} · {e.tipo}
                </p>
              </li>
            ))}
          </ul>
          <ul>
            {idiomas.map((l) => (
              <li key={l.idioma} className="cv-bloque border-t border-line py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[1rem] text-ink-100">{l.idioma}</p>
                  <p className="label-mono">{l.nivel}</p>
                </div>
                <div aria-hidden className="mt-3 h-px w-full bg-line-2">
                  <div className="h-px bg-ink-100" style={{ width: `${l.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Acto>

      <footer className="label-mono mt-14 border-t border-line pt-4">
        {c.generado} ·{" "}
        {new Date().toLocaleDateString(idioma === "es" ? "es-PE" : "en-GB")}
      </footer>
    </div>
  );
}

/**
 * Cabecera de acto: número y nombre sobre un filete de ancho completo.
 * Es exactamente el mismo separador que usa el sitio (`ActoBarra`), sin
 * la animación de entrada, que en un documento no pinta nada.
 */
function Acto({
  numero,
  nombre,
  children,
}: {
  numero: string;
  nombre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <div className="cv-acto mb-8 flex items-baseline gap-6 border-t border-line-2 pt-4">
        <span className="label-mono text-ink-100">{numero}</span>
        <h2 className="label-mono">{nombre}</h2>
      </div>
      {children}
    </section>
  );
}
