import { PROPORCIONES } from "@/lib/capturas";
import Image from "next/image";
import Link from "next/link";
import { ruta, type Idioma } from "@/data/idioma";
import { leerContenido } from "@/db/consultas";
import PageHero from "@/components/PageHero";
import { Reveal } from "@/components/kinetics";
import Trayectoria from "@/components/Trayectoria";

/**
 * Perfil.
 *
 * Absorbe lo que antes eran dos páginas sueltas —Experiencia y
 * Metodología— porque ninguna de las dos se sostenía sola: la
 * trayectoria sin los proyectos es un CV, y la metodología sin la
 * persona es un folleto. La trayectoria va condensada a una línea por
 * puesto y se despliega al pulsarla: el recorrido se lee de un vistazo y
 * el detalle sólo aparece para quien lo busca.
 */
export default async function SobreMi({ idioma }: { idioma: Idioma }) {
  const {
    competencias,
    educacion,
    experiencias,
    idiomas,
    manifiesto,
    metodologia,
    perfil,
    textos: t,
    imagenes,
  } = await leerContenido(idioma);

  return (
    <>
      <PageHero
        index="01"
        seccion={t.perfil.seccion}
        titulo={t.perfil.titulo}
        entrada={manifiesto.texto}
        meta={[
          { etiqueta: t.perfil.base, valor: perfil.ubicacion },
          { etiqueta: t.perfil.rol, valor: perfil.rol },
          { etiqueta: t.perfil.disponibilidad, valor: perfil.disponibilidad },
          { etiqueta: t.perfil.idiomas, valor: t.perfil.idiomasValor },
        ]}
      />

      {/* ── Retrato + cierre del manifiesto ─────────────────── */}
      <section className="shell grid gap-12 border-t border-line py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:py-24">
        <Reveal>
          <figure className="m-0">
            <div
              style={{ aspectRatio: PROPORCIONES.retrato }}
              className="relative overflow-hidden"
            >
              <Image
                src={imagenes.retrato.src}
                alt={imagenes.retrato.alt}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                style={{ objectPosition: imagenes.retrato.foco }}
                className="object-cover grayscale"
                priority
              />
            </div>
            <figcaption className="label-mono mt-4">
              {imagenes.retrato.pie}
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={0.1} className="self-center">
          <p className="display-suave text-[clamp(1.5rem,3.4vw,2.5rem)] text-ink-100">
            {manifiesto.cierre}
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            <a
              href={`mailto:${perfil.email}`}
              className="subrayado text-[0.9375rem] text-ink-300"
            >
              {perfil.email}
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
              href={`${ruta("cv", idioma)}?imprimir=1`}
              className="subrayado text-[0.9375rem] text-ink-300"
            >
              {t.perfil.descargarCv} <span aria-hidden>↗</span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Dominios ────────────────────────────────────────── */}
      <section className="shell border-t border-line py-16 md:py-24">
        <p className="label-mono mb-12">{t.perfil.dominios}</p>
        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {competencias.map((c, i) => (
            <Reveal
              key={c.grupo}
              delay={i * 0.08}
              className="group relative isolate border-t border-line-2 px-4 pt-5 pb-6 transition-colors duration-500"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-ink-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
              />
              <p className="label-mono mb-4">
                {String(i + 1).padStart(2, "0")} · {c.grupo}
              </p>
              <p className="display-suave mb-3 text-[1.375rem] text-ink-100 transition-colors duration-500 group-hover:text-ink-950">
                {c.claim}
              </p>
              <p className="mb-6 max-w-[38ch] text-[0.875rem] leading-relaxed text-ink-400 transition-colors duration-500 group-hover:text-ink-950/70">
                {c.detalle}
              </p>
              <ul className="space-y-1.5">
                {c.items.map((item) => (
                  <li
                    key={item}
                    className="text-[0.875rem] text-ink-300 transition-colors duration-500 group-hover:text-ink-950"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Metodología ─────────────────────────────────────── */}
      <section className="shell border-t border-line py-16 md:py-24">
        <p className="label-mono mb-6">{t.perfil.comoTrabajo}</p>
        <h2 className="display-suave max-w-[18ch] text-[clamp(1.75rem,4.4vw,3.25rem)] text-ink-100">
          {metodologia.titulo}
        </h2>
        <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-300">
          {metodologia.intro}
        </p>

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {metodologia.fases.map((f, i) => (
            <Reveal key={f.n} delay={i * 0.07} className="border-t border-line-2 pt-5">
              <p className="label-mono mb-4">
                {f.n} · {f.nombre}
              </p>
              <p className="display-suave mb-3 text-[1.25rem] text-ink-100">
                {f.claim}
              </p>
              <p className="mb-5 text-[0.875rem] leading-relaxed text-ink-400">
                {f.detalle}
              </p>
              <ul className="space-y-1">
                {f.entregables.map((e) => (
                  <li key={e} className="label-mono text-[0.625rem]">
                    {e}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Trayectoria ─────────────────────────────────────── */}
      <section className="shell border-t border-line py-16 md:py-24">
        <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
          <p className="label-mono">{t.perfil.trayectoria}</p>
          <Link
            href={ruta("trabajo", idioma)}
            className="subrayado text-[0.875rem] text-ink-400 hover:text-ink-100"
          >
            {t.perfil.verProyectos} <span aria-hidden>↗</span>
          </Link>
        </div>

        <Trayectoria
          items={experiencias}
          textos={{
            logros: t.perfil.loQueHice,
            herramientas: t.perfil.herramientas,
          }}
        />
      </section>

      {/* ── Formación e idiomas ─────────────────────────────── */}
      <section className="shell grid gap-12 border-t border-line py-16 md:grid-cols-2 md:gap-16 md:py-24">
        <div>
          <p className="label-mono mb-8">{t.perfil.formacion}</p>
          <ul>
            {educacion.map((e) => (
              <li key={e.titulo} className="border-t border-line py-4">
                <p className="text-[1rem] text-ink-100">{e.titulo}</p>
                <p className="mt-1 text-[0.875rem] text-ink-400">
                  {e.institucion} · {e.anio} · {e.tipo}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-mono mb-8">{t.perfil.idiomas}</p>
          <ul>
            {idiomas.map((l) => (
              <li key={l.idioma} className="border-t border-line py-4">
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
      </section>
    </>
  );
}
