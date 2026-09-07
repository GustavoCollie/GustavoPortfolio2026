import Link from "next/link";
import { ruta, type Idioma } from "@/data/idioma";
import { leerContenido } from "@/db/consultas";
import PageHero from "@/components/PageHero";
import ProjectVisual from "@/components/ProjectVisual";
import { capturasDe } from "@/lib/capturas";
import { Reveal } from "@/components/kinetics";

/**
 * Caso en profundidad.
 *
 * Un portafolio con cuatro fichas demuestra que hiciste cosas; un caso
 * que cuenta las decisiones difíciles y lo que salió mal demuestra cómo
 * piensas, que es lo que en realidad se contrata. Por eso la sección
 * más larga es la de decisiones, y cada una lleva la alternativa que se
 * descartó: sin ella, una decisión es sólo una descripción.
 */
export default async function Caso({ idioma }: { idioma: Idioma }) {
  const {
    casoCollieApp: caso,
    proyectos,
    textos: t,
    imagenes,
  } = await leerContenido(idioma);
  const proyecto = proyectos.find((p) => p.slug === caso.slug);

  return (
    <>
      <PageHero
        index="02"
        seccion={t.caso.seccion}
        titulo={caso.titulo}
        entrada={caso.subtitulo}
        meta={[
          { etiqueta: t.comun.rol, valor: caso.rol },
          { etiqueta: t.trabajo.periodo, valor: caso.periodo },
          { etiqueta: t.caso.duracion, valor: caso.duracion },
          { etiqueta: t.comun.plataformas, valor: "Android · iOS · Web" },
        ]}
      />

      {proyecto && (
        <div className="shell border-t border-line pt-16 md:pt-24">
          <ProjectVisual
            proyecto={proyecto}
            capturas={capturasDe(imagenes, proyecto.slug)}
          />
        </div>
      )}

      <Bloque numero="01" titulo={t.caso.bloques.contexto}>
        <div className="max-w-3xl space-y-6">
          {caso.contexto.map((p, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p className="text-[1.0625rem] leading-relaxed text-ink-300">{p}</p>
            </Reveal>
          ))}
        </div>
      </Bloque>

      <Bloque numero="02" titulo={t.caso.bloques.restricciones}>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {caso.restricciones.map((r, i) => (
            <Reveal
              key={r.titulo}
              delay={i * 0.07}
              className="border-t border-line-2 pt-5"
            >
              <p className="display-suave mb-3 text-[1.1875rem] text-ink-100">
                {r.titulo}
              </p>
              <p className="text-[0.875rem] leading-relaxed text-ink-400">
                {r.detalle}
              </p>
            </Reveal>
          ))}
        </div>
      </Bloque>

      <Bloque
        numero="03"
        titulo={t.caso.bloques.decisiones}
        entrada={t.caso.decisionesEntrada}
      >
        <div className="space-y-14">
          {caso.decisiones.map((d, i) => (
            <Reveal
              key={d.titulo}
              delay={i * 0.05}
              className="border-t border-line pt-6"
            >
              <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
                <h3 className="display-suave text-[clamp(1.375rem,3vw,2rem)] text-ink-100">
                  <span className="label-mono mr-4 align-middle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {d.titulo}
                </h3>
                <div className="space-y-5">
                  <div>
                    <p className="label-mono mb-1.5">{t.caso.alternativa}</p>
                    <p className="text-[0.9375rem] leading-relaxed text-ink-500 line-through decoration-ink-600">
                      {d.alternativa}
                    </p>
                  </div>
                  <div>
                    <p className="label-mono mb-1.5">{t.caso.eleccion}</p>
                    <p className="text-[0.9375rem] leading-relaxed text-ink-100">
                      {d.eleccion}
                    </p>
                  </div>
                  <div>
                    <p className="label-mono mb-1.5">{t.caso.porque}</p>
                    <p className="text-[0.9375rem] leading-relaxed text-ink-300">
                      {d.porque}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Bloque>

      <Bloque numero="04" titulo={t.caso.bloques.proceso}>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {caso.fases.map((f, i) => (
            <Reveal
              key={f.n}
              delay={i * 0.07}
              className="border-t border-line-2 pt-5"
            >
              <p className="label-mono mb-4">
                {f.n} · {f.nombre}
              </p>
              <p className="text-[0.875rem] leading-relaxed text-ink-400">
                {f.detalle}
              </p>
            </Reveal>
          ))}
        </div>
      </Bloque>

      <Bloque numero="05" titulo={t.caso.bloques.resultados}>
        <div className="grid gap-14 md:grid-cols-[1fr_1fr] md:gap-16">
          <ul className="space-y-4">
            {caso.resultados.map((r, i) => (
              <Reveal
                as="li"
                key={r}
                delay={i * 0.05}
                y={16}
                className="flex gap-4 border-t border-line pt-4"
              >
                <span className="label-mono shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[1rem] leading-relaxed text-ink-200">
                  {r}
                </span>
              </Reveal>
            ))}
          </ul>

          <div className="grid gap-8 sm:grid-cols-3 md:content-start">
            {caso.cifras.map((c, i) => (
              <Reveal
                key={c.etiqueta}
                delay={i * 0.07}
                className="border-t border-line-2 pt-4"
              >
                <p className="display text-[clamp(2.5rem,5vw,3.75rem)] text-ink-100">
                  {c.valor}
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-400">
                  {c.etiqueta}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Bloque>

      <Bloque numero="06" titulo={t.caso.bloques.aprendizajes}>
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-16">
          {caso.aprendizajes.map((a, i) => (
            <Reveal
              key={a.titulo}
              delay={i * 0.06}
              className="border-t border-line pt-5"
            >
              <p className="display-suave mb-3 text-[1.25rem] text-ink-100">
                {a.titulo}
              </p>
              <p className="text-[0.9375rem] leading-relaxed text-ink-400">
                {a.detalle}
              </p>
            </Reveal>
          ))}
        </div>
      </Bloque>

      <section className="shell border-t border-line-2 py-16 md:py-24">
        <Reveal>
          <Link
            href={ruta("trabajo", idioma)}
            data-cursor={t.comun.volverProyectos}
            className="group flex items-baseline justify-between gap-6"
          >
            <span className="display text-[clamp(1.75rem,5vw,3.5rem)] text-ink-100">
              {t.comun.volverProyectos}
            </span>
            <span className="text-2xl transition-transform duration-500 group-hover:-translate-x-2">
              ←
            </span>
          </Link>
        </Reveal>
      </section>
    </>
  );
}

function Bloque({
  numero,
  titulo,
  entrada,
  children,
}: {
  numero: string;
  titulo: string;
  entrada?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="shell border-t border-line py-16 md:py-24">
      <div className="mb-12 flex flex-wrap items-baseline gap-x-6 gap-y-3 md:mb-16">
        <span className="label-mono text-ink-100">{numero}</span>
        <h2 className="display text-[clamp(1.5rem,4vw,2.75rem)] text-ink-100">
          {titulo}
        </h2>
        {entrada && (
          <p className="w-full max-w-2xl text-[0.9375rem] leading-relaxed text-ink-400 md:mt-2">
            {entrada}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
